import { type BrushPoint, newPoint } from '../brushTool';
import { assert, requires } from '~/util/general/contracts';
import { BatchedStabilizer } from './stabilizer';
import { type BaseBrushSettings } from '../../../settings/brushSettings';
import { type Interpolator } from '../interpolator/interpolator';
import InterpolatorFactory, {
  type InterpolatorSettings,
} from '../interpolator/interpolatorFactory';
import { Vector2 } from 'matrixgl_fork';

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
//! CONSTANTS
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

const MAX_SMOOTHING = 20;
const MIN_SMOOTHING = 0;

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

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
//! TYPE DEFINITIONS
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

export interface BoxFilterStabilizerSettings {
  type: 'box';
  stabilization: number;
  interpolatorSettings: InterpolatorSettings;
}

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
//! MAIN CLASS
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

export default class BoxFilterStabilizer extends BatchedStabilizer {
  private currentPoints: BrushPoint[];
  private context: BrushPoint[];
  private settings: BoxFilterStabilizerSettings;
  private pathLength: number;
  private interpolator: Interpolator;

  constructor(settings: BoxFilterStabilizerSettings, brushSettings: BaseBrushSettings) {
    super('box');

    this.currentPoints = [];
    this.context = [];
    this.settings = settings;
    this.pathLength = 0;

    this.interpolator = InterpolatorFactory.getInterpolatorOfAppropiateType(
      settings.interpolatorSettings,
      brushSettings
    );
  }

  addPoint(point: BrushPoint) {
    this.currentPoints.push(point);

    if (this.currentPoints.length > 1) {
      const before = this.currentPoints[this.currentPoints.length - 2];
      const after = this.currentPoints[this.currentPoints.length - 1];
      const dist = Vector2.distance(before.position, after.position);
      this.pathLength += dist;
    }
  }

  predictSizeOfOutput(): number {
    const upper_bound_factor = 2;
    return this.interpolator.estimateOutputSize(this.pathLength * upper_bound_factor);
  }

  partitionStroke(brushSettings: BaseBrushSettings, maxStrokeSize: number): BrushPoint[] {
    let outputSize = this.predictSizeOfOutput();
    const newPoints = [];
    while (outputSize > maxStrokeSize && this.currentPoints.length > 1) {
      const before = this.currentPoints[this.currentPoints.length - 2];
      const after = this.currentPoints[this.currentPoints.length - 1];
      const dist = Vector2.distance(before.position, after.position);
      this.pathLength -= dist;
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      newPoints.push(this.currentPoints.pop()!);

      outputSize = this.predictSizeOfOutput();
    }

    if (outputSize > maxStrokeSize) assert(false, 'max stroke size is too small');

    const processed = this.getProcessedCurveWithData(
      this.currentPoints,
      this.context,
      brushSettings
    );
    this.context = this.currentPoints;
    this.currentPoints = newPoints.reverse();
    this.pathLength = getPathLength(this.currentPoints);
    return processed;
  }

  getProcessedCurve(brushSettings: BaseBrushSettings): BrushPoint[] {
    const processed = process(this.currentPoints, this.context, this.settings);

    if (this.context.length > 0) {
      const endpoint = this.context[this.context.length - 1];
      return this.interpolator.processWithSingularContext(processed, endpoint, brushSettings);
    }

    return this.interpolator.process(processed, brushSettings);
  }

  getProcessedCurveWithData(
    points: BrushPoint[],
    context: BrushPoint[],
    brushSettings: BaseBrushSettings
  ): BrushPoint[] {
    const processed = process(points, context, this.settings);

    if (context.length > 0) {
      const endpoint = context[context.length - 1];
      return this.interpolator.processWithSingularContext(processed, endpoint, brushSettings);
    }

    return this.interpolator.process(processed, brushSettings);
  }

  reset() {
    this.currentPoints = [];
    this.context = [];
    this.pathLength = 0;
  }
}

function process(
  rawCurve: BrushPoint[],
  context: BrushPoint[],
  settings: BoxFilterStabilizerSettings
): BrushPoint[] {
  if (rawCurve.length <= 2) return rawCurve;

  const smoothing = getSmoothingValueFromStabilization(settings.stabilization);
  const contextCopy = [...context];

  let boxed = rawCurve;
  for (let i = 0; i < NUM_BOX_FILTERS; i++) {
    boxed = boxFilterExpwa(
      boxed,
      context,
      smoothing,
      POINT_IMPORTANCE_FACTOR,
      DISTANCE_TO_STROKE_END_FIXING
    );
    // smoothEndpoints(
    //   boxed,
    //   context.length > 0 ? context[context.length - 1] : rawCurve[0],
    //   boxed[boxed.length - 1]
    // );
  }

  return boxed;
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
  curve: BrushPoint[],
  context: BrushPoint[],
  radius: number,
  decayFactor: number,
  distFromEnd: number
): BrushPoint[] {
  if (curve.length <= 1) return curve;

  const sampleContextIfOut = (index: number, min: number, max: number) => {
    if (index < 0 && 0 <= context.length + index && context.length + index < context.length)
      return context[context.length + index];
    return curve[clamp(index, min, max)];
  };
  const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(n, min));

  function weight(n: number, r: number): number {
    const distFromEndpoint = Math.min(n, curve.length - 1 - n);

    if (distFromEndpoint <= distFromEnd)
      return calcFactorExp(distFromEndpoint, r, decayFactor, radius, distFromEnd); //sampleExpWeight(cache, distFromEndpoint, r)

    const denominatorForStandardAverage = 1 / (2 * radius + 1);
    return denominatorForStandardAverage;
  }

  const newPoints = [];
  for (let i = 0; i < curve.length - 1; i++) {
    const p = curve[i];

    let avg = p.position.mult(weight(i, 0));

    for (let r = 1; r <= radius; r++) {
      const rIdx = clamp(i + r, 0, curve.length - 1);

      const scaling = weight(i, r);
      const left = sampleContextIfOut(i - r, 0, curve.length - 1).position.mult(scaling);
      const right = curve[rIdx].position.mult(scaling);

      avg = avg.add(left).add(right);
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
  boxedCurve.unshift(ogStart);

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
    const pos = new Vector2(x1 + x2 * t + x3 * t2 + x4 * t3, y1 + y2 * t + y3 * t2 + y4 * t3);
    const pressure = pp1 + pp2 * t + pp3 * t2 + pp4 * t3;
    results.push(newPoint(pos, pressure));
  }
  return results;
}

function getPathLength(curve: BrushPoint[]): number {
  let pathLength = 0;
  for (let i = 0; i < curve.length - 1; i++) {
    const before = curve[i];
    const after = curve[i + 1];
    const dist = Vector2.distance(before.position, after.position);
    pathLength += dist;
  }
  return pathLength;
}

function getSmoothingValueFromStabilization(stabilization: number): number {
  requires(0 <= stabilization && stabilization <= 1);
  const range = MAX_SMOOTHING - MIN_SMOOTHING;
  return MIN_SMOOTHING + range * stabilization;
}
