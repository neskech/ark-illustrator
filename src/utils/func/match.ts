/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unused-vars */
type AllPattern_<T> = T extends []
  ? []
  : T extends [infer Head, ...infer Tail]
  ? Head extends boolean
    ? [Pattern<boolean>, ...AllPattern_<Tail>]
    : Head extends [...infer _]
    ? [TuplePattern<Head> | TupleFnPattern<Head>, ...AllPattern_<Tail>]
    : [Pattern<Head>, ...AllPattern_<Tail>]
  : never;

type BackFrom<P> = P extends []
  ? []
  : P extends [Pattern<infer Head>, ...infer Tail]
  ? [Head, ...BackFrom<Tail>]
  : never;

type Brand<T, Name> = { val: T; __type: Name };

type TuplePattern<T> = Brand<AllPattern_<T>, 'tuple'>;
type TupleFnPattern<T> = Brand<(t: T) => AllPattern_<T>, 'tupleFn'>;

type ObjOfPatterns<T> = { [K in keyof T]?: Pattern<T[K]> };
type ObjectPattern<T> = Brand<ObjOfPatterns<T>, 'object'>;
type ObjectPatternFn<T> = Brand<(t: T) => ObjOfPatterns<T>, 'objectFn'>;

type FromArray<T> = T extends (infer K)[] ? K[] : never;
type InnerType<T> = T extends (infer K)[] ? K : never;
type ArraySpread = { name?: string; bind: (name: string) => ArraySpread; __type: 'spread' };
type ArrayPattern<T> = Brand<(Pattern<InnerType<T>> | ArraySpread)[], 'array'>;

type BindingPattern = Brand<{ name: string }, 'bind'>;
type Pattern<T> =
  | Brand<T, 'value'>
  | Brand<(t: T) => boolean, 'function'>
  | Brand<'wildcard', 'wild'>
  | BindingPattern
  | TuplePattern<T>
  | TupleFnPattern<T>
  | ObjectPattern<T>
  | ObjectPatternFn<T>
  | ArrayPattern<T>;

type Capture = { [key: string]: unknown };
function doesMatch<T>(t: T, p: Pattern<T> | ArraySpread, capture: Capture): boolean {
  if (p.__type === 'value') return p.val === t;
  else if (p.__type === 'function') return p.val(t);
  else if (p.__type === 'tuple') {
    const tuple = t as BackFrom<typeof p.val>;
    const subs = p.val;
    for (let i = 0; i < subs.length; i++) {
      if (!doesMatch(tuple[i], subs[i], capture)) return false;
    }
    return true;
  } else if (p.__type === 'tupleFn') {
    const tuple = t as BackFrom<typeof p.val>;
    const subs = { val: p.val(tuple), __type: 'tuple' };
    for (let i = 0; i < subs.val.length; i++) {
      if (!doesMatch(tuple[i], subs.val[i], capture)) return false;
    }
    return true;
  } else if (p.__type === 'object') {
    const obj = t as object; //has same keys as the pattern
    for (const key in obj) {
      const subPattern = (p.val as any)[key];
      if (subPattern != undefined && !doesMatch((obj as any)[key], subPattern, capture))
        return false;
    }
    return true;
  } else if (p.__type === 'objectFn') {
    const obj = t as object; //has same keys as the pattern
    const objP = { val: p.val(t), __type: 'object' };
    for (const key in obj) {
      const subPattern = (objP as any)[key];
      if (subPattern != undefined && !doesMatch((obj as any)[key], subPattern, capture))
        return false;
    }
    return true;
  } else if (p.__type === 'array') {
    const arr = t as FromArray<T>;

    //ensure there is only one spread
    const spreadCount = p.val.reduce((acc, curr) => acc + (curr.__type === 'spread' ? 1 : 0), 0);
    if (spreadCount > 1) throw new Error('Cannot have more than 1 spread in an array pattern!');

    let listIdx = 0;
    let patIdx = 0;
    while (patIdx < p.val.length && listIdx < arr.length && listIdx >= 0) {
      const pattern = p.val[patIdx];
      if (pattern.__type === 'spread') {
        // move forward by however many pats are left
        const newIdx = arr.length - (p.val.length - (patIdx + 1));
        if (pattern.name != null) capture[pattern.name] = arr.slice(listIdx, newIdx);
        listIdx = newIdx;
      } else if (
        listIdx >= arr.length ||
        !doesMatch(arr[listIdx] as InnerType<T>, pattern, capture)
      )
        return false;
      else listIdx++;

      patIdx++;
    }

    //if the last element was a spread
    if (listIdx === arr.length && patIdx < p.val.length) {
      const pattern = p.val[patIdx];
      if (pattern.__type === 'spread' && pattern.name != null) capture[pattern.name] = [];
    }

    return true;
  } else if (p.__type === 'bind') {
    capture[p.val.name] = t;
    return true;
  }
  return true; //wildcard
}

