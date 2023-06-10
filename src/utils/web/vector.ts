import { requires } from '../contracts';
import {
  Float32Vector2,
  Float32Vector3,
  type Matrix2x2, type Float32Vector4,
  type Matrix3x3,
  type Matrix4x4,
} from 'matrixgl';
import { unreachable } from '../func/funUtils';

type ArrayBuffer = Int32Array | Float32Array
type ArrayBufferType = 'integer' | 'float'

type LinearAlgebra =
  | Float32Vector2
  | Float32Vector3
  | Float32Vector4
  | Int32Vector2
  | Int32Vector3
  | Int32Vector4
  | Matrix2x2
  | Matrix3x3
  | Matrix4x4;

type LinearAlgebraType =
| 'Float32Vector2'
| 'Float32Vector3'
| 'Float32Vector4'
| 'Int32Vector2'
| 'Int32Vector3'
| 'Int32Vector4'
| 'Matrix2x2'
| 'Matrix3x3'
| 'Matrix4x4';

function typeToType(s: LinearAlgebraType): ArrayBufferType {
  return s.includes('Int') ? 'integer' : 'float'
}

function typeToTypeSize(s: LinearAlgebraType): number {
  switch (s) {
    case 'Float32Vector2':
      return 2;
    case 'Float32Vector3':
      return 3;
    case 'Float32Vector4':
      return 4;
    case 'Int32Vector2':
      return 2;
    case 'Int32Vector3':
      return 3;
    case 'Int32Vector4':
      return 4;
    case  'Matrix2x2':
      return 4;
    case 'Matrix3x3':
      return 9;
    case 'Matrix4x4':
      return 16;
    default:
      return unreachable();
  }
}

const RESIZE_FACTOR = 1.5;


export class List<T extends LinearAlgebra> {
  private buffer: ArrayBuffer;
  private bufferType: ArrayBufferType;
  private capacity: number;
  private size: number;
  private debugLogging: boolean;
  private linearAlgType: LinearAlgebraType;
  private typeSize: number;
  private typeConstructor: (n: number[]) => T

  constructor(
    capacity: number,
    ltype: LinearAlgebraType,
    typeConstructor: (n: number[]) => T,
    logging: boolean
  ) {
    requires(capacity >= 1);

    this.size = 0;
    this.capacity = capacity;

    this.bufferType = typeToType(ltype);

    this.buffer =
      this.bufferType == 'integer'
        ? new Int32Array(this.capacity)
        : new Float32Array(this.capacity);

    this.typeConstructor = typeConstructor;

    this.debugLogging = logging;
    this.linearAlgType = ltype;
    this.typeSize = typeToTypeSize(ltype);
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
    for (let i = 0; i < minLen; i++) newBuf[i] = this.buffer[i];

    this.buffer = newBuf;

    if (this.debugLogging)
      console.info(
        `Resized buffer of type ${this.bufferType} from ${prevCapacity} to ${newCapacity}`
      );
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
      this.buffer[i] = t.values[i - scaledIndex];
  }

  pop(): T {
    return this.removeAt(this.size - 1);
  }

