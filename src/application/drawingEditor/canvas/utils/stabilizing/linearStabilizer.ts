import type Stabilizer from './stabilizer';
import { type BrushPoint, newPoint, type BrushSettings } from '../../tools/brush';
import { assert } from '~/application/drawingEditor/contracts';
import { add, copy, scale, sub } from '~/application/drawingEditor/webgl/vector';
import { normalize } from '../../../webgl/vector';

export default class LinearStabilizer implements Stabilizer {
  private currentPoints: BrushPoint[];

  constructor() {
    this.currentPoints = [];
  }

  addPoint(p: BrushPoint) {
    this.currentPoints.push(p);
  }

  getProcessedCurve(_: Readonly<BrushSettings>): BrushPoint[] {
    const processed = addPointsLinearInterpolation(this.currentPoints, 0.005);

    this.assertValid();

    return processed;
  }

  getProcessedCurveWithPoints(points: BrushPoint[], spacing: number): BrushPoint[] {
    return addPointsLinearInterpolation(points, spacing);
  }

  getRawCurve(): BrushPoint[] {
    return this.currentPoints;
  }

  reset() {
    this.currentPoints = [];
  }

  private assertValid() {
    assert(true);
  }
}

function addPointsLinearInterpolation(rawCurve: BrushPoint[], spacing: number): BrushPoint[] {
  if (rawCurve.length <= 1) return rawCurve;

  const newPoints = [];
  for (let i = 0; i < rawCurve.length - 1; i++) {
    const start = rawCurve[i];
    const end = rawCurve[i + 1];

    const displacement = sub(copy(end.position), start.position);
    const distance = displacement.magnitude;
    const direction = normalize(displacement);
    const numPointsAlong = Math.ceil(distance / spacing);

    newPoints.push(start);
    for (let j = 0; j < numPointsAlong - 1; j++) {
      const dist = spacing * (j + 1);
      const along = add(scale(copy(direction), dist), start.position);
      const pressure = linearInterpolate(start.pressure, end.pressure, j / numPointsAlong);
      newPoints.push(newPoint(along, pressure));
    }
    newPoints.push(end);
  }

  return newPoints;
}

function linearInterpolate(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}
