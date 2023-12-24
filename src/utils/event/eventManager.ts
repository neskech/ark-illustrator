/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/ban-types */
import { assert } from '../contracts';
import { filterInPlace, find } from '../func/arrayUtils';
import type EventMap from './event';
import type Func from './util';

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
//! TYPE DEFINITIONS
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

type ExtractParams<T> = T extends Func<infer Params> ? Params : never;
type FnWithPriority<T> = {
  fn: T;
  hasPriority: boolean;
};

type Settify<T extends object> = {
  [key in keyof T]: FnWithPriority<T[key]>[];
};

type Optional<T extends object> = {
  [key in keyof T]?: T[key];
};

type GetWithVoid<T> = {
  [K in keyof T]: ExtractParams<T[K]> extends void ? K : never;
}[keyof T];

type Key = keyof EventMap;
type KeysWithVoid = GetWithVoid<EventMap>;
type KeysWithoutVoid = Exclude<Key, KeysWithVoid>;
type EventHolder = Optional<Settify<EventMap>>;

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
//! CLASS DEFINITION
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

export default class EventManager {
  private eventMapping: EventHolder;
  private static instance: EventManager | null

  constructor() {
    this.eventMapping = {};
  }

  private static getInstance(): EventManager {
    if (!this.instance) 
      this.instance = new EventManager()
    return this.instance
  }


  public static invoke<S extends KeysWithoutVoid>(event: S, params: ExtractParams<EventMap[S]>) {
    const funcs = this.getInstance().eventMapping[event] ?? [];

    const priority = find(funcs, (o) => o.hasPriority);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument
    priority.map((o) => o.fn(params as any));

    for (const { fn } of funcs) {
      if (priority.map((o) => o.fn != fn).unwrapOrDefault(true)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument
        fn(params as any);
      }
    }
  }

  public static invokeVoid<S extends KeysWithVoid>(event: S) {
    const funcs = this.getInstance().eventMapping[event] ?? [];

    const priority = find(funcs, (o) => o.hasPriority);
    priority.map((o) => o.fn());

    for (const { fn } of funcs) {
      if (priority.map((o) => o.fn != fn).unwrapOrDefault(true)) fn();
    }
  }

  public static subscribe<S extends Key>(event: S, fn: EventMap[S], hasPriority = false) {
    const eventMapping = this.getInstance().eventMapping

    if (!eventMapping[event]) eventMapping[event] = [];

    const subscribers = eventMapping[event]!;

    assert(
      !hasPriority || subscribers.every((o) => !o.hasPriority),
      'Only one subscriber can have priority'
    );
    assert(
      subscribers.every((o) => o.fn != fn),
      'Cannot subscribe using same function'
    );

    subscribers.push({ fn, hasPriority });
  }

  public static unSubscribe<S extends Key>(event: S, fn: EventMap[S]) {
    const eventMapping = this.getInstance().eventMapping

    if (!eventMapping[event]) return;

    const subscribers = eventMapping[event]!;
    filterInPlace(subscribers, (o) => o.fn == fn);
  }
}
