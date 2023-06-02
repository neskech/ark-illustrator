import { ensures, requires } from "../contracts";

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
    requires(this.isValid(), 'Tried to access invalid GL id' +
            `\nOn gl object of type ${this.forGLObjectOfType}`)

    return this.id
  }

  isValid(): boolean {
    return this.valid;
  }

  invalidate() {
    this.valid = false;
  }

  destroy(destructor: (id: T) => void) {
     if (this.isValid()) 
        destructor(this.id)
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GLFun = (...args: any[]) => any

export function glOpErr<F extends GLFun>(gl: GL, fn: F, ...args: Parameters<F>): ReturnType<F> {
    const res = fn(...args) as ReturnType<F>;

    ensures(() => {
      const err = gl.getError()

      switch (err) {

        case gl.INVALID_ENUM:
          console.error(`Invalid enum error for webgl function '${fn.name}'`)
          console.trace()
          return false;

        case gl.INVALID_VALUE:
          console.error(`Invalid valid error for webgl function '${fn.name}'`)
          console.trace()
          return false;

        case gl.INVALID_OPERATION:
          console.error(`Invalid operation error for webgl function '${fn.name}'`)
          console.trace()
          return false;

        case gl.INVALID_FRAMEBUFFER_OPERATION:
          console.error(`Invalid framebuffer operation error for webgl function '${fn.name}'`)
          console.trace()
          return false;

        case gl.OUT_OF_MEMORY:
          console.error(`Out of memory error for webgl function '${fn.name}'`)
          console.trace()
          return false;

        case gl.CONTEXT_LOST_WEBGL:
          console.error(`Context lost error for webgl function '${fn.name}'`)
          console.trace()
          return false;

        default:
          if (res == null) {
            console.error(`Context lost error for webgl function '${fn.name}'`)
            console.trace()
            return false;
          }

          return true;
      }
    })

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return res
}

export type Color = [number, number, number, number]
export function colorTypeToPacked(c: Color): number {
   const [r, g, b, a] = c;
   return (r << 24) | (g << 16) | (b << 8) | a;
}

export function benchmarkLog(msg: string, f: () => void) {
   console.time(msg);
   f();
   console.timeEnd(msg);
}

