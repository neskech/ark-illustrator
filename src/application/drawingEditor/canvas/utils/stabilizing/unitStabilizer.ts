import type Stabilizer from './stabilizer';
import { type BrushPoint, type BrushSettings } from '../../toolSystem/tools/brush';
import { assert } from '~/application/general/contracts';

export default class UnitStabilizer implements Stabilizer {
  private currentPoints: BrushPoint[];

  constructor() {
    this.currentPoints = [];
  }

  addPoint(p: BrushPoint) {
    this.currentPoints.push(p);
  }

  getProcessedCurve(_: Readonly<BrushSettings>): BrushPoint[] {
    return this.currentPoints;
  }

  getProcessedCurveWithPoints(points: BrushPoint[]): BrushPoint[] {
    return points;
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
