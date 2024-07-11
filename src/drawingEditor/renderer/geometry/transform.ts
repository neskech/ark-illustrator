import { Vector2 } from 'matrixgl_fork';
import { QuadPositioner } from './positioner';
import { QuadRotator } from './rotator';

export class QuadTransform {
  private positioner: QuadPositioner;
  private rotator: QuadRotator;

  private constructor(positioner: QuadPositioner, rotator: QuadRotator) {
    this.positioner = positioner;
    this.rotator = rotator;
  }

  transformPoint(x: number, y: number, width: number, height: number): Vector2 {
    const pos = new Vector2(x, y);
    const p1 = this.positioner.positionPoint(pos, width, height);
    const center = this.positioner.getCenter(width, height);
    const p2 = this.rotator.rotatePoint(p1, center, width, height);
    return p2;
  }

  static identity(): QuadTransform {
    return new QuadTransform(QuadPositioner.identity(), QuadRotator.identity());
  }

  static builder(): QuadTransformBuilder {
    return new QuadTransformBuilder();
  }

  static create(positioner: QuadPositioner, rotator: QuadRotator) {
    return new QuadTransform(positioner, rotator);
  }
}

class QuadTransformBuilder {
  private positioner: QuadPositioner = QuadPositioner.identity();
  private rotator: QuadRotator = QuadRotator.identity();

  position(positioner: QuadPositioner): QuadTransformBuilder {
    this.positioner = positioner;
    return this;
  }

  rotate(rotator: QuadRotator): QuadTransformBuilder {
    this.rotator = rotator;
    return this;
  }

  build(): QuadTransform {
    return QuadTransform.create(this.positioner, this.rotator);
  }
}
