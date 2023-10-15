import type Stabilizer from './stabilizer';
import { type Point } from '../../tools/brush';
import { assert } from '~/utils/contracts';
import { type BrushSettings } from '../../tools/settings';
import { CurveInterpolator } from 'curve-interpolator';
import { Float32Vector2 } from 'matrixgl';

export default class SmoothedStabilizer implements Stabilizer {
  private currentPoints: Point[];
  private cachedCurve: Point[];

  constructor() {
    this.currentPoints = [];
    this.cachedCurve = [];
  }

  addPoint(p: Point) {
    this.currentPoints.push(p);
  }

  getProcessedCurve(_: Readonly<BrushSettings>): Point[] {
    const processed = addPointsCartmollInterpolation(this.currentPoints, 0.5, 0.2, 0.005);

    this.assertValid();

    return processed;
  }

  async getProcessedCurveAsync(_: Readonly<BrushSettings>): Promise<Point[]> {
    const processed = await addPointsCartmollInterpolationAsync(
      this.currentPoints,
      0.5,
      0.2,
      0.005
    );

    this.assertValid();

    return processed;
  }

  getProcessedCurveWithPoints(
    points: Point[],
    tension: number,
    alpha: number,
    spacing: number
  ): Point[] {
    return addPointsCartmollInterpolation(points, tension, alpha, spacing);
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

function addPointsCartmollInterpolationAsync(
  rawCurve: Point[],
  tension: number,
  alpha: number,
  spacing: number
): Promise<Point[]> {
  return new Promise((r) => {
    if (rawCurve.length <= 1) r(rawCurve);

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

    r(output);
  });
}
