import { symbol } from 'zod';
import { GL, GLObject } from './glUtils';

type BindFunc = () => void;
type UnbindFunc = () => void;

export class BindHandle implements Disposable {
  private unBindFunc: UnbindFunc;

  constructor(bindFunc: BindFunc, unBindFunc: UnbindFunc) {
    this.unBindFunc = unBindFunc;
    bindFunc()
  }

  [Symbol.dispose]() {
    this.unBindFunc()
  }
}

using s = new BindHandle(() => {}, () => {})