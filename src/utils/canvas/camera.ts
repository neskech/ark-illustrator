import { NDArray } from "vectorious";
import { requires } from "../contracts";
import {
  type Mat2x2,
  type Mat4x4,
  type Vec3F,
  mat2x2,
  vec3F,
} from "../web/vector";

const CANVAS_WIDTH = 1;
const CANVAS_HEIGHT = 1;
const DEFAULT_ZOOM = 1;

const MIN_ZOOM = 0.1;
const MAX_ZOOM = 10;

function viewMatrixFrom(
  look: Vec3F,
  up: Vec3F,
  right: Vec3F,
  position: Vec3F
): Mat4x4 {
  //https://learnopengl.com/Getting-started/Camera
  const leftMat = new NDArray(
    [
      [look.val.x, look.val.y, look.val.z, 0],
      [up.val.x, up.val.y, up.val.z, 0],
      [right.val.x, right.val.y, right.val.z, 0],
      [0, 0, 0, 1],
    ],
    {
      shape: [4, 4],
      dtype: "float32",
    }
  );
  const rightMat = new NDArray(
    [
      [1, 0, 0, -position.val.x],
      [0, 1, 0, -position.val.y],
      [0, 0, 1, -position.val.z],
      [0, 0, 0, 1],
    ],
    {
      shape: [4, 4],
      dtype: "float32",
    }
  );
  leftMat.dot(rightMat);
  return { val: leftMat, __type: "Mat4x4" };
}

class Camera {
  position: Vec3F;
  rotation: number;
  fov: number;
  zNear: number;
  zFar: number;

  viewMatrix: Mat4x4;
  projectionMatrix: Mat4x4;

  rotationMatrix: Mat2x2;
  inverseRotationMatrix: Mat2x2;

  constructor(aspectRatio: number) {
    requires(aspectRatio > 0);

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
    this.fov = Math.atan2(aspectRatio / 2, DEFAULT_ZOOM) * 2;

    this.rotation = 0;
    this.position = vec3F(0, 0, 1);

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

    /**
     * Since the user may be static (no camera movements)
     * for much of the time (as is the nature of a drawing
     * application) it seems reasonable to cache these matrices'
     * instead of constantly recreating them
     *
     * Even if we did update consistently, having values that
     * stick around like this prevents unnecessary heap allocations
     */
    //https://learnopengl.com/Getting-started/Camera
    const camDirection = vec3F(0, 0, -1); //looking towards negative z
    const camUp = vec3F(0, 1, 0);
    const camRight = vec3F(1, 0, 0);
    this.viewMatrix = viewMatrixFrom(camDirection, camUp, camRight, this.position);

    this.projectionMatrix = 
    this.makePerspectiveMatrix();
    /**
     * The standard basis corresponds to rotation
     * = 0
     */
    this.rotationMatrix = mat2x2([
      [1, 0],
      [0, 1],
    ]);
    this.inverseRotationMatrix = mat2x2([
      [1, 0],
      [0, 1],
    ]);
  }

  makeViewMatrix() {}

  makePerspectiveMatrix() {}

  updateRotation() {
    //https://en.wikipedia.org/wiki/Rotation_matrix
    this.rotationMatrix.val.da
  }
}
