/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Float32Vector2 } from 'matrixgl';
import { type BaseBrushSettings } from '../../../settings/brushSettings';
import { newPoint, type BrushPoint } from '../brushTool';
import { IncrementalStabilizer } from './stabilizer';
import { add, copy } from '~/util/webglWrapper/vector';
import { type Interpolator } from '../interpolator/interpolator';
import InterpolatorFactory, { type InterpolatorSettings } from '../interpolator/interpolatorFactory';

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
//! TYPE DEFINITIONS
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

export interface SpringStabilizerSettings {
  type: 'spring';
  springConstant: number;
  friction: number;
  interpolatorSettings: InterpolatorSettings;
}

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
//! MAIN CLASS
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

export default class SpringStabilizer extends IncrementalStabilizer {
  private settings: SpringStabilizerSettings;
  private head: BrushPoint | null;
  private velocity: Float32Vector2;
  private accumulatedPoints: BrushPoint[];
  private interpolator: Interpolator;
  private lastAddPointTime: number | null;

  constructor(settings: SpringStabilizerSettings, brushSettings: BaseBrushSettings) {
    super('spring');
    this.settings = settings;
    this.head = null;
    this.velocity = new Float32Vector2(0, 0);
    this.accumulatedPoints = [];
    this.interpolator = InterpolatorFactory.getInterpolatorOfAppropiateType(
      settings.interpolatorSettings,
      brushSettings
    );
    this.lastAddPointTime = null;
  }

  addPoint(point: BrushPoint): void {
    if (this.head == null) {
      this.accumulatedPoints = [point];
      this.head = point;
      this.lastAddPointTime = performance.now();
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const deltaTime = (performance.now() - this.lastAddPointTime!) / 1000;
    const last = this.accumulatedPoints[this.accumulatedPoints.length - 1];
    this.velocity.x +=
      (this.head.position.x - last.position.x) * this.settings.springConstant * deltaTime;
    this.velocity.y +=
      (this.head.position.y - last.position.y) * this.settings.springConstant * deltaTime;
    this.velocity.x *= this.settings.friction;
    this.velocity.y *= this.settings.friction;
    const newPosition = add(copy(last.position), this.velocity);
    this.accumulatedPoints.push(newPoint(newPosition, this.head.pressure));

    this.head = point;
    this.lastAddPointTime = performance.now();
  }

  getProcessedCurve(brushSettings: BaseBrushSettings): BrushPoint[] {
    if (this.head == null || this.accumulatedPoints.length == 0) return [];

    const points = this.interpolator.processWithSingularContext(
      this.accumulatedPoints,
      this.accumulatedPoints.at(-1)!,
      brushSettings
    );
    this.accumulatedPoints = [this.accumulatedPoints.pop()!];
    return points;
  }

  getRawCurve(): BrushPoint[] {
    throw new Error('Method not implemented.');
  }

  reset(): void {
    this.head = null;
    this.velocity = new Float32Vector2(0, 0);
    this.accumulatedPoints = [];
    this.lastAddPointTime = null;
  }

  update(): void {
    if (this.head == null || this.accumulatedPoints.length == 0) return;

    const deltaTime = (performance.now() - this.lastAddPointTime!) / 1000;

    const last = this.accumulatedPoints[this.accumulatedPoints.length - 1];
    this.velocity.x +=
      (this.head.position.x - last.position.x) * this.settings.springConstant * deltaTime;
    this.velocity.y +=
      (this.head.position.y - last.position.y) * this.settings.springConstant * deltaTime;
    this.velocity.x *= this.settings.friction;
    this.velocity.y *= this.settings.friction;
    const newPosition = add(copy(last.position), this.velocity);
    this.accumulatedPoints.push(newPoint(newPosition, this.head.pressure));

    this.lastAddPointTime = performance.now();
  }
}
