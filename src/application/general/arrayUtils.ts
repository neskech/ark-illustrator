import assert from 'assert';
import { requires } from '../drawingEditor/contracts';
import { None, Option, Some } from './option';

type Predicate<A> = (a: A, index?: number) => boolean;
type Reducer<A, B> = (accum: B, curr: A, index?: number) => B;

declare global {
  interface Array<T> {
    popOption: () => Option<T>;
    findOption: (fn: Predicate<T>) => Option<T>;
    numberSatisfying: (fn: Predicate<T>) => number;
    equalsNoOrder: (t: T[]) => boolean;
    indexOfOption: (el: T, fromIndex?: number) => Option<number>;
    lastIndexOfOption: (el: T, fromIndex?: number) => Option<number>;
    zip: <B>(b: B[]) => [T, B][];
    zipWith: <B, C>(b: B[], fn: (t: T, b: B) => C) => C[];
    unZip: () => T extends [infer A, infer B] ? [A, B] : never;
    take: (n: number) => T[];
    takeWhile: (fn: Predicate<T>) => T[];
    drop: (n: number) => T[];
    dropWhile: (fn: Predicate<T>) => T[];
    scan: <B>(fn: Reducer<T, B>, baseCase: B) => [B[], B];
    scanIncl: <B>(fn: Reducer<T, B>, baseCase: B) => B[];
    reduceNoBaseCase: (fn: Reducer<T, T>) => T;
    scanNoBaseCase: (fn: Reducer<T, T>) => [T[], T];
    scanInclNoBaseCase: (fn: Reducer<T, T>) => T[];
    filterInPlace: (fn: Predicate<T>) => void;
    mapInPlace: (fn: (t: T) => T) => T[];
    min: (fn: (t1: T, t2: T) => number) => T extends number ? number : never;
    max: (fn: (t1: T, t2: T) => number) => T extends number ? number : never;
  }
}

export function tabulate<A>(n: number, fn: (i: number) => A): A[] {
  const a: A[] = [];
  for (let i = 0; i < n; i++) {
    a.push(fn(i));
  }
  return a;
}

export function pop<A>(a: A[]): Option<A> {
  return Option.fromNull(a.pop());
}

export function find<A>(a: A[], fn: (a: A, i?: number) => boolean): Option<A> {
  return Option.fromNull(a.find(fn));
}

export function numberSatisfying<A>(a: A[], fn: (a: A, i?: number) => boolean): number {
  let numSatistfy = 0;
  for (const elem of a) {
    if (fn(elem)) numSatistfy += 1;
  }
  return numSatistfy;
}

export function equalsNoOrder<A>(a: A[], b: A[]): boolean {
  if (a.length != b.length) return false;

  return a.every((el) => b.indexOf(el) != -1);
}

export function indexOf<A>(a: A[], el: A, fromIndex?: number): Option<number> {
  const res = a.indexOf(el, fromIndex);
  if (res < 0) return None();
  return Some(res);
}

export function lastIndexOf<A>(a: A[], el: A, fromIndex?: number): Option<number> {
  const res = a.lastIndexOf(el, fromIndex);
  if (res < 0) return None();
  return Some(res);
}

export function zip<A, B>(a: A[], b: B[]): [A, B][] {
  const minLen = Math.min(a.length, b.length);
  const arr: [A, B][] = [];
  for (let i = 0; i < minLen; i++) arr.push([a[i], b[i]]);
  return arr;
}

export function zipWith<A, B, C>(a: A[], b: B[], fn: (a: A, b: B) => C): C[] {
  const minLen = Math.min(a.length, b.length);
  const arr: C[] = [];
  for (let i = 0; i < minLen; i++) arr.push(fn(a[i], b[i]));
  return arr;
}

export function unzip<A, B>(arr: [A, B][]): [A[], B[]] {
  const a: A[] = [];
  const b: B[] = [];

  for (const [a_, b_] of arr) {
    a.push(a_);
    b.push(b_);
  }

  return [a, b];
}

export function take<A>(a: A[], n: number): A[] {
  const arr: A[] = [];
  for (let j = 0; j < n; j++) arr.push(a[j]);
  return arr;
}

export function takeWhile<A>(a: A[], fn: (a: A) => boolean): A[] {
  let i = 0;
  while (i < a.length && fn(a[i])) i++;

  const arr: A[] = [];
  for (let j = 0; j < i; j++) arr.push(a[j]);
  return arr;
}

export function drop<A>(a: A[], n: number): A[] {
  const arr: A[] = [];
  for (let j = n; j < a.length; j++) arr.push(a[j]);
  return arr;
}

export function dropWhile<A>(a: A[], fn: (a: A) => boolean): A[] {
  let i = 0;
  while (i < a.length && fn(a[i])) i++;

  const arr: A[] = [];
  for (let j = i; j < a.length; j++) arr.push(a[j]);
  return arr;
}

