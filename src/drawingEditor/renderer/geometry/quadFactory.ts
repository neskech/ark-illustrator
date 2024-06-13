import { assert, assertNotNull } from '~/util/general/contracts';
import {
  type AttributesObject,
  type VertexAttributes,
  type VertexAttributesObject,
} from '../../webgl/vertexAttributes';
import { QuadPositioner } from './positioner';
import { type Float32Vector2 } from 'matrixgl';
import { QuadTransform } from './transform';
import { add, angle, displacement, normalize, scale } from '~/drawingEditor/webgl/vector';
import { QuadRotator } from './rotator';

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
//! TYPE DEFINITIONS
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

type AttribSet<Attributes> = {
  bottomLeft: Omit<Attributes, 'position'>;
  bottomRight: Omit<Attributes, 'position'>;
  topRight: Omit<Attributes, 'position'>;
  topLeft: Omit<Attributes, 'position'>;
};

type PartialAttribSet<Attributes> = {
  bottomLeft?: Partial<Omit<Attributes, 'position'>>;
  bottomRight?: Partial<Omit<Attributes, 'position'>>;
  topRight?: Partial<Omit<Attributes, 'position'>>;
  topLeft?: Partial<Omit<Attributes, 'position'>>;
};

type Positions = {
  bottomLeft: Float32Vector2;
  bottomRight: Float32Vector2;
  topRight: Float32Vector2;
  topLeft: Float32Vector2;
};

type RectangleArgs<T extends AttributesObject> = {
  transform: QuadTransform;
  width: number;
  height: number;
  attributes?: PartialAttributes<T>;
};

type SquareArgs<T extends AttributesObject> = {
  transform: QuadTransform;
  size: number;
  attributes?: PartialAttributes<T>;
};

type QuadilateralArgs<T extends AttributesObject> = {
  positions: Positions;
  attributes?: PartialAttributes<T>;
};

type LineArgs<T extends AttributesObject> = {
  start: Float32Vector2;
  end: Float32Vector2;
  thickness: number;
  attributes?: PartialAttributes<T>;
};

type EmplaceRectangleArgs<T extends AttributesObject> = {
  buffer: Float32Array;
  offset: number;
  transform: QuadTransform;
  width: number;
  height: number;
  attributes?: PartialAttributes<T>;
};

type EmplaceSquareArgs<T extends AttributesObject> = {
  buffer: Float32Array;
  offset: number;
  transform: QuadTransform;
  size: number;
  attributes?: PartialAttributes<T>;
};

type EmplaceQuadilateralArgs<T extends AttributesObject> = {
  buffer: Float32Array;
  offset: number;
  positions: Positions;
  attributes?: PartialAttributes<T>;
};

type EmplaceLineArgs<T extends AttributesObject> = {
  buffer: Float32Array;
  offset: number;
  start: Float32Vector2;
  end: Float32Vector2;
  thickness: number;
  attributes?: PartialAttributes<T>;
};

type Attributes<T extends AttributesObject> = AttribSet<VertexAttributesObject<T>>;
type PartialAttributes<T extends AttributesObject> = PartialAttribSet<VertexAttributesObject<T>>;

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
//! MAIN CODE
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

export class QuadilateralFactory<T extends AttributesObject> {
  private defaultAttributes: PartialAttributes<T> | null;
  private vertexAttributes: VertexAttributes<T>;

  constructor(
    vertexAttributes: VertexAttributes<T>,
    defaultAttributes: PartialAttributes<T> | null = null
  ) {
    this.vertexAttributes = vertexAttributes;
    this.defaultAttributes = defaultAttributes;
    this.assertValid();
  }

  private assertValid() {
    const attributes = this.vertexAttributes.orderedAttributes();
    const positionProperty = attributes.findOption((v) => v.name.toLowerCase() == 'position');

    if (positionProperty.isNone()) assert(false, 'vertex attributes must have position property');
    if (positionProperty.unwrap().attribute.count() != 2)
      assert(false, 'position property must be of length 2');
    if (attributes[0].name != 'position')
      assert(false, 'position property must be the first attribute');
  }

