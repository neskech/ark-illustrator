import { requires } from '../contracts';
import {
  Float32Vector2,
  Float32Vector3,
  Float32Vector4,
  Matrix2x2,
  Matrix4,
  type Matrix4x4,
} from 'matrixgl';
import { Int32Vector2, add, copy } from '../web/vector';
import { type CanvasState } from './canvas';

const DEFAULT_ZOOM = 1;
const MIN_ZOOM = 0.05;
const MAX_ZOOM = 10;

const CANVAS_HEIGHT = 1.0;

export default class Camera {
  private position: Float32Vector3;
  private rotation: number;
  private fovY: number;
  private fovX: number;
  private zNear: number;
  private zFar: number;
  private screenAspectRatio: number;
  private canvasAspectRatio: number

  constructor(canvasAspectRatio: number, screenAspectRatio: number) {
    requires(canvasAspectRatio > 0 && screenAspectRatio > 0);

    /**
     * We desire for z = 1 to be the 'default zoom' level
     * at which the entire canvas pixel perfectly envelopes
     * the camera (edges of canvas are perfectly on the edges
     * of the canvas)
     *
     * In this coordinate space, the canvas is 1 x 1 in dimensions.
     * We scale the width by the aspect ratio, making it
     * aspect_ratio x 1 in dimensions
     *
     * We take the fov, the angle on the horizontal axis of the
     * camera fustrum. Aspect ratio / 2 is the front of this
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
    this.fovY = Math.atan2(CANVAS_HEIGHT / 2, DEFAULT_ZOOM) * 2;
    this.fovX = Math.atan2(screenAspectRatio / 2, DEFAULT_ZOOM) * 2;

    this.rotation = 0;
    this.position = new Float32Vector3(0, 0, DEFAULT_ZOOM + 0.5);
    this.screenAspectRatio = screenAspectRatio;
    this.canvasAspectRatio = canvasAspectRatio

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
      fovYRadian:  this.fovY,
      aspectRatio: this.canvasAspectRatio,
      near: this.zNear,
      far: this.zFar,
    });
  }

  getTransformMatrix(): Matrix4x4 {
    return Matrix4.identity()
      .translate(this.position.x, this.position.y, 0)
  }

  getTransformMatrixWithRotation(): Matrix4x4 {
    return Matrix4.identity()
      .translate(this.position.x, this.position.y, 0)
      .rotateZ(deg2Rads(this.rotation))
  }

  private getRotationMatrix(): Matrix2x2 {
    const theta = deg2Rads(this.rotation);
    return new Matrix2x2(
      Math.cos(theta),
      -Math.sin(theta),
      Math.sin(theta),
      Math.cos(theta)
    );
  }

  rotateVectorToBasis(v: Float32Vector2): Float32Vector2 {
    const mat = this.getRotationMatrix();
    const x = v.x * mat.values[0] + v.y * mat.values[1];
    const y = v.x * mat.values[2] + v.y * mat.values[3];
    return new Float32Vector2(x, y);
  }

  getCameraWidth(): number {
    return 2 * this.position.z * Math.tan(this.fovX / 2);
  }

  toString(): string {
    return `Camera Object --\n
            Position: ${this.position.toString()}\n
            Rotation: ${this.rotation}\n
            FovY: ${this.fovY}\n
            FovX: ${this.fovX}\n
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

  mouseToWorld(event: PointerEvent, state: CanvasState): Float32Vector2 {
    const p = mouseToNDC(event, state);
    
    /**
     * Standard NDC coordinates put p in a [-1, 1] range with
     *
     * LHS = -x = -1
     * RHS = +x = +1
     *
     * TOP = +y = 1
     * BOTTOM = -y = -1
     */
    const width = this.position.z * Math.tan(this.fovX / 2);
    const height = this.position.z  * Math.tan(this.fovY / 2)
    p.x *= width;
    p.y *= height;

    const rotated = this.rotateVectorToBasis(p)
    rotated.x += this.position.x
    rotated.y += this.position.y
    const projected = this.mulVecByProjection(rotated)

    return projected;
  }

  getAspRatio(): number {
    return this.screenAspectRatio;
  }

  getMV(): Matrix4x4 {
    return this.getProjectionMatrix()
      .mulByMatrix4(this.getViewMatrix())
  }

  mulVecByMV(v: Float32Vector2): Float32Vector2 {
    return matMult(this.getMV(), new Float32Vector4(v.x, v.y, 0, 0));
  }

  mulVecByTransform(v: Float32Vector2): Float32Vector2 {
    return matMult(this.getTransformMatrixWithRotation(), new Float32Vector4(v.x, v.y, 0, 0))
  }

  mulVecByProjection(v: Float32Vector2): Float32Vector2 {
    return matMult(this.getProjectionMatrix(), new Float32Vector4(v.x, v.y, 0, 0))
  }

  getPosition(): Float32Vector2 {
    return copy(this.position)
  }

  getZoomLevel(): number {
    return this.position.z
  }
}

export function mouseToCanvas(event: MouseEvent, state: CanvasState): Int32Vector2 {
  const rect = state.canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  return new Int32Vector2(x, y);
}

export function mouseToNormalizedWithEvent(event: PointerEvent | MouseEvent, state: CanvasState): Float32Vector2 {
  const rect = state.canvas.getBoundingClientRect();
  const x = (event.clientX - rect.left) / state.canvas.clientWidth;
  const y = (event.clientY - rect.top) / state.canvas.clientHeight;
  return new Float32Vector2(x, 1.0 - y);
}

export function mouseToNormalized(mousePos: Float32Vector2, state: CanvasState): Float32Vector2 {
  const rect = state.canvas.getBoundingClientRect();
  const x = (mousePos.x
    - rect.left) / state.canvas.clientWidth;
  const y = (mousePos.y - rect.top) / state.canvas.clientHeight;
  return new Float32Vector2(x, 1.0 - y);
}

export function mouseToNDC(event: PointerEvent, state: CanvasState): Float32Vector2 {
  const p = mouseToNormalizedWithEvent(event, state);
  p.x = (p.x - 0.5) * 2.0;
  p.y = (p.y - 0.5) * 2.0;
  return p;
}

function matMult(m: Matrix4x4, v: Float32Vector4): Float32Vector4 {
  const b = new Float32Vector4(0, 0, 0, 0);
  for (let r = 0; r < 4; r++) {
    let val = 0;
    for (let c = 0; c < 4; c++) val += m.values[r * 4 + c] * v.values[c];
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
