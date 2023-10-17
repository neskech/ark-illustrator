import { requires } from '../contracts';
import { find } from './arrayUtils';

interface Fn<Params> {
  f: (p: Params) => void;
  hasPriority: boolean;
}

export class Event<Params> {
  private subscribers: Fn<Params>[];

  constructor() {
    this.subscribers = [];
  }

  subscribe(f: (p: Params) => void, hasPriority = false) {
    requires(!hasPriority || (hasPriority && this.subscribers.every((fn) => !fn.hasPriority)));
    this.subscribers.push({
      f,
      hasPriority,
    });
  }

  unSubscribe(f: (p: Params) => void) {
    for (let i = 0; i < this.subscribers.length; i++) {
      if (f === this.subscribers[i].f) {
        this.subscribers.splice(i);
        return;
      }
    }
  }

  invoke(params: Params) {
    const priority = find(this.subscribers, (fn) => fn.hasPriority)
    priority.map(p => p.f(params))

    for (const fn of this.subscribers){
        if (priority.map(p => p.f !== fn.f).unwrapOrDefault(true))
            fn.f(params)
    }
  }
}