  makeRectangle(args: RectangleArgs<T>): number[] {
    let attributes;
    if (args.attributes != null && this.defaultAttributes != null)
      attributes = joinPartialAttributeSets(
        this.vertexAttributes,
        args.attributes,
        this.defaultAttributes
      );
    else attributes = args.attributes ?? this.defaultAttributes;

    assertNotNull(attributes);
    assertIsFullAttributeSet(this.vertexAttributes, attributes);

    const vertices = [];

    const halfWidth = args.width / 2;
    const halfHeight = args.height / 2;

    /* 6 non indexed vertices. Top right, top left, bottom left || bottom left, bottom right, top right */

    /* Triangle 1 */

    let pos = args.transform.transformPoint(+halfWidth, +halfHeight, args.width, args.height);
    let fullAttribs = makeFullAttributes(attributes.topRight, pos);
    vertices.push(...this.vertexAttributes.attributesObjectToList(fullAttribs));

    pos = args.transform.transformPoint(-halfWidth, +halfHeight, args.width, args.height);
    fullAttribs = makeFullAttributes(attributes.topLeft, pos);
    vertices.push(...this.vertexAttributes.attributesObjectToList(fullAttribs));

    pos = args.transform.transformPoint(-halfWidth, -halfHeight, args.width, args.height);
    fullAttribs = makeFullAttributes(attributes.bottomLeft, pos);
    vertices.push(...this.vertexAttributes.attributesObjectToList(fullAttribs));

    /* Triangle 2 */

    pos = args.transform.transformPoint(-halfWidth, -halfHeight, args.width, args.height);
    fullAttribs = makeFullAttributes(attributes.bottomLeft, pos);
    vertices.push(...this.vertexAttributes.attributesObjectToList(fullAttribs));

    pos = args.transform.transformPoint(+halfWidth, -halfHeight, args.width, args.height);
    fullAttribs = makeFullAttributes(attributes.bottomRight, pos);
    vertices.push(...this.vertexAttributes.attributesObjectToList(fullAttribs));

    pos = args.transform.transformPoint(+halfWidth, +halfHeight, args.width, args.height);
    fullAttribs = makeFullAttributes(attributes.topRight, pos);
    vertices.push(...this.vertexAttributes.attributesObjectToList(fullAttribs));

    return vertices;
  }

  makeSquare(args: SquareArgs<T>): number[] {
    return this.makeRectangle({ width: args.size, height: args.size, ...args });
  }

  makeQuadilateral(args: QuadilateralArgs<T>): number[] {
    let attributes;
    if (args.attributes != null && this.defaultAttributes != null)
      attributes = joinPartialAttributeSets(
        this.vertexAttributes,
        args.attributes,
        this.defaultAttributes
      );
    else attributes = args.attributes ?? this.defaultAttributes;

    assertNotNull(attributes);
    assertIsFullAttributeSet(this.vertexAttributes, attributes);

    const vertices = [];

    /* 6 non indexed vertices. Top right, top left, bottom left || bottom left, bottom right, top right */

    /* Triangle 1 */

    let fullAttribs = makeFullAttributes(attributes.topRight, args.positions.topLeft);
    vertices.push(...this.vertexAttributes.attributesObjectToList(fullAttribs));

    fullAttribs = makeFullAttributes(attributes.topLeft, args.positions.topRight);
    vertices.push(...this.vertexAttributes.attributesObjectToList(fullAttribs));

    fullAttribs = makeFullAttributes(attributes.bottomLeft, args.positions.bottomLeft);
    vertices.push(...this.vertexAttributes.attributesObjectToList(fullAttribs));

    /* Triangle 2 */

    fullAttribs = makeFullAttributes(attributes.bottomLeft, args.positions.bottomRight);
    vertices.push(...this.vertexAttributes.attributesObjectToList(fullAttribs));

    fullAttribs = makeFullAttributes(attributes.bottomRight, args.positions.bottomLeft);
    vertices.push(...this.vertexAttributes.attributesObjectToList(fullAttribs));

    fullAttribs = makeFullAttributes(attributes.topRight, args.positions.topLeft);
    vertices.push(...this.vertexAttributes.attributesObjectToList(fullAttribs));

    return vertices;
  }

