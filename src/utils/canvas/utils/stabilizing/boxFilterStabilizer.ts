import type Stabilizer from './stabilizer';
import { type Point } from '../../tools/brush';
import { assert, requires } from '~/utils/contracts';
import { add, copy, scale, sub } from '~/utils/web/vector';
import { type BrushSettings } from '../../tools/settings';
import { Float32Vector2 } from 'matrixgl';
import { CurveInterpolator } from 'curve-interpolator';
import { getSpacingFromBrushSettings } from './stabilizer';

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

interface Cache {
  weightsCache: number[];
  cachedSmoothing: number;
  runningSumPointCache: Point[];
  previousRawCurveLength: number;
  sampleExpWeight: (i: number, d: number) => number;
  sampleAvgWeight: (i: number) => Point;
}

export default class BoxFilterStabilizer implements Stabilizer {
  private currentPoints: Point[];
  private cache: Cache;
  private cachedCurve: Point[];

  constructor() {
    this.currentPoints = [];
    this.cachedCurve = [];
    this.cache = {
      weightsCache: [],
      cachedSmoothing: -1,
      runningSumPointCache: [],
      previousRawCurveLength: 0,
      sampleExpWeight(i, d) {
        return this.weightsCache[i * this.cachedSmoothing + d];
      },
      sampleAvgWeight(i) {
          const hi = Math.min(i + this.cachedSmoothing, this.previousRawCurveLength)
          const lo = Math.max(0, i - this.cachedSmoothing)
          const subtraction = sub(copy(this.runningSumPointCache[hi]), this.runningSumPointCache[lo])
          return scale(subtraction, 2 * this.cachedSmoothing + 1)
      },
    };
  }

  addPoint(p: Point) {
    this.currentPoints.push(p);
  }

  getProcessedCurve(settings: Readonly<BrushSettings>): Point[] {
    const processed = process(this.currentPoints, settings, this.cache);
    this.assertValid();

    return processed;
  }

  getProcessedCurveWithPoints(
    points: Point[],
    settings: Readonly<BrushSettings>
  ): Point[] {
    return process(points, settings, this.cache);
  }

  getRawCurve(): Point[] {
    return this.currentPoints;
  }

  reset() {
    this.currentPoints = [];
    this.cachedCurve = [];
  }

  private assertValid() {
    assert(true);
  }
}

