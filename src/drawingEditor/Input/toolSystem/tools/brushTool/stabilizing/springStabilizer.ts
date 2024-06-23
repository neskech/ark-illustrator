import { type BrushPoint } from '../brushTool';
import { Stabilizer } from './stabilizer';

export interface SpringStabilizerSettings {
  type: 'spring';
}

export default class SpringStabilizer extends Stabilizer {
  settings: SpringStabilizerSettings;

  constructor(settings: SpringStabilizerSettings) {
    super();
    this.settings = settings;
  }

  addPoint(point: BrushPoint): void {
    throw new Error('Method not implemented.');
  }

  getProcessedCurve(): BrushPoint[] {
    throw new Error('Method not implemented.');
  }

  getRawCurve(): BrushPoint[] {
    throw new Error('Method not implemented.');
  }

  reset(): void {
    throw new Error('Method not implemented.');
  }

  update(deltaTime: number): void {
    throw new Error('Method not implemented.');
  }
}
