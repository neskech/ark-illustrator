import { type Tuple } from '~/util/general/utilTypes';
import { type GL } from './glUtils';
import { assert } from '~/util/general/contracts';

const TYPE_SIZE = 4;
type AttribTypes = 'float' | 'int';
export class VertexAttributeType<AttribType extends AttribTypes, Count extends number> {
  private attributeType_: AttribType;
  private count_: Count;

  private constructor(attributeType: AttribType, count: Count) {
    this.attributeType_ = attributeType;
    this.count_ = count;
  }

  typeName(): AttribTypes {
    return this.attributeType_;
  }

  count(): number {
    return this.count_;
  }

  typeSize(): number {
    return TYPE_SIZE;
  }

  webGLType(gl: GL): number {
    return this.attributeType_ == 'float' ? gl.FLOAT : gl.INT;
  }

  static float(): VertexAttributeType<'float', 1> {
    return new VertexAttributeType('float', 1);
  }

  static floatList<N extends number>(numElements: N): VertexAttributeType<'float', N> {
    return new VertexAttributeType('float', numElements);
  }

  static int(): VertexAttributeType<'int', 1> {
    return new VertexAttributeType('int', 1);
  }

  static intList<N extends number>(numElements: N): VertexAttributeType<'int', N> {
    return new VertexAttributeType('int', numElements);
  }
}

export type AttributesObject = { [key: string]: VertexAttributeType<AttribTypes, number> };
export type GetAttributesType<T> = T extends VertexAttributes<infer Attr> ? Attr : never

type StringToType<T extends AttribTypes> = T extends 'int' ? number : number;
export type VertexAttributesObject<T extends AttributesObject> = {
  [key in keyof T]: T[key] extends VertexAttributeType<infer T, infer N>
    ? N extends 1
      ? StringToType<T>
      : Tuple<StringToType<T>, N>
    : never;
};

type AttributeEntry = { name: string; attribute: VertexAttributeType<AttribTypes, number> };

export class VertexAttributes<T extends AttributesObject> {
  private attributesObject_: T;
  private totalAttributeCount_: number;

  constructor(attributesObject: T) {
    this.attributesObject_ = attributesObject;

    this.totalAttributeCount_ = Object.values(this.attributesObject_).reduce(
      (acc, v) => acc + v.count(),
      0
    );

    this.assertValid();
  }

  private assertValid() {
    const propertyNames = Object.keys(this.attributesObject_);
    const hasUpperCaseLetter = propertyNames.some((s) => s.charAt(0) !== s.charAt(0).toLowerCase());
    if (hasUpperCaseLetter) assert(false, 'All vertex property names must start with lowercase');
  }

  attributesObject(): T {
    return this.attributesObject_;
  }

  totalAttributeCount(): number {
    return this.totalAttributeCount_;
  }

  orderedAttributes(): AttributeEntry[] {
    return Object.entries(this.attributesObject_).map(([name, attribute]) => ({ name, attribute }));
  }

  attributesObjectToList(object: VertexAttributesObject<T>): number[] {
    const list = new Array(this.totalAttributeCount_) as number[];

    let idx = 0;
    for (const { name, attribute } of this.orderedAttributes()) {
      const count = attribute.count();
      const values = (object as never)[name];

      if (count == 1) list[idx++] = values as number;
      else {
        for (let i = 0; i < count; i++) list[idx++] = (values as number[])[i];
      }
    }

    return list;
  }

  emplaceAttributesObject(
    object: VertexAttributesObject<T>,
    buffer: Float32Array,
    offset: number
  ): number {
    let idx = offset;
    for (const { name, attribute } of this.orderedAttributes()) {
      const count = attribute.count();
      const values = (object as never)[name];

      if (count == 1) buffer[idx++] = values as number;
      else {
        for (let i = 0; i < count; i++) buffer[idx++] = (values as number[])[i];
      }
    }

    // the new offset
    return idx;
  }
}
