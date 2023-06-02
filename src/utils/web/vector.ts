import { NDArray } from "vectorious";
import { requires } from "../contracts";
type Brand<T, B extends string> = { val: T; __type: B };

export type Vec2F = Brand<NDArray, "Vec2F">;
export type Vec3F = Brand<NDArray, "Vec3F">;
export type Vec4F = Brand<NDArray, "Vec4F">;

export type Vec2I = Brand<NDArray, "Vec2I">;
export type Vec3I = Brand<NDArray, "Vec3I">;
export type Vec4I = Brand<NDArray, "Vec4I">;

export type Mat2x2 = Brand<NDArray, "Mat2x2">;
export type Mat3x3 = Brand<NDArray, "Mat3x3">;
export type Mat4x4 = Brand<NDArray, "Mat4x4">;

export type LinearAlgebraType = 'Vec2F' | 'Vec3F' | 'Vec4F' | 'Vec2I' | 'Vec3I' | 'Vec4I' | 'Mat2x2' | 'Mat3x3' | 'Mat4x4';

type LA_FLOAT_TYPE = 'Vec2F' | 'Vec3F' | 'Vec4F' | 'Mat2x2' | 'Mat3x3' | 'Mat4x4';
type LA_INT_TYPE = 'Vec2I' | 'Vec3I' | 'Vec4I';

type LA_FLOAT_TYPE_CONCRETE = Vec2F | Vec3F | Vec4F | Mat2x2 | Mat3x3 | Mat4x4;
type LA_INT_TYPE_CONCRETE = Vec2I | Vec3I | Vec4I;
type LA_TYPE = LA_FLOAT_TYPE_CONCRETE | LA_INT_TYPE_CONCRETE;

type ArrayBuffer = Int32Array | Float32Array;
type ArrayBufferType = "int32" | "float32";
type BufferSpecification = ["int32", LA_INT_TYPE] | ["float32", LA_FLOAT_TYPE];

const RESIZE_FACTOR = 1.5;
const DEFAULT_CAPACITY = 10;

function typeSizeFrom(t: LinearAlgebraType): number {
    switch (t) {
        case 'Vec2F':
            return 2;
        case 'Vec3F':
            return 3;
        case 'Vec4F':
            return 4;
        case 'Vec2I':
            return 2;
        case 'Vec3I':
            return 3;
        case 'Vec4I':
            return 4;
        case 'Mat2x2':
            return 4;
        case 'Mat3x3':
            return 9;
        case 'Mat4x4':
            return 16;
    }
}

function typeShapeFrom(t: LinearAlgebraType): [number, number] {
    switch (t) {
        case 'Vec2F':
            return [2, 1];
        case 'Vec3F':
            return [3, 1];
        case 'Vec4F':
            return [4, 1];
        case 'Vec2I':
            return [2, 1];
        case 'Vec3I':
            return [3, 1];
        case 'Vec4I':
            return [4, 1];
        case 'Mat2x2':
            return [2, 2];
        case 'Mat3x3':
            return [3, 3];
        case 'Mat4x4':
            return [4, 4];
    }
}

export const getArrayOfType = (spec: BufferSpecification, capacity = DEFAULT_CAPACITY, logging = false) => {
  const [dtype, ltype] = spec;
  if (dtype === "int32") return new List<LA_FLOAT_TYPE_CONCRETE>(capacity, dtype, ltype, logging);
  else return new List<LA_INT_TYPE_CONCRETE>(capacity, dtype, ltype, logging);
};

class List<T extends LA_TYPE> {
  private buffer: ArrayBuffer;
  private bufferType: ArrayBufferType;
  private capacity: number;
  private size: number;
  private debugLogging: boolean;
  private linearAlgType: LinearAlgebraType
  private typeShape: [number, number]
  private typeSize: number

  constructor(capacity: number, dtype: ArrayBufferType, ltype: LinearAlgebraType, logging: boolean) {
    requires(capacity >= 1);

    this.size = 0;
    this.capacity = capacity;
    this.buffer = dtype == 'int32' ? new Int32Array(this.capacity) : new Float32Array(this.capacity);

    this.debugLogging = logging;

    this.bufferType = dtype;
    this.linearAlgType = ltype;

    this.typeSize = typeSizeFrom(ltype);
    this.typeShape = typeShapeFrom(ltype);

  }

  private tryResize() {
    if (this.size >= this.capacity) {
      this.resizeToCapacity(this.size * RESIZE_FACTOR);
    }
  }

  private scaleIndex(idx: number): number {
    return idx * this.typeSize;
  }

  resizeToCapacity(newCapacity: number) {
    requires(newCapacity >= 1);
    const prevCapacity = this.capacity;

    this.capacity = newCapacity;
    const newBuf = new Float32Array(this.capacity);

    const minLen = Math.min(this.buffer.length, this.capacity);
    for (let i = 0; i < minLen; i++)
      newBuf[i] = this.buffer[i];

    this.buffer = newBuf;

    if (this.debugLogging)
        console.info(`Resized buffer of type ${this.bufferType} from ${prevCapacity} to ${newCapacity}`)
  }

