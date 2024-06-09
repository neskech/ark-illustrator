import { Float32Vector2 } from "matrixgl";

type PositionType = 'bottomLeft' | 'bottomRight' | 'topLeft' | 'topRight' | 'center';

export class Positioner {
  private positionType: PositionType;
  private anchorPosition: Float32Vector2;

  private constructor(positionType: PositionType, anchor: Float32Vector2) {
    this.positionType = positionType;
    this.anchorPosition = anchor;
  }

  public PositionPoint(width: number, height: number): Float32Vector2 {
    const halfWidth = width / 2;
    const halfHeight = height / 2;

    switch (this.positionType) {
      case 'bottomLeft':
        return new Float32Vector2(
          this.anchorPosition.x + halfWidth,
          this.anchorPosition.y + halfHeight
        );
      case 'bottomRight':
        return new Float32Vector2(
          this.anchorPosition.x - halfWidth,
          this.anchorPosition.y + halfHeight
        );
      case 'topLeft':
        return new Float32Vector2(
          this.anchorPosition.x + halfWidth,
          this.anchorPosition.y - halfHeight
        );
      case 'topRight':
        return new Float32Vector2(
          this.anchorPosition.x - halfWidth,
          this.anchorPosition.y - halfHeight
        );
      case 'center':
        return new Float32Vector2(this.anchorPosition.x, this.anchorPosition.y);
    }
  }

  static BottomLeft(position: Float32Vector2): Positioner {
    return new Positioner('bottomLeft', position);
  }

  static BottomRight(position: Float32Vector2): Positioner {
    return new Positioner('bottomRight', position);
  }

  static TopLeft(position: Float32Vector2): Positioner {
    return new Positioner('topLeft', position);
  }

  static TopRight(position: Float32Vector2): Positioner {
    return new Positioner('topRight', position);
  }

  static Center(position: Float32Vector2): Positioner {
    return new Positioner('center', position);
  }
}
