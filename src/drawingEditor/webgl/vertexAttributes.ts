import { type Tuple } from '~/util/general/utilTypes';
import { type GL } from './glUtils';
import { assertNotNull } from '~/util/general/contracts';
import { assert } from '~/util/general/contracts';

const TYPE_SIZE = 4;
type AttribTypes = 'float' | 'int';
export class VertexAttributeType<AttribType extends AttribTypes, Count extends number> {
  private attributeType_: AttribType;
  private count_: Count;
  private relativePosition_: number;
  private static positionCounter = 0;

  private constructor(attributeType: AttribType, count: Count) {
    this.attributeType_ = attributeType;
    this.count_ = count;
    this.relativePosition_ = VertexAttributeType.positionCounter++;
  }

  typeName(): AttribTypes {
    return this.attributeType_;
  }

  count(): number {
    return this.count_;
  }

  relativePosition(): number {
    return this.relativePosition_;
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
  private nameToIndex_: Map<string, number>;
  private totalAttributeCount_: number;

  constructor(attributesObject: T) {
    this.attributesObject_ = attributesObject;
    this.nameToIndex_ = new Map();
    this.initializeMap();

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

  private initializeMap() {
    const nameAndIndex = Object.entries(this.attributesObject_).map(([k, v]) => ({
      name: k,
      index: v.relativePosition(),
    }));

    const minIndex = nameAndIndex.reduce((acc, o) => Math.min(acc, o.index), Infinity);

    nameAndIndex.forEach((o) => this.nameToIndex_.set(o.name, o.index - minIndex));
  }

  attributesObject(): T {
    return this.attributesObject_;
  }

  totalAttributeCount(): number {
    return this.totalAttributeCount_;
  }

  orderedAttributes(): AttributeEntry[] {
    const numProperties = this.nameToIndex_.size;
    const list = new Array(numProperties) as AttributeEntry[];

    this.nameToIndex_.forEach(
      (index, name) => (list[index] = { name, attribute: this.attributesObject_[name] })
    );
    return list;
  }

  attributesObjectToList(object: VertexAttributesObject<T>): number[] {
    const list = new Array(this.totalAttributeCount_) as number[];

    for (const [name, values] of Object.entries(object)) {
      const idx = this.nameToIndex_.get(name);
      assertNotNull(idx);

      const count = this.attributesObject_[name].count();

      if (count == 1) list[idx] = values as number;
      else {
        for (let i = 0; i < count; i++) list[idx + i] = (values as number[])[i];
      }
    }

    return list;
  }
}