  resize(newSize: number) {
    requires(newSize >= 1);
    this.resizeToCapacity(newSize * RESIZE_FACTOR * this.typeSize);
  }

  push(t: T) {
    this.insertAt(t, this.size);
  }

  prepend(t: T) {
    this.insertAt(t, 0);
  }

  insertAt(t: T, index: number) {
    requires(index >= 0);
    const scaledIndex = this.scaleIndex(index);

    this.size += this.typeSize;
    this.tryResize();

    //shift everything over
    const stopIndex = scaledIndex + this.typeSize;
    for (let i = this.size; i > stopIndex; i--) 
        this.buffer[i] = this.buffer[i - this.typeSize];

    const end = scaledIndex + this.typeSize;
    for (let i = scaledIndex; i < end; i++)
        this.buffer[i] = t.val.data[i - scaledIndex];

  }

  pop(): T {
    return this.removeAt(this.size - 1);
  }

  removeAt(index: number): T {
    requires(index >= 0 && index < this.size);

    const scaledIndex = this.scaleIndex(index);

    const arr = new Array(this.typeSize);
    for (let i = scaledIndex; i < scaledIndex + this.typeSize; i++) 
        arr[i - scaledIndex] = this.buffer[scaledIndex];

    const ndArr = new NDArray(arr, {
        shape: this.typeShape,
        dtype: this.bufferType
    });

    const t: T = {
        val: ndArr,
        __type: this.linearAlgType
    } as T

    const end = this.size - this.typeSize;
    for (let i = scaledIndex; i < end; i++) 
        this.buffer[i] = this.buffer[i + this.typeSize];

    this.size -= this.typeSize;

    return t;
  }

  getSize(): number {
    return this.size;
  }

  getCapacity(): number {
    return this.capacity;
  }

  toString(): string {
    let str = '[';
    for (let i = 0; i < this.size; i++) 
        str += `${this.buffer[i]}${i == this.size - 1 ? '' : ', '}`;
    str += ']';

    return `List Buffer --\n\n

            Basic Info --\n
            Data Type: ${this.bufferType}\n
            Size: ${this.size}\n
            Capacity: ${this.capacity}\n\n

            Inner Data Info --\n
            Linear Algebra Type: ${this.linearAlgType}\n
            Type Size: ${this.typeSize}\n
            Type Shape: ${(this.typeShape[0], this.typeShape[1])}\n\n

            Raw List Data --\n\n\n
            Data: ${str}
            `

  }

  log(logger: (s: string) => void = console.log) {
    logger(this.toString())
  }
}

export function arrayEquals(l: number[], r: number[]): boolean {
  requires(l.length === r.length);

  for (let i = 0; i < l.length; i++) {
    if (l[i] != r[i]) return false;
  }
  return true;
}

/////// float vectors ///////////////

export function vec2F(x: number, y: number): Vec2F {
  return {
    val: new NDArray([x, y], {
      shape: [2, 1],
      dtype: "float32",
    }),
    __type: "Vec2F",
  };
}

export function vec3F(x: number, y: number, z: number): Vec3F {
  return {
    val: new NDArray([x, y, z], {
      shape: [3, 1],
      dtype: "float32",
    }),
    __type: "Vec3F",
  };
}

export function vec4F(x: number, y: number, z: number, w: number): Vec4F {
  return {
    val: new NDArray([x, y, z, w], {
      shape: [4, 1],
      dtype: "float32",
    }),
    __type: "Vec4F",
  };
}

/////// int vectors ///////////////

export function vec2I(x: number, y: number): Vec2I {
  return {
    val: new NDArray([x, y], {
      shape: [4, 1],
      dtype: "int32",
    }),
    __type: "Vec2I",
  };
}

export function vec3I(x: number, y: number, z: number): Vec3I {
  return {
    val: new NDArray([x, y, z], {
      shape: [3, 1],
      dtype: "int32",
    }),
    __type: "Vec3I",
  };
}

export function vec4I(x: number, y: number, z: number, w: number): Vec4I {
  return {
    val: new NDArray([x, y, z, w], {
      shape: [4, 1],
      dtype: "int32",
    }),
    __type: "Vec4I",
  };
}

/////// matrices ///////////////

type Mat2x2Arg = [[number, number], [number, number]];

export function mat2x2(data: Mat2x2Arg): Mat2x2 {
  return {
    val: new NDArray(data, {
      shape: [2, 2],
      dtype: "int32",
    }),
    __type: "Mat2x2",
  };
}

type Mat3x3Arg = [
  [number, number, number],
  [number, number, number],
  [number, number, number]
];

export function mat3x3(data: Mat3x3Arg): Mat3x3 {
  return {
    val: new NDArray(data, {
      shape: [3, 3],
      dtype: "int32",
    }),
    __type: "Mat3x3",
  };
}

type Mat4x4Arg = [
  [number, number, number, number],
  [number, number, number, number],
  [number, number, number, number],
  [number, number, number, number]
];

export function mat4x4(data: Mat4x4Arg): Mat4x4 {
  return {
    val: new NDArray(data, {
      shape: [4, 4],
      dtype: "int32",
    }),
    __type: "Mat4x4",
  };
}