  removeAt(index: number): T {
    requires(index >= 0 && index < this.size);

    const scaledIndex = this.scaleIndex(index);

    const arr = new Array(this.typeSize) as number[];
    for (let i = scaledIndex; i < scaledIndex + this.typeSize; i++)
      arr[i - scaledIndex] = this.buffer[scaledIndex];

    const t = this.typeConstructor(arr);

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
            Raw List Data --\n\n\n
            Data: ${str}
            `;
  }

  log(logger: (s: string) => void = console.log) {
    logger(this.toString());
  }
}


////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
//! BASE CLASSES STOLEN FROM LIB
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
type TypedArrayLike = Int8Array | Uint8Array | Int16Array | Uint16Array | Int32Array | Uint32Array | Uint8ClampedArray | Float32Array | Float64Array;
/**
 * An interface for vectors.
 */
interface Vector<T extends TypedArrayLike> {
    /**
     * Returns values of the vector.
     * @returns {T}
     */
    readonly values: T;
    /**
     * Returns magnitude of the vector.
     */
    readonly magnitude: number;
    /**
     * Returns `values` as a string.
     * @returns {string}
     */
    toString(): string;
}
/**
 * An abstract class for vectors.
 */
abstract class VectorBase<T extends TypedArrayLike> implements Vector<T> {
    /**
     * Values that the vector contains.
     */
    protected _values!: T;
    abstract get values(): T;
    abstract get magnitude(): number;
    abstract toString(): string;
}
/**
 * A base abstract class for 2-dimensional vectors.
 */
abstract class Vector2Base<T extends TypedArrayLike> extends VectorBase<T> {
    /**
     * Returns x value of the vector.
     * @returns {number}
     */
    abstract get x(): number;
    /**
     * Returns y value of the vector.
     * @returns {number}
     */
    abstract get y(): number;
    /**
     * Set the `value` as new x.
     * @param {number} value
     */
    abstract set x(value: number);
    /**
     * Set the `value` as new y.
     * @param {number} value
     */
    abstract set y(value: number);
}
/**
 * A base abstract class for 3-dimensional vectors.
 */
abstract class Vector3Base<T extends TypedArrayLike> extends VectorBase<T> {
    /**
     * Returns x value of the vector.
     * @returns {number}
     */
    abstract get x(): number;
    /**
     * Returns y value of the vector.
     * @returns {number}
     */
    abstract get y(): number;
    /**
     * Returns z value of the vector.
     * @returns {number}
     */
    abstract get z(): number;
    /**
     * Set the `value` as new x.
     * @param {number} value
     */
    abstract set x(value: number);
    /**
     * Set the `value` as new y.
     * @param {number} value
     */
    abstract set y(value: number);
    /**
     * Set the `value` as new z.
     * @param {number} value
     */
    abstract set z(value: number);
}
/**
 * A base abstract class for 4-dimensional vectors.
 */
abstract class Vector4Base<T extends TypedArrayLike> extends VectorBase<T> {
    /**
     * Returns x value of the vector.
     * @returns {number}
     */
    abstract get x(): number;
    /**
     * Returns y value of the vector.
     * @returns {number}
     */
    abstract get y(): number;
    /**
     * Returns z value of the vector.
     * @returns {number}
     */
    abstract get z(): number;
    /**
     * Returns w value of the vector.
     * @returns {number}
     */
    abstract get w(): number;
    /**
     * Set the `value` as new x.
     * @param {number} value
     */
    abstract set x(value: number);
    /**
     * Set the `value` as new y.
     * @param {number} value
     */
    abstract set y(value: number);
    /**
     * Set the `value` as new z.
     * @param {number} value
     */
    abstract set z(value: number);
    /**
     * Set the `value` as new w.
     * @param {number} value
     */
    abstract set w(value: number);
}

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
//! CONCRETE CLASSES
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

export class Int32Vector2 extends Vector2Base<Int32Array> {
  _values: Int32Array;

  constructor(x: number, y: number) {
    super();
    this._values = new Int32Array([x, y]);
  }

  get x(): number {
    return this._values[0];
  }
  set x(value: number) {
    this._values[0] = value;
  }
  get y(): number {
    return this._values[1];
  }
  set y(value: number) {
    this._values[1] = value;
  }

  get values(): Int32Array {
    return this._values;
  }

  get magnitude(): number {
    const x = this._values[0];
    const y = this._values[1];
    return Math.sqrt(x * x + y * y);
  }

  toString(): string {
    return `Vector2Int -- x: ${this.x}, y: ${this.y}`;
  }
}

export class Int32Vector3 extends Vector3Base<Int32Array> {
  _values: Int32Array;

  constructor(x: number, y: number) {
    super();
    this._values = new Int32Array([x, y]);
  }

  get x(): number {
    return this._values[0];
  }
  set x(value: number) {
    this._values[0] = value;
  }
  get y(): number {
    return this._values[1];
  }
  set y(value: number) {
    this._values[1] = value;
  }
  get z(): number {
    return this._values[2];
  }
  set z(value: number) {
    this._values[2] = value;
  }

  get values(): Int32Array {
    return this._values;
  }

  get magnitude(): number {
    const x = this._values[0];
    const y = this._values[1];
    const z = this._values[2];
    return Math.sqrt(x * x + y * y + z * z);
  }

  toString(): string {
    return `Vector2Int -- x: ${this.x}, y: ${this.y}, z: ${this.z}`;
  }
}

export class Int32Vector4 extends Vector4Base<Int32Array> {
  _values: Int32Array;

  constructor(x: number, y: number) {
    super();
    this._values = new Int32Array([x, y]);
  }

  get x(): number {
    return this._values[0];
  }
  set x(value: number) {
    this._values[0] = value;
  }
  get y(): number {
    return this._values[1];
  }
  set y(value: number) {
    this._values[1] = value;
  }
  get z(): number {
    return this._values[2];
  }
  set z(value: number) {
    this._values[2] = value;
  }
  get w(): number {
    return this._values[3];
  }
  set w(value: number) {
    this._values[3] = value;
  }

  get values(): Int32Array {
    return this._values;
  }

  get magnitude(): number {
    const x = this._values[0];
    const y = this._values[1];
    const z = this._values[2];
    const w = this._values[3];
    return Math.sqrt(x * x + y * y + z * z + w * w);
  }

  toString(): string {
    return `Vector2Int -- x: ${this.x}, y: ${this.y}, z: ${this.z}, w: ${this.w}`;
  }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////

//! VECTOR FUNCTIONS

//////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////
export function copy(a: Float32Vector2): Float32Vector2 {
  return new Float32Vector2(a.x, a.y);
}

export function add(a: Float32Vector2, b: Float32Vector2): Float32Vector2 {
  a.x += b.x;
  a.y += b.y;
  return a;
}

export function sub(a: Float32Vector2, b: Float32Vector2): Float32Vector2 {
  a.x -= b.x;
  a.y -= b.y;
  return a;
}

export function scale(a: Float32Vector2, scaling: number): Float32Vector2 {
  a.x *= scaling;
  a.y *= scaling;
  return a;
}

export function normalize(a: Float32Vector2): Float32Vector2 {
  const mag = a.magnitude;

  if (mag === 0) return a;

  a.x /= mag;
  a.y /= mag;
  return a;
}

export function displacement(
  from: Float32Vector2,
  to: Float32Vector2
): Float32Vector2 {
  return sub(copy(to), from);
}

export function direction(
  from: Float32Vector2,
  to: Float32Vector2
): Float32Vector2 {
  return normalize(displacement(from, to));
}

export function distanceAlong(
  from: Float32Vector2,
  to: Float32Vector2,
  t: number
): Float32Vector2 {
  return scale(direction(from, to), t);
}

export function distance(a: Float32Vector2, b: Float32Vector2): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function distanceSquared(a: Float32Vector2, b: Float32Vector2): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy;
}

export function angle(a: Float32Vector2): number {
  return Math.atan2(a.y, a.x);
}

export function fromAngle(theta: number): Float32Vector2 {
  return new Float32Vector2(Math.cos(theta), Math.sin(theta));
}

export function rotateBy(a: Float32Vector2, theta: number): Float32Vector2 {
  return fromAngle(angle(a) + theta);
}

export function dot(a: Float32Vector2, b: Float32Vector2): number {
  return a.x * b.x + a.y * b.y;
}

export function angleBetween(a: Float32Vector2, b: Float32Vector2): number {
  return Math.acos(dot(a, b) / (a.magnitude * b.magnitude));
}

export function cross(a: Float32Vector2, b: Float32Vector2): Float32Vector3 {
  return new Float32Vector3(0, 0, a.x * b.y - b.x * a.y);
}
