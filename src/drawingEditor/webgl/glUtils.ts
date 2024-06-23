import { Option } from '~/util/general/option';
import { ensures, requires } from '../../util/general/contracts';
import { gl } from '../application';
// eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-assignment
const WebGLDebugUtils = require('webgl-debug');

export type GL = WebGL2RenderingContext;

export class GLObject<T> {
  private id: T;
  private valid: boolean;
  private forGLObjectOfType: string;

  constructor(id_: T, objectType = 'unknown') {
    this.id = id_;
    this.valid = true;
    this.forGLObjectOfType = objectType;
  }

  innerId(): T {
    requires(
      this.isValid(),
      'Tried to access invalid GL id' + `\nOn gl object of type ${this.forGLObjectOfType}`
    );

    return this.id;
  }

  isValid(): boolean {
    return this.valid;
  }

  invalidate() {
    this.valid = false;
  }

  destroy(destructor: (id: T) => void) {
    if (this.isValid()) destructor(this.id);
  }
}

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

export function fetchWebGLContext(canvas: HTMLCanvasElement, debug = false): Option<GL> {
  const context = Option.fromNull(
    canvas.getContext('webgl2', {
      preserveDrawingBuffer: true,
    })
  );

  function throwOnGLError(err: string, funcName: string, _: unknown[]) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    const errStr: string = WebGLDebugUtils.glEnumToString(err) as string;
    throw new Error(errStr + 'was caused by call to ' + funcName);
  }

  const debugCtx = context.map((ctx) => {
    if (!debug) return ctx;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    return WebGLDebugUtils.makeDebugContext(ctx, throwOnGLError) as GL;
  });

  return debugCtx;
}

export function checkError(fnName = 'unknown') {
  ensures(() => {
    const err = gl.getError();

    switch (err) {
      case gl.INVALID_ENUM:
        console.error(`Invalid enum error for webgl function '${fnName}'`);
        return false;

      case gl.INVALID_VALUE:
        console.error(`Invalid valid error for webgl function '${fnName}'`);
        return false;

      case gl.INVALID_OPERATION:
        console.error(`Invalid operation error for webgl function '${fnName}'`);
        return false;

      case gl.INVALID_FRAMEBUFFER_OPERATION:
        console.error(`Invalid framebuffer operation error for webgl function '${fnName}'`);
        return false;

      case gl.OUT_OF_MEMORY:
        console.error(`Out of memory error for webgl function '${fnName}'`);
        return false;

      case gl.CONTEXT_LOST_WEBGL:
        console.error(`Context lost error for webgl function '${fnName}'`);
        return false;

      default:
        return true;
    }
  });
}

export type Color = [number, number, number, number];
export function colorTypeToPacked(c: Color): number {
  const [r, g, b, a] = c;
  return (r << 24) | (g << 16) | (b << 8) | a;
}
