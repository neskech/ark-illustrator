import type Stabilizer from './stabilizer';
import { type BrushPoint, newPoint, type BrushSettings } from '../../toolSystem/tools/brush';
import { assert } from '~/application/general/contracts';
import { CurveInterpolator } from 'curve-interpolator';
import { Float32Vector2 } from 'matrixgl';

export default class SmoothedStabilizer implements Stabilizer {
  private currentPoints: BrushPoint[];
  private cachedCurve: BrushPoint[];

  constructor() {
    this.currentPoints = [];
    this.cachedCurve = [];
  }

  addPoint(p: BrushPoint) {
    this.currentPoints.push(p);
  }

  getProcessedCurve(_: Readonly<BrushSettings>): BrushPoint[] {
    const processed = addPointsCartmollInterpolation(this.currentPoints, 0.5, 0.2, 0.005);

    this.assertValid();

    return processed;
  }

  getProcessedCurveWithPoints(
    points: BrushPoint[],
    tension: number,
    alpha: number,
    spacing: number
  ): BrushPoint[] {
    return addPointsCartmollInterpolation(points, tension, alpha, spacing);
  }

  getRawCurve(): BrushPoint[] {
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
