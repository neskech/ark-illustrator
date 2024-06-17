/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import { assert } from './contracts';
import { type Constructor } from './utilTypes';

type Fun = (...args: any) => any;

type Fns<Args extends unknown[]> = Args extends [infer f1, infer f2]
  ? f1 extends (...args: any) => any
    ? f2 extends (...args: any) => any
      ? Parameters<f2> extends [ReturnType<f1>]
        ? [f1, f2]
        : never
      : never
    : never
  : Args extends [infer f1, infer f2, ...infer Tail]
  ? f1 extends (...args: any) => any
    ? f2 extends (...args: any) => any
      ? Parameters<f2> extends [ReturnType<f1>]
        ? [f1, Fns<[f2, Tail]>]
        : never
      : never
    : never
  : never;

type Last<Args extends unknown[]> = Args extends [infer f]
  ? f extends (...args: infer _) => infer R
    ? R
    : never
  : Args extends [infer _, ...infer Tail]
  ? Last<Tail>
  : never;

type Return<F extends Fun[]> = F extends Fns<F>
  ? F extends [infer first, ...infer _]
    ? first extends (...params: infer Args) => infer _
      ? (...p: Args) => Last<F>
      : never
    : never
  : never;

export function compose<F extends Fun[]>(...args: F): Return<F> {
  const ret = ((...a: unknown[]) => {
    let start = args.length > 0 ? args[0](...a) : a;
    for (let i = 1; i < args.length; i++) start = args[i](start);
    return start;
  }) as Return<F>;

  return ret;
}

export function simpleCompose<A>(...args: ((a: A) => A)[]): (a: A) => A {
  return args.reduce(
    (acc, curr) => (a: A) => curr(acc(a)),
    (a: A) => a
  );
}

type Params<K extends Fun> = Parameters<K> extends [infer C] ? C : Parameters<K>;

export function pipe<F extends Fun[]>(a: Params<Return<F>>, ...args: F): ReturnType<Return<F>> {
  type Coerced = (...p: any) => any;
  if (Array.isArray(a)) return (compose(...args) as Coerced)(...a);
  else return (compose(...args) as Coerced)(a);
}

export function simplePipe<A>(a: A, ...args: ((a: A) => A)[]): A {
  return simpleCompose<A>(...args)(a);
}

type Curry<Args extends unknown[], R> = Args extends [infer Head, ...infer Tail]
  ? (h: Head) => Curry<Tail, R>
  : R;
type ReturnCurry<F extends Fun> = F extends (...args: infer Args) => infer R
  ? Args extends []
    ? () => R
    : Curry<Args, R>
  : never;

type First<Args extends unknown[]> = Args extends [infer Head]
  ? Head
  : Args extends [infer Head, ...infer _]
  ? Head
  : never;

export function curry<F extends Fun>(f: F): ReturnCurry<F> {
  const numParams = f.length;
  if (numParams === 0) return f as ReturnCurry<F>;

  return ((a: First<Parameters<F>>) => curry((...args) => f(a, ...args))) as ReturnCurry<F>;
}

export const todo = () => {
  throw new Error('todo');
};
export const noOp = () => {
  const _ = 1;
};
// eslint-disable-next-line @typescript-eslint/no-empty-function
export const todoEmpty = () => {};
export const greaterThan = (a: number) => (b: number) => b > a;
export const lessThan = (a: number) => (b: number) => a > b;
export const greaterThanEqual = (a: number) => (b: number) => b >= a;
export const lessThanEqual = (a: number) => (b: number) => a >= b;
export const equal = (a: number) => (b: number) => a === b;
export const notEqual = (a: number) => (b: number) => a !== b;
export const multipleOf = (a: number) => (b: number) => a % b === 0;
export const min = (a: number) => (b: number) => Math.min(a, b);
export const max = (a: number) => (b: number) => Math.max(a, b);
export const plus = (a: number) => (b: number) => a + b;
export const plusStr = (a: string) => (b: string) => a + b;
export const sub = (a: number) => (b: number) => b - a;
export const mult = (a: number) => (b: number) => a + b;
export const div = (a: number) => (b: number) => b / a;
export const unreachable = (errMsg?: string) => {
  throw new Error(errMsg != null ? 'Error: Unreachable code' : errMsg);
};

export const forceDowncast = <Derived, Base>(b: Base, derived: Constructor<Derived>) => {
  if (!(b instanceof derived)) assert(false);
  return b as unknown as Derived;
};
