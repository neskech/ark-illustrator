/* eslint-disable @typescript-eslint/no-empty-interface */
import { IncrementalStabilizer } from './stabilizer';
import { newPoint, type BrushPoint } from '../brushTool';
import { assert } from '~/util/general/contracts';
import { type BaseBrushSettings } from '../../../settings/brushSettings';
import { add, scale } from '~/util/webglWrapper/vector';
import { Float32Vector2 } from 'matrixgl';
import InterpolatorFactory, {
  type InterpolatorSettings,
} from '../interpolator/interpolatorFactory';
import { type Interpolator } from '../interpolator/interpolator';

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
//! TYPE DEFINITIONS
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

export interface MovingAverageStabilizerSettings {
  type: 'movingAverage';
  windowSize: number;
  interpolatorSettings: InterpolatorSettings;
}

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
//! MAIN CLASS
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

export class MovingAverageStabilizer extends IncrementalStabilizer {
  private settings: MovingAverageStabilizerSettings;
  private inputPoints: Float32Vector2[];
  private outputPoints: BrushPoint[];
  private lastOutputPoint: BrushPoint | null;
  private lastRealPoint: BrushPoint | null;
  private interpolator: Interpolator;

  constructor(settings: MovingAverageStabilizerSettings, brushSettings: BaseBrushSettings) {
    super('movingAverage');
    this.settings = settings;
    this.inputPoints = [];
    this.outputPoints = [];
    this.lastOutputPoint = null;
    this.lastRealPoint = null;
    this.interpolator = InterpolatorFactory.getInterpolatorOfAppropiateType(
      settings.interpolatorSettings,
      brushSettings
    );
    document.addEventListener('keydown', (key) => {
      if (key.key == 'q') this.settings.windowSize += 1;
      if (key.key == 'e') this.settings.windowSize -= 1;
      console.log(this.settings.windowSize);
      this.inputPoints = [];
    });
  }

  addPoint(p: BrushPoint) {
    if (this.inputPoints.length >= this.settings.windowSize) this.inputPoints.shift();

    this.lastRealPoint = p;
    this.inputPoints.push(p.position);

    const sum = this.inputPoints.reduce((prev, curr) => add(prev, curr), new Float32Vector2(0, 0));
    const avg = scale(sum, 1 / this.inputPoints.length);
    this.outputPoints.push(newPoint(avg, p.pressure));
  }

  getProcessedCurve(brushSettings: BaseBrushSettings): BrushPoint[] {
    if (this.lastRealPoint != null) {
      //   this.outputPoints.push(this.lastRealPoint)
    }

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
    this.inputPoints = [];
    this.outputPoints = [];
    this.lastOutputPoint = null;
  }

  private assertValid() {
    assert(true);
  }
}
