import { Float32Vector2 } from 'matrixgl';
import { QuadPositioner } from './positioner';
import { QuadRotator } from './rotator';

export class QuadTransform {
  private positioner: QuadPositioner;
  private rotator: QuadRotator;

  private constructor(positioner: QuadPositioner, rotator: QuadRotator) {
    this.positioner = positioner;
    this.rotator = rotator;
  }

  transformPoint(x: number, y: number, width: number, height: number): Float32Vector2 {
    const pos = new Float32Vector2(x, y)
    const p1 = this.positioner.positionPoint(pos, width, height);
    const center = this.positioner.getCenter(width, height);
    const p2 = this.rotator.rotatePoint(p1, center, width, height);
    return p2;
  }

  static identity(): QuadTransform {
    return new QuadTransform(QuadPositioner.identity(), QuadRotator.identity());
  }

  static builder(): QuadTransformBuilderStage1 {
    return new QuadTransformBuilderStage1();
  }

  static create(positioner: QuadPositioner, rotator: QuadRotator) {
    return new QuadTransform(positioner, rotator);
  }
}

class QuadTransformBuilderStage1 {
  position(positioner: QuadPositioner): QuadTransformBuilderStage2 {
    return new QuadTransformBuilderStage2(positioner);
  }
}

class QuadTransformBuilderStage2 {
  private positioner: QuadPositioner;

  constructor(positioner: QuadPositioner) {
    this.positioner = positioner;
  }

  rotate(rotator: QuadRotator): QuadTransformBuilderStage3 {
    return new QuadTransformBuilderStage3(this.positioner, rotator);
  }
}

class QuadTransformBuilderStage3 {
  private positioner: QuadPositioner;
  private rotator: QuadRotator;

  constructor(positioner: QuadPositioner, rotator: QuadRotator) {
    this.positioner = positioner;
    this.rotator = rotator;
  }

  build(): QuadTransform {
    return QuadTransform.create(this.positioner, this.rotator);
  }
}
