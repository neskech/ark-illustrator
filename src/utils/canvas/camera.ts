import { NDArray } from "vectorious";
import { requires } from "../contracts";
import { Float32Vector2, Float32Vector3, Matrix2x2, Matrix4, type Matrix4x4 } from "matrixgl";
import { add } from '../web/vector';

const DEFAULT_ZOOM = 1;
const MIN_ZOOM = 0.1;
const MAX_ZOOM = 10;

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
    this.fov = Math.atan2(canvasAspectRatio / 2, DEFAULT_ZOOM) * 2;

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
      far: this.zFar
    })
   
  }

  getTransformMatrixRaw(): Matrix4x4 {
    return Matrix4.identity().translate(this.position.x, this.position.y, 0).rotateZ(deg2Rads(this.rotation));
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
            Rotation Matrix: ${rotationMatrixFrom(this.rotation).toString()}
    `;
  }

  log(logger: (s: string) => void = console.log) {
    logger(this.toString());
  }
}


function rotationMatrixFrom(theta: number): NDArray {
  return new NDArray(
    [
      [Math.cos(theta), -Math.sin(theta)],
      [Math.sin(theta), Math.cos(theta)],
    ],
    {
      shape: [2, 2],
      dtype: "float32",
    }
  );
}


function deg2Rads(degrees: number): number {
  return degrees * (Math.PI / 180);
}

function clamp(min: number, max: number, x: number): number {
  return x < min ? min : x > max ? max : x;
}
