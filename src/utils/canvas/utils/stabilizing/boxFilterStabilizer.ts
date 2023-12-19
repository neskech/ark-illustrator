import type Stabilizer from './stabilizer';
import { type BrushPoint, newPoint, type BrushSettings } from '../../tools/brush';
import { assert, requires } from '~/utils/contracts';
import { add, copy, scale, sub } from '~/utils/web/vector';
import { Float32Vector2 } from 'matrixgl';
import { CurveInterpolator } from 'curve-interpolator';
import {
  MAX_SIZE_RAW_BRUSH_POINT_ARRAY,
  getNumDeletedElementsFromDeleteFactor,
  getSpacingFromBrushSettings,
  shiftDeleteElements,
} from './stabilizer';
import { incrementalLog, trackRuntime } from '~/utils/misc/benchmarking';
import { allowLimitedStrokeLength } from '~/components/settings';
import EventManager from '~/utils/event/eventManager';

const MAX_SMOOTHING = 20;
const MIN_SMOOTHING = 0;

const SMOOTHER_TENSION = 0;
const SMOOTHER_ALPHA = 1;

/**
 * Number of box filters to apply to the curve
 *
 * More means more smoothing
 */
const NUM_BOX_FILTERS = 3;
/**
 * See box filter expwa (exponentially weighted average)
 *
 * Controls the fallof of the exponential function as points
 * get farther away from the center. This is for use on the
 * endpoints of a curve
 *
 * Increasing this value makes the weights of the average
 * more biased towards the center point, preventing the
 * point from being taken away from its original position
 *
 * It makes the point feel 'important'
 */
const POINT_IMPORTANCE_FACTOR = 10;
/**
 * How many points should we apply this 'importance'
 * to?
 *
 * Obviously we only care about endpoints, so we define
 * this quantity as the distance from an endpoint
 *
 * In this way, the first N points from an endpoint
 * will try and make themselves adhere to their original
 * positions
 */
const DISTANCE_TO_STROKE_END_FIXING = 10;
/**
 * Controls how fast the exponential weights become
 * uniform
 *
 * Uniform weights is simply taking an average. Thus
 * it controls blending between the exponential weighting
 * and the simple average weighting as we get farther
 * from an endpoint
 */
const UNIFORMITY_DECAY_EXPONENT = 4;
/**
 * The fraction of elements to delete off the front of the list
 * when our 'current points' list overflows
 *
 * We want to maintain a small current points list in order to
 * maintain a small computation time for our stabilizing functions
 */
const DELETE_FACTOR = 0.93;

const LOOK_AHEAD = 5

const OPACITY_COMPRESSION = 0.000001

interface Cache {
  weightsCache: number[];
  cachedSmoothing: number;
  runningSumPointCache: Float32Vector2[];
  previousRawCurveLength: number;
}

export default class BoxFilterStabilizer implements Stabilizer {
  private currentPoints: BrushPoint[];
  private numPoints: number;
  private cache: Cache;
  private maxSize: number;

  constructor(settings: Readonly<BrushSettings>) {
    this.maxSize = Math.floor(MAX_SIZE_RAW_BRUSH_POINT_ARRAY(settings) * 0.5);
    //TODO: Add mutation observer on the s

    this.currentPoints = new Array(this.maxSize).map((_) => newPoint(new Float32Vector2(0, 0), 0));
    this.numPoints = 0;

    this.cache = {
      weightsCache: [],
      cachedSmoothing: -1,
      runningSumPointCache: new Array(this.maxSize).map((_) => new Float32Vector2(0, 0)),
      previousRawCurveLength: 0,
    };
  }

  addPoint(p: BrushPoint, settings: Readonly<BrushSettings>) {
    this.currentPoints[this.numPoints] = p;
    this.numPoints += 1;
    if (this.numPoints == this.maxSize) this.handleOverflow(settings);
  }

  getProcessedCurve(settings: Readonly<BrushSettings>): BrushPoint[] {
    requires(this.maxSize > settings.stabilization * 2 + 1);
    const processed = process_(
      this.currentPoints,
      this.numPoints,
      settings,
      this.cache
    ) as BrushPoint[];
    this.assertValid();

    return processed;
  }

  getProcessedCurveWithPoints(
    points: BrushPoint[],
    settings: Readonly<BrushSettings>
  ): BrushPoint[] {
    return process_(points, settings, this.cache) as BrushPoint[];
  }

  getRawCurve(): BrushPoint[] {
    return this.currentPoints.slice(0, this.numPoints);
  }

