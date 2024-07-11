import { Vector2 } from 'matrixgl_fork';

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
  position: Vector2;
  angle: number;
};

type RotationType = Identity | BottomLeft | BottomRight | TopLeft | TopRight | Center | Custom;

export class QuadRotator {
  private rotationType: RotationType;

  private constructor(rotationType: RotationType) {
    this.rotationType = rotationType;
  }

  public rotatePoint(
    position: Vector2,
    quadCenter: Vector2,
    width: number,
    height: number
  ): Vector2 {
    const halfWidth = width / 2;
    const halfHeight = height / 2;

    switch (this.rotationType.type) {
      case 'identity':
        return position;
      case 'bottomLeft':
        return position.rotateAbout(
          new Vector2(-halfWidth, -halfHeight).add(quadCenter),
          this.rotationType.angle
        );
      case 'bottomRight':
        return position.rotateAbout(
          new Vector2(+halfWidth, -halfHeight).add(quadCenter),
          this.rotationType.angle
        );
      case 'topLeft':
        return position.rotateAbout(
          new Vector2(-halfWidth, +halfHeight).add(quadCenter),
          this.rotationType.angle
        );
      case 'topRight':
        return position.rotateAbout(
          new Vector2(+halfWidth, +halfHeight).add(quadCenter),
          this.rotationType.angle
        );
      case 'center':
        return position.rotateAbout(new Vector2(0, 0).add(quadCenter), this.rotationType.angle);
      case 'custom':
        return position.rotateAbout(this.rotationType.position, this.rotationType.angle);
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

  static custom(position: Vector2, angle: number): QuadRotator {
    return new QuadRotator({ type: 'custom', position, angle });
  }
}