function process(
  rawCurve: Point[],
  settings: Readonly<BrushSettings>,
  cache: Cache
): Point[] {
  if (rawCurve.length <= 2) return rawCurve;

  const smoothing = getSmoothingValueFromStabilization(settings.stabilization);
  const spacing = getSpacingFromBrushSettings(settings);
  updateCache(cache, smoothing, rawCurve);

  let boxed = rawCurve;
  for (let i = 0; i < NUM_BOX_FILTERS; i++) {
    boxed = boxFilterExpwa(
      boxed,
      smoothing,
      POINT_IMPORTANCE_FACTOR,
      DISTANCE_TO_STROKE_END_FIXING
    );
    smoothEndpoints(boxed, rawCurve[0], boxed[boxed.length - 1]);
  }

  return addPointsCartmollInterpolation(boxed, SMOOTHER_TENSION, SMOOTHER_ALPHA, spacing);
}

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
  curve: Point[],
  radius: number,
  decayFactor: number,
  distFromEnd: number
): Point[] {
  if (curve.length <= 1) return curve;

  const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(n, min));

  function weight(n: number, r: number): number {
    const distFromEndpoint = Math.min(n, curve.length - 1 - n);

    if (distFromEndpoint <= distFromEnd)
      return calcFactorExp(distFromEndpoint, r, decayFactor, radius, distFromEnd);

    const denominatorForStandardAverage = 1 / (2 * radius + 1);
    return denominatorForStandardAverage;
  }

  const newPoints = [];
  for (let i = 0; i < curve.length - 1; i++) {
    const p = curve[i];

    const avg = scale(copy(p), weight(i, 0));

    for (let r = 1; r <= radius; r++) {
      const lIdx = clamp(i - r, 0, curve.length - 1);
      const rIdx = clamp(i + r, 0, curve.length - 1);

      const scaling = weight(i, r);
      const left = scale(copy(curve[lIdx]), scaling);
      const right = scale(copy(curve[rIdx]), scaling);

      add(avg, left);
      add(avg, right);
    }

    newPoints.push(avg);
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

function smoothEndpoints(boxedCurve: Point[], ogStart: Point, ogEnd: Point) {
  boxedCurve.push(ogEnd);

  if (boxedCurve.length >= 3) {
    const start = carmullRom2D(
      boxedCurve[0],
      boxedCurve[0],
      boxedCurve[1],
      boxedCurve[2],
      10
    );
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
  p1: Point,
  p2: Point,
  p3: Point,
  p4: Point,
  samples: number
): Point[] {
  const [x1, x2, x3, x4] = cartmullRom1D(p1.x, p2.x, p3.x, p4.x);
  const [y1, y2, y3, y4] = cartmullRom1D(p1.y, p2.y, p3.y, p4.y);

  const results = [];
  for (let i = 0; i < samples; i++) {
    const t = (i + 1) / (samples + 1);
    const t2 = t * t;
    const t3 = t2 * t;
    const pos = new Float32Vector2(
      x1 + x2 * t + x3 * t2 + x4 * t3,
      y1 + y2 * t + y3 * t2 + y4 * t3
    );
    results.push(pos);
  }
  return results;
}

function addPointsCartmollInterpolation(
  rawCurve: Point[],
  tension: number,
  alpha: number,
  spacing: number
): Point[] {
  if (rawCurve.length <= 1) return rawCurve;

  const points = rawCurve.map((p) => [p.x, p.y]);
  const interpolator = new CurveInterpolator(points, {
    tension,
    alpha,
  });

  const curveDist = interpolator.getLengthAt(1);
  const numSteps = Math.ceil(curveDist / spacing);

  const output: Point[] = [];
  for (let i = 0; i < numSteps; i++) {
    const parameter = Math.min(1, (spacing * i) / curveDist);
    const point = interpolator.getPointAt(parameter);
    output.push(new Float32Vector2(point[0], point[1]));
  }

  return output;
}

function updateCache(weightsCache: Cache, newSmoothing: number, rawCurve: Point[]) {
  if (weightsCache.cachedSmoothing == newSmoothing) return;

  weightsCache.cachedSmoothing = newSmoothing;
  weightsCache.weightsCache = [];

  for (let i = 0; i <= DISTANCE_TO_STROKE_END_FIXING; i++) {
    for (let d = 0; d <= newSmoothing; d++) {
      weightsCache.weightsCache.push(
        calcFactorExp(
          i,
          d,
          POINT_IMPORTANCE_FACTOR,
          newSmoothing,
          DISTANCE_TO_STROKE_END_FIXING
        )
      );
    }
  }

  let runningSum =
    weightsCache.previousRawCurveLength > 0
      ? weightsCache.runningSumPointCache[weightsCache.runningSumPointCache.length - 1]
      : new Float32Vector2(0, 0);

  for (let i = weightsCache.previousRawCurveLength; i < rawCurve.length; i++) {
    runningSum = add(copy(runningSum), rawCurve[i]);
    weightsCache.runningSumPointCache.push(runningSum);
  }

  weightsCache.previousRawCurveLength = rawCurve.length
}

function getSmoothingValueFromStabilization(stabilization: number): number {
  requires(0 <= stabilization && stabilization <= 1);
  const range = MAX_SMOOTHING - MIN_SMOOTHING;
  return MIN_SMOOTHING + range * stabilization;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function boxFilter(curve: Point[], radius: number): Point[] {
  if (curve.length <= 1) return curve;

  function clamp(n: number, min: number, max: number) {
    return Math.min(max, Math.max(n, min));
  }

  const denominator = 1 / (2 * radius + 1);

  const newPoints = [];
  for (let i = 0; i < curve.length - 1; i++) {
    const p1 = curve[i];

    const avg = copy(p1);
    for (let r = 1; r < radius; r++) {
      const left = curve[clamp(i - r, 0, curve.length - 1)];
      const right = curve[clamp(i + r, 0, curve.length - 1)];
      add(avg, left);
      add(avg, right);
    }
    scale(avg, denominator);
    newPoints.push(avg);
  }

  return newPoints;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function addEndpoints(curve: Point[], numToAdd: number): Point[] {
  const results = [];
  for (let i = 0; i < curve.length - 1; i++) {
    const p0 = i > 0 ? curve[i - 1] : curve[i];
    const p1 = curve[i];
    const p2 = curve[i + 1];
    const p3 = i < curve.length - 2 ? curve[i + 2] : curve[i + 1];

    const distToStart = Math.floor(i / 3);
    const distToEnd = Math.floor((curve.length - 1 - i) / 3);
    const samples = Math.max(0, Math.max(5 - distToStart, 5 - distToEnd));

    if (samples > 0) {
      results.push(...carmullRom2D(p0, p1, p2, p3, samples));
    }
    results.push(copy(p2));
  }
  return results;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function addEndpoints2(curve: Point[], numToAdd: number): Point[] {
  const newShit = [...curve];
  if (curve.length >= 3) {
    // const start = carmullRom2D(newShit[0], newShit[0], newShit[1], newShit[2], numToAdd)
    // newShit.splice(1, 2)
    // newShit.splice(1, 0, ...start)

    const endIdx = curve.length - 3;
    const end = carmullRom2D(
      newShit[endIdx],
      newShit[endIdx + 1],
      newShit[endIdx + 2],
      newShit[endIdx + 2],
      numToAdd
    );
    newShit.splice(endIdx + 1, 2);
    newShit.splice(endIdx + 1, 0, ...end);
  }
  return newShit;
}