  reset() {
    this.numPoints = 0;
    this.cache.previousRawCurveLength = 0;
  }

  private handleOverflow(settings: Readonly<BrushSettings>) {
    if (!allowLimitedStrokeLength) {
      this.numPoints = 0
      return
    }

    updateCache(this.cache, this.cache.cachedSmoothing, this.currentPoints, this.numPoints);

    const numDeleted = getNumDeletedElementsFromDeleteFactor(DELETE_FACTOR, this.maxSize);

    const shavedOff = this.currentPoints.slice(0, this.numPoints)
    const processed = process(shavedOff, this.numPoints, settings, this.cache)
    EventManager.invoke('brushStrokCutoff', processed)

    shiftDeleteElements(this.currentPoints, DELETE_FACTOR, this.maxSize);
    this.numPoints -= numDeleted;

    const sumOfAll = this.cache.runningSumPointCache[numDeleted - 1];
    shiftDeleteElements(this.cache.runningSumPointCache, DELETE_FACTOR, this.maxSize);

    for (let i = 0; i < this.numPoints; i++) sub(this.cache.runningSumPointCache[i], sumOfAll);
  }

  private assertValid() {
    assert(true);
  }
}

function process(
  rawCurve: BrushPoint[],
  rawCurveLength: number,
  settings: Readonly<BrushSettings>,
  cache: Cache
): BrushPoint[] {
  if (rawCurveLength <= 2) return rawCurve.slice(0, rawCurveLength);

  const smoothing = getSmoothingValueFromStabilization(settings.stabilization);
  const spacing = getSpacingFromBrushSettings(settings);
  updateCache(cache, smoothing, rawCurve, rawCurveLength);

  let boxed = rawCurve;
  for (let i = 0; i < NUM_BOX_FILTERS; i++) {
    boxed = boxFilterExpwa(
      boxed,
      cache,
      i == 0 ? rawCurveLength : boxed.length,
      smoothing,
      POINT_IMPORTANCE_FACTOR,
      DISTANCE_TO_STROKE_END_FIXING
    );
    smoothEndpoints(boxed, rawCurve[0], boxed[boxed.length - 1]);
  }

  return addPointsCartmollInterpolation3D(boxed, SMOOTHER_TENSION, SMOOTHER_ALPHA, spacing);
}

const process_ = trackRuntime(process, {
  name: 'process',
  logFrequency: incrementalLog(500),
  tenPercentHigh: true,
  tenPercentLow: true,
});

/**
 * The box filter (or blur) in image processing is a method of averaging over a range of pixels. In particular, given an
 * N X N grid of pixels, the box filter simply assigns a new pixel according to that grid's average pixel value
 *
 * \Sum_{i=0}^N \Sum_{j=0}^N P_{i, j} / N^2
 *
 * https://en.wikipedia.org/wiki/Box_blur
 *
 * We take that method as inspiration, but instead applying it to a 1D array of (x, y) points
 *
 * A big issue with this method is that it 'shrinks' down the curve, leaving the position of the curve
 * to diverge away from the mouse. A solution to this problem is to keep the endpoints of the curve
 * from 'shriking' away
 *
 * Intuitively, we want to keep the endpoints from being too 'averaged' with the other points. E.g.
 * The surrounding points should have very little influence, with most of the influence coming from the
 * point itself. This way, the point will for the most part maintain its original position
 *
 * But doing this by itself would create an obvious distinction between the endpoints and the middle
 * portion of the curve which doesn't share that 'self important' behavior. So as we get closer to the
 * middle, our function for computing the 'self importance' should converge to being the same as taking
 * a simple average
 *
 * Below is the definition for the function
 *
 * https://cdn.discordapp.com/attachments/488186879326552084/1162956073163042886/559440854578626565.png?ex=653dd23e&is=652b5d3e&hm=b389bace71d8998923359e6c26cdcfbd0becd827bf31d4a05bffc0fcf985dd7f&
 *
 * We define a parameter 'distFromEnd' that determines how many points from each endpoint we will apply this function
 * to. E.g. distFromEnd = 5 means we apply the function to the first and last 5 points on the curve.  Parameter 'i'
 * is a particular points distance from one of the endpoints of the curve
 *
 * As i approaches 'e', which is the same as distFromEnd, we approach uniformity.
 * That (e - i) / e factor is responsible for that. We approach an exponent equal to 0 which
 * will give us uniform weights
 *
 * Parameter 'r' simply defines the window over which we do the average. We call it the radius
 * Parameter 'd' is the distance from the center point after we start branching out in both
 * directions according to the radius
 *
 * Parameter 'k' is the decay factor. This tells us how 'self important' a point should be. This increases the
 * falloff of the exponential function, making the weight on the middle point even larger and thus making it
 * more likely to maintain its original position
 *
 * This was originally adapted from 'softmax' from ML
 *
 */
