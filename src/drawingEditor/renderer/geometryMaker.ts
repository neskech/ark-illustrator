import { Float32Vector2 } from 'matrixgl';
import { requires } from '~/util/general/contracts';
import { copy, cross, sub } from '../webgl/vector';
import { VertexAttributes, VertexAttributesObject } from '../webgl/vertexAttributes';

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

type AttributeDescriptor<T> = {
  bottomLeft: T,
  bottomRight: T,
  topLeft: T,
  topRight: T
}

type Args<T> = {
  positioner: T,
  width: number,
  
}
/*
  Two ways of doing this. Either make everything a four vertex quad or allow arbitrary shapes
  e.g. hollowed out rectangles

  four vertex allows easy default value to be set for each quad

  We also need an object type that represents a vertex attribute
*/
export class QuadilateralFactory<
  T extends VertexAttributes,
  VertexAttribs extends VertexAttributesObject<T>
> {
  private defaultAttributes: Omit<VertexAttribs, 'position'> | null;

  constructor(defaultAttributes: Omit<VertexAttribs, 'position'> | null = null) {
    this.defaultAttributes = defaultAttributes;
  }

  makeSquare({positioner: Positioner, width: number, height: number, attributes?: AttributeDescriptor<Omit<VertexAttribs, 'position'>>}): number[] {
    // make it around the origin
    const vertices = []
  }
}

export function makeCircle(
  position: Float32Vector2,
  radius: number,
  resolution: number
): Float32Vector2[] {
  requires(resolution >= 3);
  const pointList = [position];

  const thetaStepSize = (2 * Math.PI) / resolution;

  for (let i = 0; i <= resolution; i++) {
    const theta = thetaStepSize * i;
    const x = radius * Math.cos(theta) + position.x;
    const y = radius * Math.sin(theta) + position.y;
    pointList.push(new Float32Vector2(x, y));
  }

  return pointList;
}

export function makeHollowCircle(
  position: Float32Vector2,
  radius: number,
  resolution: number
): Float32Vector2[] {
  requires(resolution >= 3);
  const pointList = [position];

  const thetaStepSize = (2 * Math.PI) / resolution;

  for (let i = 0; i <= resolution; i++) {
    const theta = thetaStepSize * i;
    const x = radius * Math.cos(theta) + position.x;
    const y = radius * Math.sin(theta) + position.y;
    pointList.push(new Float32Vector2(x, y));
  }

  return pointList;
}
