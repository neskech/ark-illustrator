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
import { type GL } from '~/drawingEditor/webgl/glUtils';
import { QuadTransform } from '../geometry/transform';
import { QuadPositioner } from '../geometry/positioner';
import { QuadRotator } from '../geometry/rotator';
import type AssetManager from '../assetManager';
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
  private gl: GL;
  private vertexArray: VertexArrayObject<AttribsType>;
  private vertexBuffer: Buffer;
  private quadFactory: QuadilateralFactory<AttribsType>;
  private shader: Shader;

  constructor(gl: GL, assetManager: AssetManager) {
    this.gl = gl;
    this.vertexArray = new VertexArrayObject(this.gl, vertexAttributes);
    this.vertexBuffer = new Buffer(this.gl, {
      btype: 'VertexBuffer',
      usage: 'Static Draw',
    });
    this.quadFactory = new QuadilateralFactory(vertexAttributes);
    this.shader = assetManager.getShader('blit');
    this.initBuffers();
  }

  private initBuffers() {
    this.vertexArray.bind(this.gl);
    this.vertexBuffer.bind(this.gl);

    this.vertexArray.applyAttributes(this.gl);

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

    this.vertexBuffer.allocateWithData(this.gl, quadBuffer);

    this.vertexArray.unBind(this.gl);
    this.vertexBuffer.unBind(this.gl);
  }

  renderCanvasToOverlay(canvasFramebuffer: FrameBuffer, canvasOverlayFramebuffer: FrameBuffer) {
    canvasOverlayFramebuffer.bind(this.gl);
    this.gl.blendFunc(this.gl.ONE, this.gl.ZERO);

    const canvasTexture = canvasFramebuffer.getTextureAttachment();

    this.vertexArray.bind(this.gl);
    this.vertexBuffer.bind(this.gl);
    this.shader.use(this.gl);

    this.gl.activeTexture(this.gl.TEXTURE0);
    canvasTexture.bind(this.gl);
    this.shader.uploadTexture(this.gl, 'canvas', canvasTexture, 0);

    this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);

    canvasTexture.unBind(this.gl);
    this.shader.stopUsing(this.gl);
    this.vertexArray.unBind(this.gl);
    this.vertexBuffer.unBind(this.gl);
    canvasOverlayFramebuffer.unBind(this.gl);
  }
}
