import { Float32Vector2 } from 'matrixgl';
import { add, rotateAbout } from '~/drawingEditor/webgl/vector';

type Identity = {
  type: 'identity';
};

type BottomLeft = {
  type: 'bottomLeft';
  angle: number;
};

type BottomRight = {
  type: 'bottomRight';
  angle: number;
};

type TopLeft = {
  type: 'topLeft';
  angle: number;
};

type TopRight = {
  type: 'topRight';
  angle: number;
};

type Center = {
  type: 'center';
  angle: number;
};

type Custom = {
  type: 'custom';
  position: Float32Vector2;
  angle: number;
};

type RotationType = Identity | BottomLeft | BottomRight | TopLeft | TopRight | Center | Custom;

export class QuadRotator {
  private rotationType: RotationType;

  private constructor(rotationType: RotationType) {
    this.rotationType = rotationType;
  }

  public rotatePoint(
    position: Float32Vector2,
    quadCenter: Float32Vector2,
    width: number,
    height: number
  ): Float32Vector2 {
    const halfWidth = width / 2;
    const halfHeight = height / 2;

    switch (this.rotationType.type) {
      case 'identity':
        return position;
      case 'bottomLeft':
        return rotateAbout(
          position,
          add(new Float32Vector2(-halfWidth, -halfHeight), quadCenter),
          this.rotationType.angle
        );
      case 'bottomRight':
        return rotateAbout(
          position,
          add(new Float32Vector2(+halfWidth, -halfHeight), quadCenter),
          this.rotationType.angle
        );
      case 'topLeft':
        return rotateAbout(
          position,
          add(new Float32Vector2(-halfWidth, +halfHeight), quadCenter),
          this.rotationType.angle
        );
      case 'topRight':
        return rotateAbout(
          position,
          add(new Float32Vector2(+halfWidth, +halfHeight), quadCenter),
          this.rotationType.angle
        );
      case 'center':
        return rotateAbout(
          position,
          add(new Float32Vector2(0, 0), quadCenter),
          this.rotationType.angle
        );
      case 'custom':
        return rotateAbout(position, this.rotationType.position, this.rotationType.angle);
    }
  }

  static identity(): QuadRotator {
    return new QuadRotator({ type: 'identity' });
  }

  static bottomLeft(angle: number): QuadRotator {
    return new QuadRotator({ type: 'bottomLeft', angle });
  }

  static bottomRight(angle: number): QuadRotator {
    return new QuadRotator({ type: 'bottomRight', angle });
  }

  static topLeft(angle: number): QuadRotator {
    return new QuadRotator({ type: 'topLeft', angle });
  }

  static topRight(angle: number): QuadRotator {
    return new QuadRotator({ type: 'topRight', angle });
  }

  static center(angle: number): QuadRotator {
    return new QuadRotator({ type: 'center', angle });
  }

  static custom(position: Float32Vector2, angle: number): QuadRotator {
    return new QuadRotator({ type: 'custom', position, angle });
  }
}