  makeLine(args: LineArgs<T>): number[] {
    const disp = displacement(args.start, args.end);
    const height = disp.magnitude / 2;
    const center = add(args.start, scale(normalize(disp), height));
    const theta = angle(disp);
    const width = args.thickness;

    const transform = QuadTransform.builder()
      .position(QuadPositioner.center(center))
      .rotate(QuadRotator.center(theta))
      .build();
    return this.makeRectangle({ transform, width, height, attributes: args.attributes });
  }

  ////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////
  //! EMPLACE VARIANTS
  ////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////

  emplaceRectangle(args: EmplaceRectangleArgs<T>): number {
    let attributes;
    if (args.attributes != null && this.defaultAttributes != null)
      attributes = joinPartialAttributeSets(
        this.vertexAttributes,
        args.attributes,
        this.defaultAttributes
      );
    else attributes = args.attributes ?? this.defaultAttributes;

    assertNotNull(attributes);
    assertIsFullAttributeSet(this.vertexAttributes, attributes);

    const halfWidth = args.width / 2;
    const halfHeight = args.height / 2;

    /* 6 non indexed vertices. Top right, top left, bottom left || bottom left, bottom right, top right */

    /* Triangle 1 */
    let offset = args.offset;

    let pos = args.transform.transformPoint(+halfWidth, +halfHeight, args.width, args.height);
    let fullAttribs = makeFullAttributes(attributes.topRight, pos);
    offset = this.vertexAttributes.emplaceAttributesObject(fullAttribs, args.buffer, offset);

    pos = args.transform.transformPoint(-halfWidth, +halfHeight, args.width, args.height);
    fullAttribs = makeFullAttributes(attributes.topLeft, pos);
    offset = this.vertexAttributes.emplaceAttributesObject(fullAttribs, args.buffer, offset);

    pos = args.transform.transformPoint(-halfWidth, -halfHeight, args.width, args.height);
    fullAttribs = makeFullAttributes(attributes.bottomLeft, pos);
    offset = this.vertexAttributes.emplaceAttributesObject(fullAttribs, args.buffer, offset);

    /* Triangle 2 */

    pos = args.transform.transformPoint(-halfWidth, -halfHeight, args.width, args.height);
    fullAttribs = makeFullAttributes(attributes.bottomLeft, pos);
    offset = this.vertexAttributes.emplaceAttributesObject(fullAttribs, args.buffer, offset);

    pos = args.transform.transformPoint(+halfWidth, -halfHeight, args.width, args.height);
    fullAttribs = makeFullAttributes(attributes.bottomRight, pos);
    offset = this.vertexAttributes.emplaceAttributesObject(fullAttribs, args.buffer, offset);

    pos = args.transform.transformPoint(+halfWidth, +halfHeight, args.width, args.height);
    fullAttribs = makeFullAttributes(attributes.topRight, pos);
    offset = this.vertexAttributes.emplaceAttributesObject(fullAttribs, args.buffer, offset);

    return offset;
  }

  emplaceSquare(args: EmplaceSquareArgs<T>): number {
    return this.emplaceRectangle({ width: args.size, height: args.size, ...args });
  }

  emplaceQuadilateral(args: EmplaceQuadilateralArgs<T>): number {
    let attributes;
    if (args.attributes != null && this.defaultAttributes != null)
      attributes = joinPartialAttributeSets(
        this.vertexAttributes,
        args.attributes,
        this.defaultAttributes
      );
    else attributes = args.attributes ?? this.defaultAttributes;

    assertNotNull(attributes);
    assertIsFullAttributeSet(this.vertexAttributes, attributes);

    /* 6 non indexed vertices. Top right, top left, bottom left || bottom left, bottom right, top right */

    /* Triangle 1 */
    let offset = args.offset;

    let fullAttribs = makeFullAttributes(attributes.topLeft, args.positions.topRight);
    offset = this.vertexAttributes.emplaceAttributesObject(fullAttribs, args.buffer, offset);

    fullAttribs = makeFullAttributes(attributes.topRight, args.positions.topLeft);
    offset = this.vertexAttributes.emplaceAttributesObject(fullAttribs, args.buffer, offset);

    fullAttribs = makeFullAttributes(attributes.bottomLeft, args.positions.bottomLeft);
    offset = this.vertexAttributes.emplaceAttributesObject(fullAttribs, args.buffer, offset);

    /* Triangle 2 */

    fullAttribs = makeFullAttributes(attributes.bottomRight, args.positions.bottomLeft);
    offset = this.vertexAttributes.emplaceAttributesObject(fullAttribs, args.buffer, offset);

    fullAttribs = makeFullAttributes(attributes.bottomLeft, args.positions.bottomRight);
    offset = this.vertexAttributes.emplaceAttributesObject(fullAttribs, args.buffer, offset);

    fullAttribs = makeFullAttributes(attributes.topLeft, args.positions.topRight);
    offset = this.vertexAttributes.emplaceAttributesObject(fullAttribs, args.buffer, offset);

    return offset;
  }

