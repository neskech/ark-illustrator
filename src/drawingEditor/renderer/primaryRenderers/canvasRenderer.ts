import type FrameBuffer from '~/util/webglWrapper/frameBuffer';
import { Float32Vector2 } from 'matrixgl';
import {
  type GetAttributesType,
  VertexAttributes,
  VertexAttributeType,
} from '~/util/webglWrapper/vertexAttributes';
import type Shader from '~/util/webglWrapper/shader';
import { VertexArrayObject } from '~/util/webglWrapper/vertexArray';
import type Camera from '~/drawingEditor/canvas/camera';
import Buffer from '~/util/webglWrapper/buffer';
import type AssetManager from '../util/assetManager';
import { QuadilateralFactory } from '../geometry/quadFactory';
import { QuadTransform } from '../geometry/transform';
import { QuadPositioner } from '../geometry/positioner';
import { QuadRotator } from '../geometry/rotator';
import { gl } from '~/drawingEditor/application';
import { clearScreen } from '../util/util';

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
//! CONSTANTS
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

const CANVAS_ORIGIN = new Float32Vector2(0, 0);
const SIZE_VERTEX = 4;
const NUM_VERTEX_QUAD = 6;

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
//! TYPE DEFINITIONS
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

const vertexAttributes = new VertexAttributes({
  position: VertexAttributeType.floatList(2),
  texCord: VertexAttributeType.floatList(2),
});

type AttribsType = GetAttributesType<typeof vertexAttributes>;
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
//! CLASS DEFINITION
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

export default class CanvasRenderer {
  private vertexArray: VertexArrayObject<AttribsType>;
  private vertexBuffer: Buffer;
  private quadFactory: QuadilateralFactory<AttribsType>;
  private shader: Shader;
  private camera: Camera;

  constructor(camera: Camera, assetManager: AssetManager) {
    this.vertexArray = new VertexArrayObject(vertexAttributes);
    this.vertexBuffer = new Buffer({
      btype: 'VertexBuffer',
      usage: 'Static Draw',
    });
    this.quadFactory = new QuadilateralFactory(vertexAttributes);
    this.shader = assetManager.getShader('world');
    this.camera = camera;

    this.initBuffers();
  }

  private initBuffers() {
    this.vertexArray.bind();
    this.vertexBuffer.bind();

    this.vertexArray.applyAttributes();
    const aspectRatio = this.camera.getAspRatio();
    const quadBuffer = new Float32Array(NUM_VERTEX_QUAD * SIZE_VERTEX);

    this.quadFactory.emplaceRectangle({
      transform: QuadTransform.builder()
        .position(QuadPositioner.center(CANVAS_ORIGIN))
        .rotate(QuadRotator.identity())
        .build(),
      width: aspectRatio,
      height: 1,
      attributes: {
        bottomLeft: {
          texCord: [0, 0],
        },
        bottomRight: {
          texCord: [1, 0],
        },
        topLeft: {
          texCord: [0, 1],
        },
        topRight: {
          texCord: [1, 1],
        },
      },
      buffer: quadBuffer,
      offset: 0,
    });

    this.vertexBuffer.allocateWithData(quadBuffer);

    this.vertexArray.unBind();
    this.vertexBuffer.unBind();
  }

  render(canvasFramebuffer: FrameBuffer): void {
    this.vertexArray.bind();
    this.vertexBuffer.bind();

    const canvasTexture = canvasFramebuffer.getTextureAttachment();

    clearScreen(0, 0, 0, 1);
    gl.blendFunc(gl.ONE, gl.ZERO);

    this.shader.bind();
    this.shader.uploadMatrix4x4('view', this.camera.getViewMatrix());
    this.shader.uploadMatrix4x4('projection', this.camera.getProjectionMatrix());

    gl.activeTexture(gl.TEXTURE0);
    canvasTexture.bind();
    this.shader.uploadTexture('canvas', canvasTexture, 0);

    gl.drawArrays(gl.TRIANGLES, 0, NUM_VERTEX_QUAD);

    canvasTexture.unBind();
    this.shader.unBind();

    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    this.vertexArray.unBind();
    this.vertexBuffer.unBind();
  }
}