function boxFilterExpwa(
  curve: BrushPoint[],
  cache: Cache,
  curveLength: number,
  radius: number,
  decayFactor: number,
  distFromEnd: number
): BrushPoint[] {
  if (curve.length <= 1) return curve;

  const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(n, min));

  function weight(n: number, r: number): number {
    const distFromEndpoint = Math.min(n, curveLength - 1 - n);

    if (distFromEndpoint <= distFromEnd)
      return calcFactorExp(distFromEndpoint, r, decayFactor, radius, distFromEnd); //sampleExpWeight(cache, distFromEndpoint, r)

    const denominatorForStandardAverage = 1 / (2 * radius + 1);
    return denominatorForStandardAverage;
  }

  const newPoints = [];
  for (let i = 0; i < curveLength - 1; i++) {
    const p = curve[i];

    const avg = scale(copy(p.position), weight(i, 0));

    for (let r = 1; r <= radius; r++) {
      const lIdx = clamp(i - r, 0, curveLength - 1);
      const rIdx = clamp(i + r, 0, curveLength - 1);

      const scaling = weight(i, r);
      const left = scale(copy(curve[lIdx].position), scaling);
      const right = scale(copy(curve[rIdx].position), scaling);

      add(avg, left);
      add(avg, right);
    }

    newPoints.push(newPoint(avg, curve[i].pressure));
  }

  return newPoints;
}

function calcFactorExp(i: number, d: number, k: number, r: number, e: number) {
  const decay = (e - i) / e;
  const decayExp = Math.pow(decay, UNIFORMITY_DECAY_EXPONENT);

  let denom = 1;
  for (let d = 1; d <= r; d++) {
    denom += 2 * Math.exp(-d * k * decayExp);
  }

  const numerator = Math.exp(-d * k * decayExp);
  return numerator / denom;
}

function smoothEndpoints(boxedCurve: BrushPoint[], ogStart: BrushPoint, ogEnd: BrushPoint) {
  boxedCurve.push(ogEnd);

  if (boxedCurve.length >= 3) {
    const start = carmullRom2D(boxedCurve[0], boxedCurve[0], boxedCurve[1], boxedCurve[2], 10);
    boxedCurve.splice(1, 0, ...start);

    const endIdx = boxedCurve.length - 3;
    const end = carmullRom2D(
      boxedCurve[endIdx],
      boxedCurve[endIdx + 1],
      boxedCurve[endIdx + 2],
      boxedCurve[endIdx + 2],
      10
    );
    boxedCurve.push(...end);
  }
}

function cartmullRom1D(
  f1: number,
  f2: number,
  f3: number,
  f4: number
): [number, number, number, number] {
  const p1 = f1;
  const p2 = (-f1 + f3) * 0.5;
  const p3 = f1 - 2.5 * f2 + 2 * f3 - 0.5 * f4;
  const p4 = -0.5 * f1 + 1.5 * f2 - 1.5 * f3 + 0.5 * f4;
  return [p1, p2, p3, p4];
}

