import { Float32Vector2 } from 'matrixgl';
import { assert, requires } from '~/util/general/contracts';
import { VertexAttributes, VertexAttributesObject } from '../../webgl/vertexAttributes';
import { Positioner } from './positioner';

type AttributeSet<Attributes> = {
  bottomLeft: Attributes;
  bottomRight: Attributes;
  topRight: Attributes;
  topLeft: Attributes;
};

type SquareArgs<Attributes> = {
  positioner: Positioner;
  width: number;
  height: number;
  attributes?: AttributeSet<Attributes>;
};
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
  private defaultAttributes: AttributeSet<Omit<VertexAttribs, 'position'>> | null;

  constructor(defaultAttributes: AttributeSet<Omit<VertexAttribs, 'position'>> | null = null) {
    this.defaultAttributes = defaultAttributes;
  }

  makeSquare(args: SquareArgs<Omit<VertexAttribs, 'position'>>): number[] {
    const attributes = args.attributes ?? this.defaultAttributes;

    assert(!!attributes, 'no default vertex attributes set');

    // make it around the origin
    const vertices = [];

    //bottom left
    const pos = args.positioner.PositionPoint(args.width, args.height);

    //bottom right

    //top right

    //top left
  }
}
