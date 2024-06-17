/* eslint-disable @typescript-eslint/no-empty-interface */
import { Stabilizer } from './stabilizer';
import { type BrushPoint } from '../../toolSystem/tools/brush';
import { assert } from '~/util/general/contracts';

export interface NothingStabilizerSettings {
  type: 'nothing';
}

export default class NothingStabilizer extends Stabilizer {
  private settings: NothingStabilizerSettings;
  private currentPoints: BrushPoint[];

  constructor(settings: NothingStabilizerSettings) {
    super();
    this.settings = settings;
    this.currentPoints = [];
  }

  addPoint(p: BrushPoint) {
    this.currentPoints.push(p);
  }

  getProcessedCurve(): BrushPoint[] {
    return this.currentPoints;
  }

  getProcessedCurveWithPoints(points: BrushPoint[]): BrushPoint[] {
    return points;
  }

  getRawCurve(): BrushPoint[] {
    return this.currentPoints;
  }

  update(deltaTime: number): void {
    throw new Error('Method not implemented.');
  }

  reset() {
    this.currentPoints = [];
  }

  private assertValid() {
    assert(true);
  }
}