function carmullRom2D(
  p1: BrushPoint,
  p2: BrushPoint,
  p3: BrushPoint,
  p4: BrushPoint,
  samples: number
): BrushPoint[] {
  const [x1, x2, x3, x4] = cartmullRom1D(
    p1.position.x,
    p2.position.x,
    p3.position.x,
    p4.position.x
  );
  const [y1, y2, y3, y4] = cartmullRom1D(
    p1.position.y,
    p2.position.y,
    p3.position.y,
    p4.position.y
  );
  const [pp1, pp2, pp3, pp4] = cartmullRom1D(p1.pressure, p2.pressure, p3.pressure, p4.pressure);

  const results = [];
  for (let i = 0; i < samples; i++) {
    const t = (i + 1) / (samples + 1);
    const t2 = t * t;
    const t3 = t2 * t;
    const pos = new Float32Vector2(
      x1 + x2 * t + x3 * t2 + x4 * t3,
      y1 + y2 * t + y3 * t2 + y4 * t3
    );
    const pressure = pp1 + pp2 * t + pp3 * t2 + pp4 * t3;
    results.push(newPoint(pos, pressure));
  }
  return results;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function addPointsCartmollInterpolation(
  rawCurve: BrushPoint[],
  tension: number,
  alpha: number,
  spacing: number
): BrushPoint[] {
  if (rawCurve.length <= 1) return rawCurve;

  const points = rawCurve.map((p) => [p.position.x, p.position.y]);
  const interpolator = new CurveInterpolator(points, {
    tension,
    alpha,
  });

  const curveDist = interpolator.getLengthAt(1);
  const numSteps = Math.ceil(curveDist / spacing);

  const output: BrushPoint[] = [];
  for (let i = 0; i < numSteps; i++) {
    const parameter = Math.min(1, (spacing * i) / curveDist);
    const point = interpolator.getPointAt(parameter);
    output.push(newPoint(new Float32Vector2(point[0], point[1]), 1));
  }

  return output;
}

function addPointsCartmollInterpolation3D(
  rawCurve: BrushPoint[],
  tension: number,
  alpha: number,
  spacing: number
): BrushPoint[] {
  if (rawCurve.length <= 1) return rawCurve;

  const points = rawCurve.map((p) => [p.position.x, p.position.y, p.pressure * OPACITY_COMPRESSION]);
  const interpolator = new CurveInterpolator(points, {
    tension,
    alpha,
  });

  const curveDist = interpolator.getLengthAt(1);
  const numSteps = Math.ceil(curveDist / spacing);

  const output: BrushPoint[] = [];
  for (let i = 0; i < numSteps; i++) {
    const parameter = Math.min(1, (spacing * i) / curveDist);
    const point = interpolator.getPointAt(parameter);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    output.push(newPoint(new Float32Vector2(point[0], point[1]), (point[2]! * (1 / OPACITY_COMPRESSION))));
  }

  return output;
}

function updateCache(
  weightsCache: Cache,
  newSmoothing: number,
  rawCurve: BrushPoint[],
  rawCurveLength: number
) {
  if (weightsCache.cachedSmoothing != newSmoothing) {
    weightsCache.cachedSmoothing = newSmoothing;
    weightsCache.weightsCache = [];

    for (let i = 0; i <= DISTANCE_TO_STROKE_END_FIXING; i++) {
      for (let d = 0; d <= newSmoothing; d++) {
        weightsCache.weightsCache.push(
          calcFactorExp(i, d, POINT_IMPORTANCE_FACTOR, newSmoothing, DISTANCE_TO_STROKE_END_FIXING)
        );
      }
    }
  }

  let runningSum =
    weightsCache.previousRawCurveLength > 0
      ? weightsCache.runningSumPointCache[weightsCache.previousRawCurveLength - 1]
      : new Float32Vector2(0, 0);

  for (let i = weightsCache.previousRawCurveLength; i < rawCurveLength; i++) {
    runningSum = add(copy(runningSum), rawCurve[i].position);
    weightsCache.runningSumPointCache[i] = runningSum;
  }

  weightsCache.previousRawCurveLength = rawCurveLength;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function sampleExpWeight(cache: Cache, i: number, d: number): number {
  return cache.weightsCache[i * (cache.cachedSmoothing + 1) + d];
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function sampleAvgWeight(cache: Cache, i: number): Float32Vector2 {
  const n = cache.previousRawCurveLength;

  const hi = Math.min(i + cache.cachedSmoothing, cache.previousRawCurveLength);
  const lo = Math.max(0, i - cache.cachedSmoothing);
  const sum = sub(copy(cache.runningSumPointCache[hi]), cache.runningSumPointCache[lo]);

  const overflowHi = Math.max(i + cache.cachedSmoothing - (n - 1), 0);
  const overflowLo = -Math.min(0, i - cache.cachedSmoothing);

  if (overflowHi > 0) {
    let valueOfLastPoint: Float32Vector2;
    if (n == 1) valueOfLastPoint = copy(cache.runningSumPointCache[0]);
    else
      valueOfLastPoint = sub(
        copy(cache.runningSumPointCache[n - 1]),
        cache.runningSumPointCache[n - 2]
      );

    add(sum, scale(valueOfLastPoint, overflowHi));
  }

  if (overflowLo > 0) {
    const valueOfFirstPoint = copy(cache.runningSumPointCache[0]);
    add(sum, scale(valueOfFirstPoint, overflowLo));
  }

  return scale(sum, 1 / (2 * cache.cachedSmoothing + 1));
}

function getSmoothingValueFromStabilization(stabilization: number): number {
  requires(0 <= stabilization && stabilization <= 1);
  const range = MAX_SMOOTHING - MIN_SMOOTHING;
  return MIN_SMOOTHING + range * stabilization;
}