export function filterInPlace<A>(a: A[], fn: (a: A) => boolean): A[] {
  for (let i = 0; i < a.length; i++) {
    if (!fn(a[i])) {
      a.splice(i, 1);
      i--;
    }
  }

  return a;
}

export function mapInPlace<A>(a: A[], fn: (a: A) => A): A[] {
  for (let i = 0; i < a.length; i++) a[i] = fn(a[i]);
  return a;
}

export function scan<A, B>(
  a: A[],
  fn: (accum: B, curr: A, index?: number) => B,
  baseCase: B
): [B[], B] {
  const accumList = [];
  let accum = baseCase;
  for (let i = 0; i < a.length; i++) {
    accumList.push(accum);
    accum = fn(accumList[accumList.length - 1], a[i], i);
  }
  return [accumList, accum];
}

export function scanIncl<A, B>(
  a: A[],
  fn: (accum: B, curr: A, index?: number) => B,
  baseCase: B
): B[] {
  const accumList = [];
  let accum = baseCase;
  for (let i = 0; i < a.length; i++) {
    accum = fn(accumList[accumList.length - 1], a[i], i);
    accumList.push(accum);
  }
  return accumList;
}

export function scanNoBaseCase<A>(a: A[], fn: (accum: A, curr: A, index?: number) => A): [A[], A] {
  requires(a.length > 0);

  const accumList = [];
  let accum = a[0];
  for (let i = 0; i < a.length; i++) {
    accumList.push(accum);
    accum = fn(accumList[accumList.length - 1], a[i], i);
  }
  return [accumList, accum];
}

export function scanInclNoBaseCase<A>(a: A[], fn: (accum: A, curr: A, index?: number) => A): A[] {
  requires(a.length > 0);

  const accumList = [];
  let accum = a[0];
  for (let i = 0; i < a.length; i++) {
    accum = fn(accumList[accumList.length - 1], a[i], i);
    accumList.push(accum);
  }
  return accumList;
}

export function reduceNoBaseCase<A>(a: A[], fn: (accum: A, curr: A, index?: number) => A): A {
  requires(a.length > 0);
  return a.reduce(fn, a[0]);
}

export function min(a: number[]): number {
  requires(a.length > 0);
  return a.reduce((a, b) => Math.min(a, b), Infinity);
}

export function max(a: number[]): number {
  requires(a.length > 0);
  return a.reduce((a, b) => Math.max(a, b), -Infinity);
}

Array.prototype.findOption = function (fn) {
  return find(this, fn);
};

Array.prototype.popOption = function () {
  return pop(this);
};

Array.prototype.numberSatisfying = function (fn) {
  return numberSatisfying(this, fn);
};

Array.prototype.equalsNoOrder = function (b) {
  return equalsNoOrder(this, b);
};

Array.prototype.indexOfOption = function (el, fromIndex) {
  return indexOf(this, el, fromIndex);
};

Array.prototype.lastIndexOfOption = function (el, fromIndex) {
  return lastIndexOf(this, el, fromIndex);
};

Array.prototype.zip = function (b) {
  return zip(this, b);
};

Array.prototype.zipWith = function (b, fn) {
  return zipWith(this, b, fn);
};

function assertIsTupleArray<B, C>(a: unknown[]): asserts a is [B, C][] {
  if (a.length == 0) return;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
  const arr = a[0] as any;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  assert(!!arr.length && arr.length === 2);
}

Array.prototype.unZip = function () {
  assertIsTupleArray(this);
  return unzip(this);
};

Array.prototype.take = function (n) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return take(this, n);
};

Array.prototype.takeWhile = function (fn) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return takeWhile(this, fn);
};

Array.prototype.drop = function (n) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return drop(this, n);
};

Array.prototype.dropWhile = function (fn) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return dropWhile(this, fn);
};

Array.prototype.filterInPlace = function (fn) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return filterInPlace(this, fn);
};

Array.prototype.filterInPlace = function (fn) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return filterInPlace(this, fn);
};

Array.prototype.filterInPlace = function (fn) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return filterInPlace(this, fn);
};

Array.prototype.mapInPlace = function (fn) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return filterInPlace(this, fn);
};

Array.prototype.scan = function (fn, baseCase) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return scan(this, fn, baseCase);
};

Array.prototype.scanIncl = function (fn, baseCase) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return scanIncl(this, fn, baseCase);
};

Array.prototype.scanNoBaseCase = function (fn) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return scanNoBaseCase(this, fn);
};

Array.prototype.scanInclNoBaseCase = function (fn) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return scanInclNoBaseCase(this, fn);
};

Array.prototype.reduceNoBaseCase = function (fn) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return reduceNoBaseCase(this, fn);
};

function assertIsNumberArray(a: unknown[]): asserts a is number[] {
  assert(a.length > 0 && typeof a[0] == 'number');
}

Array.prototype.min = function () {
  assertIsNumberArray(this);
  return min(this);
};

Array.prototype.max = function () {
  assertIsNumberArray(this);
  return max(this);
};
