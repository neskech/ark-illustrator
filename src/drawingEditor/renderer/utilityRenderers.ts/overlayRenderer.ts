import {
  type GetAttributesType,
  VertexAttributes,
  VertexAttributeType,
} from '~/drawingEditor/webgl/vertexAttributes';
import { VertexArrayObject } from '~/drawingEditor/webgl/vertexArray';
import type Shader from '~/drawingEditor/webgl/shader';
import Buffer from '~/drawingEditor/webgl/buffer';
import { Float32Vector2 } from 'matrixgl';
import type FrameBuffer from '~/drawingEditor/webgl/frameBuffer';
import { QuadilateralFactory } from '../geometry/quadFactory';
import { QuadTransform } from '../geometry/transform';
import { QuadPositioner } from '../geometry/positioner';
import { QuadRotator } from '../geometry/rotator';
import type AssetManager from '../util/assetManager';
import { gl } from '~/drawingEditor/application';
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
//! CONSTANTS
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

const SCREEN_ORIGIN = new Float32Vector2(0, 0);
const SCREEN_WIDTH = 1;
const SCREEN_HEIGHT = 1;

const NUM_VERTICES_QUAD = 6;
const VERTEX_SIZE_POS_ = 2;
const SIZE_FULL_SCREEN_QUAD = VERTEX_SIZE_POS_ * NUM_VERTICES_QUAD;

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
//! TYPE DEFINITIONS
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

const vertexAttributes = new VertexAttributes({
  position: VertexAttributeType.floatList(2),
});
type AttribsType = GetAttributesType<typeof vertexAttributes>;

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
//! MAIN CLASS
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

export default class OverlayRenderer {
  private vertexArray: VertexArrayObject<AttribsType>;
  private vertexBuffer: Buffer;
  private quadFactory: QuadilateralFactory<AttribsType>;
  private shader: Shader;

  constructor(assetManager: AssetManager) {
    this.vertexArray = new VertexArrayObject(vertexAttributes);
    this.vertexBuffer = new Buffer({
      btype: 'VertexBuffer',
      usage: 'Static Draw',
    });
    this.quadFactory = new QuadilateralFactory(vertexAttributes);
    this.shader = assetManager.getShader('blit');
    this.initBuffers();
  }

  private initBuffers() {
    this.vertexArray.bind();
    this.vertexBuffer.bind();

    this.vertexArray.applyAttributes();

    const quadBuffer = new Float32Array(SIZE_FULL_SCREEN_QUAD);

    this.quadFactory.emplaceRectangle({
      transform: QuadTransform.builder()
        .position(QuadPositioner.center(SCREEN_ORIGIN))
        .rotate(QuadRotator.identity())
        .build(),
      width: SCREEN_WIDTH * 2,
      height: SCREEN_HEIGHT * 2,
      attributes: {},
      buffer: quadBuffer,
      offset: 0,
    });

    this.vertexBuffer.allocateWithData(quadBuffer);

    this.vertexArray.unBind();
    this.vertexBuffer.unBind();
  }

  renderCanvasToOverlay(canvasFramebuffer: FrameBuffer, canvasOverlayFramebuffer: FrameBuffer) {
    canvasOverlayFramebuffer.bind();
    gl.blendFunc(gl.ONE, gl.ZERO);

    const canvasTexture = canvasFramebuffer.getTextureAttachment();

    this.vertexArray.bind();
    this.vertexBuffer.bind();
    this.shader.bind();

    gl.activeTexture(gl.TEXTURE0);
    canvasTexture.bind();
    this.shader.uploadTexture('canvas', canvasTexture, 0);

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    canvasTexture.unBind();
    this.shader.unBind();
    this.vertexArray.unBind();
    this.vertexBuffer.unBind();
    canvasOverlayFramebuffer.unBind();
  }
}