type PatternConstructor = {
  _: Brand<'wildcard', 'wild'>;
  f: <T>(f: (t: T) => boolean) => Brand<(t: T) => boolean, 'function'>;
  v: <T>(t: T) => Brand<T, 'value'>;
  bind: (name: string) => BindingPattern;
  tuple: <T>(p: AllPattern_<T>) => TuplePattern<T>;
  tupleFn: <T>(f: (t: T) => AllPattern_<T>) => TupleFnPattern<T>;
  obj: <T extends object>(o: ObjOfPatterns<T>) => ObjectPattern<T>;
  objFn: <T extends object>(f: (t: T) => ObjOfPatterns<T>) => ObjectPatternFn<T>;
  list: <T extends unknown[]>(...l: (Pattern<InnerType<T>> | ArraySpread)[]) => ArrayPattern<T>;
  spread: () => ArraySpread;
};

export const P: PatternConstructor = {
  _: { val: 'wildcard', __type: 'wild' },
  f: (f_) => ({ val: f_, __type: 'function' }),
  v: (t) => ({ val: t, __type: 'value' }),
  bind: (name) => ({ val: { name }, __type: 'bind' }),
  tuple: (p) => ({ val: p, __type: 'tuple' }),
  tupleFn: (f_) => ({ val: f_, __type: 'tupleFn' }),
  obj: (o) => ({ val: o, __type: 'object' }),
  objFn: (f_) => ({ val: f_, __type: 'objectFn' }),
  list: (...l) => ({ val: l, __type: 'array' }),
  spread: () => ({
    bind(name) {
      this.name = name;
      return this;
    },
    __type: 'spread',
  }),
};

type Matcher<T, R> = { pattern: Pattern<T>; result: ((captures: Capture) => R) | R };
export function match<T, R>(t: T, ...matches: Matcher<T, R>[]): R {
  function isFun(f: ((c: Capture) => R) | R): f is (captures: Capture) => R {
    return typeof f === 'function';
  }

  const capture: Capture = {};
  for (const { pattern, result } of matches) {
    const execute: () => R = () => (isFun(result) ? result(capture) : result);
    if (doesMatch(t, pattern, capture)) return execute();
  }

  throw new Error('Match case not exhaustive!');
}

//////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////
//! USAGE
//////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////

const res = match<[number, [number, number | string]], boolean>([10, [2, 2]], {
  pattern: P.tuple([P._, P.tuple([P._, P._])]), //wilcard pattern matches anything
  result: true,
});

type Obj = { v: { l: number }; k: string };
const res2 = match<Obj, boolean>(
  { v: { l: 10 }, k: 'hello' },
  {
    pattern: P.obj<Obj>({
      v: P.obj({ l: P.v(10) }),
    }),
    result: true,
  }
);

const res3 = match<{ v: { l: number }; k: string }, boolean>(
  { v: { l: 10 }, k: 'hello' },
  {
    pattern: P.objFn((t) => ({
      //function variant provides better type inference
      v: P.obj({ l: P.v(10) }),
    })),
    result: true,
  }
);

const res4 = match<[number, [number, number | string]], boolean>([10, [2, 2]], {
  pattern: P.tuple([P.bind('e'), P.tuple([P.bind('k'), P._])]),
  result: (_) => true, //can bind parts of the pattern to vars, here we choose to ignore
});

const res5 = match<number[], boolean>([1, 2, 3, 4], {
  pattern: P.list(P.bind('x'), P.spread().bind('xs')),
  result: ({ x, xs }) => {
    console.log(x, xs); // 1, [2, 3, 4]
    return true;
  },
}); //pattern matching on lists

function reverseList<A>(list: A[]): A[] {
  return match<A[], A[]>(
    list,
    {
      pattern: P.list(), //empty list
      result: [],
    },
    {
      pattern: P.list(P.bind('x'), P.spread().bind('xs')),
      //some type coercion may be needed
      result: ({ x, xs }) => reverseList(xs as A[]).concat([x as A]),
    }
  );
}

const rev = reverseList([1, 2, 3]);
console.log(rev); // prints [3, 2, 1]
