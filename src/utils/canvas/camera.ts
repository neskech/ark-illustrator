import { NDArray } from 'vectorious';
import { requires } from '../contracts';
import { Float32Vector2, Float32Vector3, Float32Vector4, Matrix2x2, Matrix4, type Matrix4x4 } from 'matrixgl';
import { Int32Vector2, add } from '../web/vector';
import { CanvasState } from './canvas';

const DEFAULT_ZOOM = 1;
const MIN_ZOOM = 0.1;
const MAX_ZOOM = 1;

export default class Camera {
  private position: Float32Vector3;
  private rotation: number;
  private fov: number;
  private zNear: number;
  private zFar: number;
  private screenAspectRatio: number;

  constructor(canvasAspectRatio: number, screenAspectRatio: number) {
    requires(canvasAspectRatio > 0 && screenAspectRatio > 0);

    /**
     * We desire for z = 1 to be the 'default zoom' level
     * at which the entire canvas pixel perfectly envelopes
     * the camera (edges of canvas are perfectly on the edges
     * of the canvas)
     *
     * In t his coordinate space, the canvas is 1 x 1 in dimensions.
     * We scale the width by the aspect ratio, making it
     * aspect_ratio x 1 in dimensions
     *
     * We take the fov, the angle on the horizontal axis of the
     * camera fustrum. Aspect ration / 2 is the front of this
     * triangle, with default zoom z = 1 being the left.
     * Looks something like this
     *
     *    asp/2
     *     _ _ _
     *    |    /
     * 1  |   /
     *    |  /
     *    | /
     *     ^
     *     angle = fov / 2
     */
    this.fov = Math.atan2(screenAspectRatio / 2, DEFAULT_ZOOM - MIN_ZOOM) * 2;

    this.rotation = 0;
    this.position = new Float32Vector3(0, 0, DEFAULT_ZOOM);
    this.screenAspectRatio = screenAspectRatio;

    /**
     * If we zoom in farther than zNear, the canvas
     * will be clipped out of existance
     *
     * If we zoom out farther than zFar, the canvas
     * will likewise be clipped out of existance
     *
     * Hence we sync the values with eachother such
     * that they are equal
     */
    this.zNear = MIN_ZOOM;
    this.zFar = MAX_ZOOM;
  }

  translateRotation(translation: number) {
    this.rotation = (translation + this.rotation) % 360;
  }

  setRotation(theta: number) {
    this.rotation = 0;
    this.translateRotation(theta);
  }

  translatePosition(translation: Float32Vector2) {
    const rotated = this.rotateVectorToBasis(translation);
    add(this.position, rotated);
  }

  setPosition(position: Float32Vector2) {
    this.position.x = position.x;
    this.position.y = position.y;
  }

  translateZoom(translation: number) {
    const newZ = this.position.z + translation;
    this.position.z = clamp(MIN_ZOOM, MAX_ZOOM, newZ);
  }

  setZoom(zoomLevel: number) {
    this.position.z = 0;
    this.translateZoom(zoomLevel);
  }

  getViewMatrix(): Matrix4x4 {
    const lookAtPos = new Float32Vector3(this.position.x, this.position.y, 0);
    const theta = deg2Rads(this.rotation);
    const upVector = new Float32Vector3(-Math.sin(theta), Math.cos(theta), 0);

    return Matrix4.lookAt(this.position, lookAtPos, upVector);
  }

  getProjectionMatrix(): Matrix4x4 {
    return Matrix4.perspective({
      fovYRadian: this.fov,
      aspectRatio: this.screenAspectRatio,
      near: this.zNear,
      far: this.zFar,
    });
  }

  getTransformMatrix(): Matrix4x4 {
    return Matrix4.identity()
      .translate(this.position.x, this.position.y, 0)
      .rotateZ(deg2Rads(this.rotation));
  }

  private getRotationMatrix(): Matrix2x2 {
    const theta = deg2Rads(this.rotation);
    return new Matrix2x2(Math.cos(theta), -Math.sin(theta), Math.sin(theta), Math.cos(theta));
  }

  rotateVectorToBasis(v: Float32Vector2): Float32Vector2 {
    const mat = this.getRotationMatrix();
    const x = v.x * mat.values[0] + v.y * mat.values[1];
    const y = v.x * mat.values[2] + v.y * mat.values[3];
    return new Float32Vector2(x, y);
  }

  toString(): string {
    return `Camera Object --\n
            Position: ${this.position.toString()}\n
            Rotation: ${this.rotation}\n
            Fov: ${this.fov}\n
            zNear: ${this.zNear}\n
            zFar: ${this.zFar}\n\n

            Matrices --\n
            View Matrix: ${this.getViewMatrix().toString()}\n\n
            Projection Matrix: ${this.getProjectionMatrix().toString()}\n\n
            Rotation Matrix: ${this.getRotationMatrix().toString()}
    `;
  }

  log(logger: (s: string) => void = console.log) {
    logger(this.toString());
  }

  mouseToWorld(event: MouseEvent, state: CanvasState): Float32Vector2 {
     const p = mouseToNDC(event, state);

     /**
      * Standard NDC coordinates put p in a [-1, 1] range with 
      * 
      * LHS = -x = -1
      * RHS = +x = +1
      * 
      * TOP = +y = 1
      * BOTTOM = -y = -1
      * 
      * Now, we define the canvas to have a WIDTH of 'screen aspect ratio' 
      * and a height of 1
      * 
      * This means that...
      * 
      * LHS = -x = -aspRatio / 2
      * RHS = +x = +aspRatio / 2
      * 
      * TOP = +y = 0.5
      * BOTTOM = -y = -0.5
      * 
      * Thus we multiply the coordinates by the width and height of the
      * canvas / 2
      */
     const width = this.screenAspectRatio;
     const height = 1;
     p.x *= width / 2;
     p.y *= height / 2;

     return p;
  }
}

export function mouseToCanvas(event: MouseEvent, state: CanvasState): Int32Vector2 {
  const x = event.clientX - state.canvasRect.left;
  const y = event.clientY - state.canvasRect.top;
  return new Int32Vector2(x, y);
}

export function mouseToNormalized(event: MouseEvent, state: CanvasState): Float32Vector2 {
  const x = (event.clientX - state.canvasRect.left) / state.canvasWidth;
  const y = (event.clientY - state.canvasRect.top) / state.canvasHeight;
  return new Float32Vector2(x, 1.0 - y);
}

export function mouseToNDC(event: MouseEvent, state: CanvasState): Float32Vector2 {
  const p = mouseToNormalized(event, state);
  p.x = (p.x - 0.5) * 2.0;
  p.y = (p.y - 0.5) * 2.0;
  return p;
}

function matMult(m: Matrix4x4, v: Float32Vector4): Float32Vector4 {
  const b = new Float32Vector4(0, 0, 0, 0);
  for (let r = 0; r < 4; r++) {

    let val = 0;
    for (let c = 0; c < 4; c++)
      val += m.values[r * 4 + c] * v.values[c];
    b.values[r] = val;
  }
  return b;
} 

function deg2Rads(degrees: number): number {
  return degrees * (Math.PI / 180);
}

function clamp(min: number, max: number, x: number): number {
  return x < min ? min : x > max ? max : x;
}