  emplaceLine(args: EmplaceLineArgs<T>): number {
    const disp = displacement(args.start, args.end);
    const height = disp.magnitude / 2;
    const center = add(args.start, scale(normalize(disp), height));
    const theta = angle(disp);
    const width = args.thickness;

    const transform = QuadTransform.builder()
      .position(QuadPositioner.center(center))
      .rotate(QuadRotator.center(theta))
      .build();
    return this.emplaceRectangle({
      buffer: args.buffer,
      offset: args.offset,
      transform,
      width,
      height,
      attributes: args.attributes,
    });
  }

  static attributesForAllFourSides<T extends AttributesObject>(
    attributes: Partial<Omit<VertexAttributesObject<T>, 'position'>>
  ): PartialAttributes<T> {
    return {
      bottomLeft: attributes,
      bottomRight: attributes,
      topLeft: attributes,
      topRight: attributes,
    };
  }
}

function makeFullAttributes<T extends AttributesObject>(
  a: Omit<VertexAttributesObject<T>, 'position'>,
  pos: Float32Vector2
): VertexAttributesObject<T> {
  return {
    position: [pos.x, pos.y],
    ...a,
  } as VertexAttributesObject<T>;
}

function joinPartialAttributeSets<T extends AttributesObject>(
  attributeDescriptor: VertexAttributes<T>,
  a: PartialAttributes<T>,
  b: PartialAttributes<T>
): Attributes<T> {
  return {
    bottomLeft: joinPartialAttributes(attributeDescriptor, a.bottomLeft ?? {}, b.bottomLeft ?? {}),
    bottomRight: joinPartialAttributes(
      attributeDescriptor,
      a.bottomRight ?? {},
      b.bottomRight ?? {}
    ),
    topLeft: joinPartialAttributes(attributeDescriptor, a.topLeft ?? {}, b.topLeft ?? {}),
    topRight: joinPartialAttributes(attributeDescriptor, a.topRight ?? {}, b.topRight ?? {}),
  };
}

function joinPartialAttributes<T extends AttributesObject>(
  attributeDescriptor: VertexAttributes<T>,
  a: Partial<Omit<VertexAttributesObject<T>, 'position'>>,
  b: Partial<Omit<VertexAttributesObject<T>, 'position'>>
): Omit<VertexAttributesObject<T>, 'position'> {
  const propertyNames = attributeDescriptor
    .orderedAttributes()
    .map((v) => v.name)
    .filter((s) => s != 'position');
  const object: Record<string, unknown> = {};

  for (const name of propertyNames) {
    if (a[name] != null) object[name] = (a as never)[name];
    else if (b[name] != null) object[name] = (b as never)[name];
    else assert(false, 'cannot join two incomplete vertex attribute objects');
  }

  return object as VertexAttributesObject<T>;
}

function assertIsFullAttributeSet<T extends AttributesObject>(
  attributeDescriptor: VertexAttributes<T>,
  a: PartialAttributes<T>
): asserts a is Attributes<T> {
  const propertyNames = attributeDescriptor
    .orderedAttributes()
    .map((v) => v.name)
    .filter((s) => s != 'position');

  const sides = ['bottomLeft', 'bottomRight', 'topLeft', 'topRight'];

  for (const name of propertyNames) {
    for (const side of sides) {
      if ((a as never)[side] == null) assert(false, 'side not found');
      if ((a as never)[side][name] == null) assert(false, 'Property not found');
    }
  }
}
