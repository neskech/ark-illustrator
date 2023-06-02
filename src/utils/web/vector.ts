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

type LA_FLOAT_TYPE = Vec2F | Vec3F | Vec4F | Mat2x2 | Mat3x3 | Mat4x4;
type LA_INT_TYPE = Vec2I | Vec3I | Vec4I;
type LA_TYPE = LA_FLOAT_TYPE | LA_INT_TYPE;

type ArrayBuffer = Int32Array | Float32Array;
type ArrayBufferType = "Int32" | "Float32";

const RESIZE_FACTOR = 1.5;

export const getArrayOfType = (dtype: ArrayBufferType, capacity: number) => {
  if (dtype === "Int32") return new List<LA_FLOAT_TYPE>(capacity);
  else return new List<LA_INT_TYPE>(capacity);
};

class List<T extends LA_TYPE> {
  private buffer: ArrayBuffer;
  private capacity: number;
  private size: number;

  constructor(capacity: number) {
    requires(capacity >= 1);

    this.size = 0;
    this.capacity = capacity;
    this.buffer = new Float32Array(this.capacity);
  }

  private tryResize(newLength: number) {
    if (newLength >= this.capacity) {
      this.resizeToCapacity(newLength * RESIZE_FACTOR);
    }
  }

  resizeToCapacity(newCapacity: number) {
    requires(newCapacity >= 1);

    this.capacity = newCapacity;
    const newBuf = new Float32Array(this.capacity);

    const minLen = Math.min(this.buffer.length, this.capacity);
    for (let i = 0; i < minLen; i++) {
      newBuf[i] = this.buffer[i];
    }

    //TODO delete this.buffer;
    this.buffer = newBuf;
  }

  resize(newSize: number) {
    requires(newSize >= 1);

    this.resizeToCapacity(newSize * RESIZE_FACTOR);
  }

  push(t: T) {
    this.tryResize(t.val.data.length + this.capacity);

    const internals = t.val.data;
    for (const f of internals) {
      this.buffer[this.size++] = f;
    }
  }

  prepend(t: T) {}

  insertAt(t: T, index: number) {
    requires(index >= 0);
  }

  pop(): T {}

  removeAt(index: number): T {}

  getSize(): number {
    return this.size;
  }

  getCapacity(): number {
    return this.capacity;
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

export function isVec2F(v: Vec2F): boolean {
  return arrayEquals(v.shape, [2, 1]) && v.dtype == "float32";
}

export function vec3F(x: number, y: number, z: number): Vec3F {
    return {
        val: new NDArray([x, y], {
          shape: [3, 1],
          dtype: "float32",
        }),
        __type: "Vec3F",
      };
}

export function isVec3F(v: Vec3F): boolean {
  return arrayEquals(v.shape, [3, 1]) && v.dtype == "float32";
}

export function vec4F(x: number, y: number, z: number, w: number): Vec4F {
  return new NDArray([x, y, z, w], {
    shape: [4, 1],
    dtype: "float32",
  });
}

export function isVec4F(v: Vec4F): boolean {
  return arrayEquals(v.shape, [4, 1]) && v.dtype == "float32";
}

/////// int vectors ///////////////

export function vec2I(x: number, y: number): Vec2I {
  return new NDArray([x, y], {
    shape: [2, 1],
    dtype: "int32",
  });
}

export function isVec2I(v: Vec2I): boolean {
  return arrayEquals(v.shape, [2, 1]) && v.dtype == "int32";
}

export function vec3I(x: number, y: number, z: number): Vec3I {
  return new NDArray([x, y, z], {
    shape: [3, 1],
    dtype: "int32",
  });
}

export function isVec3I(v: Vec3I): boolean {
  return arrayEquals(v.shape, [3, 1]) && v.dtype == "int32";
}

export function vec4I(x: number, y: number, z: number, w: number): Vec4I {
  return new NDArray([x, y, z, w], {
    shape: [4, 1],
    dtype: "int32",
  });
}

export function isVec4I(v: Vec4I): boolean {
  return arrayEquals(v.shape, [4, 1]) && v.dtype == "int32";
}

/////// matrices ///////////////

type Mat2x2Arg = [[number, number], [number, number]];

export function mat2x2(data: Mat2x2Arg): Mat2x2 {
  return new NDArray(data, {
    shape: [2, 2],
    dtype: "float32",
  });
}

export function isMat2x2(mat: Mat2x2): boolean {
  return arrayEquals(mat.shape, [2, 2]) && mat.dtype == "float32";
}

type Mat3x3Arg = [
  [number, number, number],
  [number, number, number],
  [number, number, number]
];

export function mat3x3(data: Mat3x3Arg): Mat3x3 {
  return new NDArray(data, {
    shape: [3, 3],
    dtype: "float32",
  });
}

export function isMat3x3(mat: Mat3x3): boolean {
  return arrayEquals(mat.shape, [3, 3]) && mat.dtype == "float32";
}

type Mat4x4Arg = [
  [number, number, number, number],
  [number, number, number, number],
  [number, number, number, number],
  [number, number, number, number]
];

export function mat4x4(data: Mat4x4Arg): Mat4x4 {
  return new NDArray(data, {
    shape: [4, 4],
    dtype: "float32",
  });
}

export function isMat4x4(mat: Mat4x4): boolean {
  return arrayEquals(mat.shape, [4, 4]) && mat.dtype == "float32";
}
