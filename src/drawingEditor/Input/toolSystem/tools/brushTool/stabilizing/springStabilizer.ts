import { Float32Vector2 } from 'matrixgl';
import { type BaseBrushSettings } from '../../../settings/brushSettings';
import { newPoint, type BrushPoint } from '../brushTool';
import { IncrementalStabilizer } from './stabilizer';
import { assert } from '~/util/general/contracts';
import { add, copy } from '~/util/webglWrapper/vector';

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
}

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
//! MAIN CLASS
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

export default class SpringStabilizer extends IncrementalStabilizer {
  settings: SpringStabilizerSettings;
  private head: BrushPoint | null;
  private velocity: Float32Vector2;
  private accumulatedPoints: BrushPoint[];

  constructor(settings: SpringStabilizerSettings, _: BaseBrushSettings) {
    super('spring');
    this.settings = settings;
    this.head = null;
    this.velocity = new Float32Vector2(0, 0);
    this.accumulatedPoints = [];
  }

  addPoint(point: BrushPoint): void {
    if (this.head == null) {
      this.accumulatedPoints = [point];
    }

    this.head = point
  }

  getProcessedCurve(): BrushPoint[] {
    throw new Error('Method not implemented.');
  }

  getRawCurve(): BrushPoint[] {
    throw new Error('Method not implemented.');
  }

  reset(): void {
    this.head = null;
    this.velocity = new Float32Vector2(0, 0);
    this.accumulatedPoints = [];
  }

  update(deltaTime: number): void {
    if (this.head == null) return;

    assert(this.accumulatedPoints.length > 0);

    const last = this.accumulatedPoints[this.accumulatedPoints.length - 1];
    this.velocity.x += (last.position.x - this.head.position.x) * this.settings.springConstant * deltaTime;
    this.velocity.y += (last.position.y - this.head.position.y) * this.settings.springConstant * deltaTime;
    this.velocity.x *= this.settings.friction
    this.velocity.y *= this.settings.friction
    const newPosition = add(copy(last.position), this.velocity)
    this.accumulatedPoints.push(newPoint(newPosition, this.head.pressure))
  }
}
