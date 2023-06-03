import { NDArray } from "vectorious";
import { requires } from "../contracts";
import { P } from "../func/match";
import {
  type Mat2x2,
  type Mat4x4,
  type Vec3F,
  mat2x2,
  vec3F,
  Mat3x3,
  mat3x3,
  Vec2F,
} from "../web/vector";

const CANVAS_WIDTH = 1;
const CANVAS_HEIGHT = 1;
const DEFAULT_ZOOM = 1;

const MIN_ZOOM = 0.1;
const MAX_ZOOM = 10;

function transformMatrixFrom(theta: number, translation: Vec3F): NDArray {
  const rot = new NDArray(
    [
      [Math.cos(theta), -Math.sin(theta), 0, 0],
      [Math.sin(theta), Math.cos(theta), 0, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 1],
    ],
    {
      shape: [4, 4],
      dtype: "float32",
    }
  );

  const trans = new NDArray(
    [
      [1, 0, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 1, 0],
      [translation.val.x, translation.val.y, translation.val.z, 1],
    ],
    {
      shape: [4, 4],
      dtype: "float32",
    }
  );

  return rot.multiply(trans);
}

function perspectiveMatrixFrom(
  fovInRadians: number,
  aspectRatio: number,
  zNear: number,
  zFar: number
): NDArray {
  //https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_model_view_projection#perspective_projection_matrix

  const f = 1.0 / Math.tan(fovInRadians / 2);
  const rangeInv = 1 / (zNear - zFar);
  return new NDArray(
    [
      [f / aspectRatio, 0, 0, 0],
      [0, f, 0, 0],
      [0, 0, (zNear + zFar) * rangeInv, -1],
      [0, 0, zNear * zFar * rangeInv * 2, 0],
    ],
    {
      shape: [4, 4],
      dtype: "float32",
    }
  );
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

function deg2Rads(degrees: number): number {
  return degrees * (Math.PI / 180);
}

function clamp(min: number, max: number, x: number): number {
  return x < min ? min : x > max ? max : x;
}

class Camera {
  private position: Vec3F;
  private rotation: number;
  private fov: number;
  private zNear: number;
  private zFar: number;
  private screenAspectRation: number;

  private viewMatrix: Mat4x4;
  private projectionMatrix: Mat4x4;

  private rotationMatrix: Mat2x2;

  constructor(canvasAspectRatio: number, screenAspectRation: number) {
    requires(canvasAspectRatio > 0 && screenAspectRation > 0);

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
    this.position = vec3F(0, 0, 1);
    this.screenAspectRation = screenAspectRation;

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
    const camDirection = vec3F(0, 0, -1);
    const camUp = vec3F(0, 1, 0);
    const camRight = vec3F(1, 0, 0);
    this.viewMatrix = viewMatrixFrom(
      camDirection,
      camUp,
      camRight,
      this.position
    );

    /**
     * We want the canvas to get farther away as we zoom out,
     * so an orthographic matrix would not suffice
     */
    this.projectionMatrix = this.makePerspectiveMatrix();

    /**
     * The standard basis corresponds to rotation
     * = 0
     *
     * We use this for rotating any translation vectors
     * we get in the translate() function
     */
    this.rotationMatrix = mat2x2([
      [1, 0],
      [0, 1],
    ]);
  }

  private makeViewMatrix() {
    const camDirection = vec3F(0, 0, -1);
    //second column
    const camUp = vec3F(
      this.rotationMatrix.val.data[1],
      this.rotationMatrix.val.data[3],
      0
    );
    //first column
    const camRight = vec3F(
      this.rotationMatrix.val.data[0],
      this.rotationMatrix.val.data[2],
      0
    );
    this.viewMatrix = viewMatrixFrom(
      camDirection,
      camUp,
      camRight,
      this.position
    );
  }

  private makePerspectiveMatrix() {}

  translateRotation(translation: number) {
    //https://en.wikipedia.org/wiki/Rotation_matrix
    this.rotation = (translation + this.rotation) % 360;
    const radians = deg2Rads(this.rotation);

    //TODO indexing could be wrong
    this.rotationMatrix.val.data[0] = Math.cos(radians);
    this.rotationMatrix.val.data[1] = -Math.sin(radians);
    this.rotationMatrix.val.data[3] = Math.sin(radians);
    this.rotationMatrix.val.data[4] = Math.cos(radians);

    this.makeViewMatrix();
  }

  setRotation(theta: number) {
    this.rotation = 0;
    this.translateRotation(theta);
  }

  translatePosition(translation: Vec2F) {
    const rotated = this.rotationMatrix.val.copy().multiply(translation.val);
    this.position.val.x += rotated.x;
    this.position.val.y += rotated.y;

    this.makeViewMatrix();
  }

  setPosition(position: Vec2F) {
    this.position.val.x = position.val.x;
    this.position.val.y = position.val.y;

    this.makeViewMatrix();
  }

  translateZoom(translation: number) {
    const newZ = this.position.val.z + translation;
    this.position.val.z = clamp(MIN_ZOOM, MAX_ZOOM, newZ);

    this.makeViewMatrix();
  }

  setZoom(zoomLevel: number) {
    this.position.val.z = 0;
    this.translateZoom(zoomLevel);
  }

  getViewMatrixRaw(): NDArray {
    return this.viewMatrix.val;
  }

  getProjectionMatrixRaw(): NDArray {
    return this.projectionMatrix.val;
  }

  getTransformMatrixRaw(): NDArray {
    return transformMatrixFrom(this.rotation, this.position);
  }

  toString(): string {
    return `Camera Object --\n
            Position: ${this.position.val.toString()}\n
            Rotation: ${this.rotation}\n
            Fov: ${this.fov}\n
            zNear: ${this.zNear}\n
            zFar: ${this.zFar}\n\n

            Matrices --\n
            View Matrix: ${this.viewMatrix.val.toString()}\n\n
            Projection Matrix: ${this.projectionMatrix.val.toString()}\n\n
            Rotation Matrix: ${this.rotationMatrix.val.toString()}
    `;
  }

  log(logger: (s: string) => void = console.log) {
    logger(this.toString());
  }
}
