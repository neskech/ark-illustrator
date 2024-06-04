import { type GL } from './glUtils';

export type VertexAttributes = { [key: string]: AttributeType<'float' | 'int', number> };

type Tuple<T, N extends number> = N extends N
  ? number extends N
    ? T[]
    : _TupleOf<T, N, []>
  : never;
type _TupleOf<T, N extends number, R extends unknown[]> = R['length'] extends N
  ? R
  : _TupleOf<T, N, [T, ...R]>;

type TypeStringToType<T> = T extends 'int' ? number : number;

export type VertexAttributesObject<T extends VertexAttributes> = {
  [key in keyof T]: T[key] extends AttributeType<infer T, infer N>
    ? N extends 1
      ? TypeStringToType<T>
      : Tuple<TypeStringToType<T>, N>
    : never;
};

const TYPE_SIZE = 4;

export class AttributeType<AttribType extends 'float' | 'int', Count extends number> {
  private attributeType_: AttribType;
  private count_: Count;

  private constructor(attributeType: AttribType, count: Count) {
    this.attributeType_ = attributeType;
    this.count_ = count;
  }

  public get attributeType(): 'float' | 'int' {
    return this.attributeType_;
  }

  public get count(): number {
    return this.count_;
  }

  public get typeName(): string {
    return this.attributeType_;
  }

  public typeSize(): number {
    return TYPE_SIZE;
  }

  public webGLType(gl: GL): number {
    return this.attributeType == 'float' ? gl.FLOAT : gl.INT;
  }

  static float(): AttributeType<'float', 1> {
    return new AttributeType('float', 1);
  }

  static floatList<N extends number>(numElements: N): AttributeType<'float', N> {
    return new AttributeType('float', numElements);
  }

  static int(): AttributeType<'int', 1> {
    return new AttributeType('int', 1);
  }

  static intList<N extends number>(numElements: N): AttributeType<'int', N> {
    return new AttributeType('int', numElements);
  }
}
