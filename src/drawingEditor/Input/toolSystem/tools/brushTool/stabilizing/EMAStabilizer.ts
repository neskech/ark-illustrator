/* eslint-disable @typescript-eslint/no-empty-interface */
import { IncrementalStabilizer } from './stabilizer';
import { type BrushPoint, newPoint } from '../brushTool';
import { assert } from '~/util/general/contracts';
import { type BaseBrushSettings } from '../../../settings/brushSettings';
import InterpolatorFactory, {
  type InterpolatorSettings,
} from '../interpolator/interpolatorFactory';
import { type Interpolator } from '../interpolator/interpolator';
import { Vector2 } from 'matrixgl_fork';

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
//! TYPE DEFINITIONS
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

export interface EMAStabilizerSettings {
  type: 'exponentialMovingAverage';
  alpha: number;
  interpolatorSettings: InterpolatorSettings;
}

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
//! MAIN CLASS
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

export class EMAStabilizer extends IncrementalStabilizer {
  private settings: EMAStabilizerSettings;
  private outputPoints: BrushPoint[];
  private currentAvg: Vector2 | null;
  private lastOutputPoint: BrushPoint | null;
  private interpolator: Interpolator;

  constructor(settings: EMAStabilizerSettings, brushSettings: BaseBrushSettings) {
    super('exponentialMovingAverage');
    this.settings = settings;
    this.outputPoints = [];
    this.currentAvg = null;
    this.lastOutputPoint = null;
    this.interpolator = InterpolatorFactory.getInterpolatorOfAppropiateType(
      settings.interpolatorSettings,
      brushSettings
    );
  }

  addPoint(p: BrushPoint) {
    if (this.currentAvg == null) this.currentAvg = p.position.clone();

    const old = this.currentAvg;
    const a = this.settings.alpha;
    this.currentAvg = old.mult(1 - a).add(p.position.mult(a));
    this.outputPoints.push(newPoint(this.currentAvg, p.pressure));
  }

  getProcessedCurve(brushSettings: BaseBrushSettings): BrushPoint[] {
    let processed;
    if (this.lastOutputPoint != null)
      processed = this.interpolator.processWithSingularContext(
        this.outputPoints,
        this.lastOutputPoint,
        brushSettings
      );
    else processed = this.interpolator.process(this.outputPoints, brushSettings);

    if (this.outputPoints.length > 0)
      this.lastOutputPoint = this.outputPoints[this.outputPoints.length - 1];
    this.outputPoints = [];

    return processed;
  }

  getProcessedCurveWithPoints(points: BrushPoint[]): BrushPoint[] {
    return points;
  }

  reset() {
    this.outputPoints = [];
    this.currentAvg = null;
    this.lastOutputPoint = null;
  }

  private assertValid() {
    assert(true);
  }
}
