import { requires } from '../general/contracts';
import { unreachable } from '../general/funUtils';
import { Option } from '../general/option';
import { gl } from '../../drawingEditor/application';
import { GLObject } from './glUtils';
import type Texture from './texture';
import { TextureCreator } from './texture';
import { type TextureOptions } from './texture';

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
//! TYPES
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

type FrameBufferTarget = 'Regular' | 'Draw' | 'Read';
type Filter = 'Linear' | 'Nearest';
type Format = 'RGBA' | 'RGB' | 'ALPHA';

export interface ReadPixelOptions {
  lowerLeftX: number;
  lowerLeftY: number;
  width: number;
  height: number;
  format: Format;
  pixelBuffer: Uint8Array;
}

interface BlitOptions {
  srcBottomLeft: [number, number];
  srcTopLeft: [number, number];
  dstBottomLeft: [number, number];
  dstTopLeft: [number, number];
  filter: Filter;
}

type FrameBufferOptionsWithNoTexture = {
  type: 'no texture';
  target: FrameBufferTarget;
} & TextureOptions;

type FrameBufferOptionsWithTexture = {
  type: 'with texture';
  target: FrameBufferTarget;
  texture: Texture;
};

type FrameBufferOptions = FrameBufferOptionsWithTexture | FrameBufferOptionsWithNoTexture;

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
//! CLASS DEFINITION
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

export default class FrameBuffer {
  private id: GLObject<WebGLFramebuffer>;
  private target: FrameBufferTarget;
  private width: number;
  private height: number;
  private attachedTexture: Texture;

  constructor(options: FrameBufferOptions) {
    const fId = Option.fromNull(gl.createFramebuffer());
    const fgId = fId.expect("Couldn't create frame buffer");
    this.id = new GLObject(fgId);
    this.target = options.target;

    if (options.type == 'with texture') {
      this.attachedTexture = options.texture;
      this.width = options.texture.getWidth();
      this.height = options.texture.getHeight();
      this.attachTexture();
      return;
    }

    this.width = options.width;
    this.height = options.height;
    this.attachedTexture = TextureCreator.allocateEmpty({
      width: options.width,
      height: options.height,
      wrapX: options.wrapX,
      wrapY: options.wrapY,
      minFilter: options.minFilter,
      magFilter: options.magFilter,
      format: options.format,
    });
    this.attachTexture();
  }

  public blitTo(readBuffer: FrameBuffer, blitOptions: BlitOptions, handleBinding = false) {
    if (handleBinding) {
      this.bind();
      readBuffer.bind();
    }

    gl.blitFramebuffer(
      blitOptions.srcBottomLeft[0],
      blitOptions.srcBottomLeft[1],
      blitOptions.srcTopLeft[0],
      blitOptions.srcTopLeft[1],
      blitOptions.dstBottomLeft[0],
      blitOptions.dstBottomLeft[1],
      blitOptions.dstTopLeft[0],
      blitOptions.dstTopLeft[1],
      gl.COLOR_BUFFER_BIT,
      filterToEnum(blitOptions.filter)
    );

    if (handleBinding) {
      this.unBind();
      readBuffer.unBind();
    }

    this.assertOkStatus();
    readBuffer.assertOkStatus();
  }

  public readPixelsTo(options: ReadPixelOptions) {
    gl.readPixels(
      options.lowerLeftX,
      options.lowerLeftY,
      options.width,
      options.height,
      formatToEnum(options.format),
      gl.UNSIGNED_BYTE,
      options.pixelBuffer
    );
  }

  public swapTexture(texture: Texture) {
    requires(
      this.width == texture.getWidth() && this.height == texture.getHeight(),
      'texture must have same dimensions as framebuffer'
    );
    this.attachedTexture = texture;
    this.attachTexture();
  }

  public bind() {
    gl.bindFramebuffer(targetToEnum(this.target), this.id.innerId());
  }

  public unBind() {
    gl.bindFramebuffer(targetToEnum(this.target), null);
  }

  public getWidth() {
    return this.width;
  }

  public getHeight() {
    return this.height;
  }

  public getTextureAttachment(): Texture {
    return this.attachedTexture;
  }

  public destroy() {
    this.id.destroy((id) => {
      gl.deleteFramebuffer(id);
    });
  }

  private attachTexture() {
    const mipMapLevels = 0;

    this.bind();
    this.attachedTexture.bind();
    gl.framebufferTexture2D(
      targetToEnum(this.target),
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      this.attachedTexture.getId().innerId(),
      mipMapLevels
    );

    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) != gl.FRAMEBUFFER_COMPLETE) {
      throw new Error('Could not create framebuffer!');
    }

    this.attachedTexture.unBind();
    this.unBind();

    this.assertOkStatus();
  }

  private assertOkStatus() {
    this.bind();

    const status = gl.checkFramebufferStatus(targetToEnum(this.target));
    if (status != gl.FRAMEBUFFER_COMPLETE)
      throw new Error(`Invalid framebuffer status with status ${fStatusToString(status)}`);

    this.unBind();
  }
}

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
//! HELPERS
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

function formatToEnum(f: Format): GLenum {
  switch (f) {
    case 'RGBA':
      return gl.RGBA;
    case 'RGB':
      return gl.RGB;
    case 'ALPHA':
      return gl.ALPHA;
    default:
      return unreachable();
  }
}

function filterToEnum(f: Filter): GLenum {
  switch (f) {
    case 'Linear':
      return gl.LINEAR;
    case 'Nearest':
      return gl.NEAREST;
    default:
      return unreachable();
  }
}

function targetToEnum(t: FrameBufferTarget): GLenum {
  switch (t) {
    case 'Regular':
      return gl.FRAMEBUFFER;
    case 'Draw':
      return gl.DRAW_FRAMEBUFFER;
    case 'Read':
      return gl.READ_FRAMEBUFFER;
    default:
      return unreachable();
  }
}

function fStatusToString(s: GLenum): string {
  requires(s != gl.FRAMEBUFFER_COMPLETE);

  switch (s) {
    case gl.FRAMEBUFFER_INCOMPLETE_ATTACHMENT:
      return 'FRAMEBUFFER_INCOMPLETE_ATTACHMENT';
    case gl.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT:
      return 'FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT';
    case gl.FRAMEBUFFER_INCOMPLETE_DIMENSIONS:
      return 'FRAMEBUFFER_INCOMPLETE_DIMENSIONS';
    case gl.FRAMEBUFFER_UNSUPPORTED:
      return 'FRAMEBUFFER_UNSUPPORTED';
    case gl.FRAMEBUFFER_INCOMPLETE_MULTISAMPLE:
      return 'FRAMEBUFFER_INCOMPLETE_MULTISAMPLE';
    default:
      return unreachable();
  }
}
