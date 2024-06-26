import type FrameBuffer from '~/util/webglWrapper/frameBuffer';
import { Float32Vector2 } from 'matrixgl';
import {
  type GetAttributesType,
  VertexAttributes,
  VertexAttributeType,
} from '~/util/webglWrapper/vertexAttributes';
import type Shader from '~/util/webglWrapper/shader';
import { VertexArrayObject } from '~/util/webglWrapper/vertexArray';
import Buffer from '~/util/webglWrapper/buffer';
import type AssetManager from '../util/assetManager';
import { QuadilateralFactory } from '../geometry/quadFactory';
import { QuadTransform } from '../geometry/transform';
import { QuadPositioner } from '../geometry/positioner';
import { QuadRotator } from '../geometry/rotator';
import { gl } from '~/drawingEditor/application';
import { clearScreen } from '../util/renderUtils';
import type Camera from '../camera';
import { type PrimaryRendererContext } from './primaryRenderers';

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

type CanvasRendererContext = { canvasFramebuffer: FrameBuffer } & PrimaryRendererContext;
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

  constructor(camera: Camera, assetManager: AssetManager) {
    this.vertexArray = new VertexArrayObject(vertexAttributes);
    this.vertexBuffer = new Buffer({
      btype: 'VertexBuffer',
      usage: 'Static Draw',
    });
    this.quadFactory = new QuadilateralFactory(vertexAttributes);
    this.shader = assetManager.getShader('world');

    this.initBuffers(camera);
  }

  private initBuffers(camera: Camera) {
    this.vertexArray.bind();
    this.vertexBuffer.bind();

    this.vertexArray.applyAttributes();
    const aspectRatio = camera.getAspRatio();
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

  render(context: CanvasRendererContext): void {
    this.vertexArray.bind();
    this.vertexBuffer.bind();

    const canvasTexture = context.canvasFramebuffer.getTextureAttachment();

    clearScreen(0, 0, 0, 1);
    gl.blendFunc(gl.ONE, gl.ZERO);

    this.shader.bind();
    this.shader.uploadMatrix4x4('view', context.camera.getViewMatrix());
    this.shader.uploadMatrix4x4('projection', context.camera.getProjectionMatrix());

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
