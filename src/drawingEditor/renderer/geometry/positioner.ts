import { Float32Vector2 } from 'matrixgl';

type Identity = {
  type: 'identity';
};

type BottomLeft = {
  type: 'bottomLeft';
  anchorPosition: Float32Vector2;
};

type BottomRight = {
  type: 'bottomRight';
  anchorPosition: Float32Vector2;
};

type TopLeft = {
  type: 'topLeft';
  anchorPosition: Float32Vector2;
};

type TopRight = {
  type: 'topRight';
  anchorPosition: Float32Vector2;
};

type Center = {
  type: 'center';
  anchorPosition: Float32Vector2;
};

type PositionType = Identity | BottomLeft | BottomRight | TopLeft | TopRight | Center;

export class QuadPositioner {
  private positionType: PositionType;

  private constructor(positionType: PositionType) {
    this.positionType = positionType;
  }

  positionPoint(position: Float32Vector2, width: number, height: number): Float32Vector2 {
    const halfWidth = width / 2;
    const halfHeight = height / 2;

    switch (this.positionType.type) {
      case 'identity':
        return position;
      case 'bottomLeft':
        return new Float32Vector2(
          this.positionType.anchorPosition.x + halfWidth + position.x,
          this.positionType.anchorPosition.y + halfHeight + position.y
        );
      case 'bottomRight':
        return new Float32Vector2(
          this.positionType.anchorPosition.x - halfWidth + position.x,
          this.positionType.anchorPosition.y + halfHeight + position.y
        );
      case 'topLeft':
        return new Float32Vector2(
          this.positionType.anchorPosition.x + halfWidth + position.x,
          this.positionType.anchorPosition.y - halfHeight + position.y
        );
      case 'topRight':
        return new Float32Vector2(
          this.positionType.anchorPosition.x - halfWidth + position.x,
          this.positionType.anchorPosition.y - halfHeight + position.y
        );
      case 'center':
        return new Float32Vector2(
          this.positionType.anchorPosition.x + position.x,
          this.positionType.anchorPosition.y + position.y
        );
    }
  }

  getCenter(width: number, height: number): Float32Vector2 {
    const halfWidth = width / 2;
    const halfHeight = height / 2;

    switch (this.positionType.type) {
      case 'identity':
        return new Float32Vector2(0, 0);
      case 'bottomLeft':
        return new Float32Vector2(
          this.positionType.anchorPosition.x + halfWidth,
          this.positionType.anchorPosition.y + halfHeight
        );
      case 'bottomRight':
        return new Float32Vector2(
          this.positionType.anchorPosition.x - halfWidth,
          this.positionType.anchorPosition.y + halfHeight
        );
      case 'topLeft':
        return new Float32Vector2(
          this.positionType.anchorPosition.x + halfWidth,
          this.positionType.anchorPosition.y - halfHeight
        );
      case 'topRight':
        return new Float32Vector2(
          this.positionType.anchorPosition.x - halfWidth,
          this.positionType.anchorPosition.y - halfHeight
        );
      case 'center':
        return new Float32Vector2(
          this.positionType.anchorPosition.x,
          this.positionType.anchorPosition.y 
        );
    }
  }

  static identity(): QuadPositioner {
    return new QuadPositioner({ type: 'identity' });
  }

  static bottomLeft(position: Float32Vector2): QuadPositioner {
    return new QuadPositioner({ type: 'bottomLeft', anchorPosition: position });
  }

  static bottomRight(position: Float32Vector2): QuadPositioner {
    return new QuadPositioner({ type: 'bottomRight', anchorPosition: position });
  }

  static topLeft(position: Float32Vector2): QuadPositioner {
    return new QuadPositioner({ type: 'topLeft', anchorPosition: position });
  }

  static topRight(position: Float32Vector2): QuadPositioner {
    return new QuadPositioner({ type: 'topRight', anchorPosition: position });
  }

  static center(position: Float32Vector2): QuadPositioner {
    return new QuadPositioner({ type: 'center', anchorPosition: position });
  }
}
