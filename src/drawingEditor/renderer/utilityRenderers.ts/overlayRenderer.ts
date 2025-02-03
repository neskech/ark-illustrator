import {
  type GetAttributesType,
  VertexAttributes,
  VertexAttributeType,
} from '~/util/webglWrapper/vertexAttributes';
import { VertexArrayObject } from '~/util/webglWrapper/vertexArray';
import type Shader from '~/util/webglWrapper/shader';
import Buffer from '~/util/webglWrapper/buffer';
import type FrameBuffer from '~/util/webglWrapper/frameBuffer';
import { QuadilateralFactory } from '../geometry/quadFactory';
import { QuadTransform } from '../geometry/transform';
import { QuadPositioner } from '../geometry/positioner';
import { QuadRotator } from '../geometry/rotator';
import type AssetManager from '../util/assetManager';
import { gl } from '~/drawingEditor/application';
import type Texture from '~/util/webglWrapper/texture';
import { Vector2 } from 'matrixgl_fork';
import { type BlendMode, BlendModeUtils } from '~/drawingEditor/canvas/blendMode';
import { TextureCreator } from '../../../util/webglWrapper/texture';
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
//! CONSTANTS
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

const SCREEN_ORIGIN = new Vector2(0, 0);
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
  private blitShader: Shader;
  private blendShader: Shader;

  constructor(assetManager: AssetManager) {
    this.vertexArray = new VertexArrayObject(vertexAttributes);
    this.vertexBuffer = new Buffer({
      btype: 'VertexBuffer',
      usage: 'Static Draw',
    });
    this.quadFactory = new QuadilateralFactory(vertexAttributes);
    this.blitShader = assetManager.getShader('blit');
    this.blendShader = assetManager.getShader('blend');
    this.initBuffers();
  }

  renderTextureOntoFramebuffer(texture: Texture, framebuffer: FrameBuffer, enableBlending = true) {
    framebuffer.bind();

    if (enableBlending) gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE);
    else gl.blendFunc(gl.ONE, gl.ZERO);

    this.vertexArray.bind();
    this.vertexBuffer.bind();
    this.blitShader.bind();

    gl.activeTexture(gl.TEXTURE0);
    texture.bind();
    this.blitShader.uploadTexture('canvas', 0);

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    texture.unBind();
    this.blitShader.unBind();
    this.vertexArray.unBind();
    this.vertexBuffer.unBind();
    framebuffer.unBind();
  }

  renderTextureOntoFramebufferAdvanced(
    texture: Texture,
    framebuffer: FrameBuffer,
    blendMode: BlendMode,
    opacity: number
  ) {
    const canvasTexture = TextureCreator.duplicateGPU(framebuffer.getTextureAttachment(), this);
    framebuffer.bind();
    gl.blendFuncSeparate(gl.ONE, gl.ZERO, gl.ONE, gl.ZERO);

    this.vertexArray.bind();
    this.vertexBuffer.bind();
    this.blendShader.bind();

    gl.activeTexture(gl.TEXTURE0);
    texture.bind();
    this.blendShader.uploadTexture('overlay', 0);

    gl.activeTexture(gl.TEXTURE1);
    canvasTexture.bind()
    this.blendShader.uploadTexture('canvas', 1);

    this.blendShader.uploadInt('blendMode', BlendModeUtils.blendModeToInt(blendMode));
    this.blendShader.uploadFloat('opacity', opacity);

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    texture.unBind();
    this.blendShader.unBind();
    this.vertexArray.unBind();
    this.vertexBuffer.unBind();
    framebuffer.unBind();
    canvasTexture.destroy();
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
}
