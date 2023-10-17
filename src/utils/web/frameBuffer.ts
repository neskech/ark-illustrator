import { requires } from '../contracts';
import { unreachable } from '../func/funUtils';
import { Option } from '../func/option';
import { type GL, GLObject, glOpErr } from './glUtils';
import Texture from './texture';
import { TextureOptions } from './texture';

type FrameBufferTarget = 'Regular' | 'Draw' | 'Read';
type Filter = 'Linear' | 'Nearest';
type Format = 'RGBA' | 'RGB' | 'ALPHA';

function formatToEnum(gl: GL, f: Format): GLenum {
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

function filterToEnum(gl: GL, f: Filter): GLenum {
  switch (f) {
    case 'Linear':
      return gl.LINEAR;
    case 'Nearest':
      return gl.NEAREST;
    default:
      return unreachable();
  }
}

function targetToEnum(gl: GL, t: FrameBufferTarget): GLenum {
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

function fStatusToString(gl: GL, s: GLenum): string {
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

export interface ReadPixelOptions {
  lowerLeftX: number;
  lowerLeftY: number;
  width: number;
  height: number;
  format: Format;
}

export interface BlitOptions {
  srcBottomLeft: [number, number];
  srcTopLeft: [number, number];
  dstBottomLeft: [number, number];
  dstTopLeft: [number, number];
  filter: Filter;
}

export type FrameBufferOptions = {
  target: FrameBufferTarget;
  width: number;
  height: number;
} & TextureOptions
export default class FrameBuffer {
  private id: GLObject<WebGLFramebuffer>;
  private target: FrameBufferTarget;
  private width: number;
  private height: number;
  private attachedTexture: Texture

  constructor(gl: GL, options: FrameBufferOptions) {
    const fId = Option.fromNull(glOpErr(gl, gl.createFramebuffer.bind(gl)));
    const fgId = fId.expect("Couldn't create frame buffer");
    this.id = new GLObject(fgId);
    this.target = options.target;
    this.width = options.width;
    this.height = options.height;
    this.attachedTexture = new Texture(gl, {
      width: options.width,
      height: options.height,
      wrapX: options.wrapX,
      wrapY: options.wrapY,
      minFilter: options.minFilter,
      magFilter: options.magFilter,
      format: options.format,
    })
    this.attachedTexture.allocateEmpty(gl, options.width, options.height)
    this.attachTexture(gl)
  }

  assertOkStatus(gl: GL) {
    this.bind(gl);

    const status = gl.checkFramebufferStatus(targetToEnum(gl, this.target));
    if (status != gl.FRAMEBUFFER_COMPLETE)
      throw new Error(
        `Invalid framebuffer status with status ${fStatusToString(gl, status)}`
      );

    this.unBind(gl);
  }

  blitTo(
    gl: GL,
    readBuffer: FrameBuffer,
    blitOptions: BlitOptions,
    handleBinding = false
  ) {
    if (handleBinding) {
      this.bind(gl);
      readBuffer.bind(gl);
    }

    glOpErr(
      gl,
      gl.blitFramebuffer.bind(gl),
      blitOptions.srcBottomLeft[0],
      blitOptions.srcBottomLeft[1],
      blitOptions.srcTopLeft[0],
      blitOptions.srcTopLeft[1],
      blitOptions.dstBottomLeft[0],
      blitOptions.dstBottomLeft[1],
      blitOptions.dstTopLeft[0],
      blitOptions.dstTopLeft[1],
      gl.COLOR_BUFFER_BIT,
      filterToEnum(gl, blitOptions.filter)
    );

    if (handleBinding) {
      this.unBind(gl);
      readBuffer.unBind(gl);
    }

    this.assertOkStatus(gl);
    readBuffer.assertOkStatus(gl);
  }

  private attachTexture(gl: GL) {
    const mipMapLevels = 0;

    this.bind(gl)
    this.attachedTexture.bind(gl)
    glOpErr(
      gl,
      gl.framebufferTexture2D.bind(gl),
      targetToEnum(gl, this.target),
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      this.attachedTexture.getId().innerId(),
      mipMapLevels
    );

      
    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) != gl.FRAMEBUFFER_COMPLETE) {
      throw new Error("Could not create framebuffer!")
    }

    this.attachedTexture.unBind(gl)
    this.unBind(gl)

    this.assertOkStatus(gl);
  }

  readPixelsTo(gl: GL, options: ReadPixelOptions, pixelBuf: Uint8Array) {
    glOpErr(
      gl,
      gl.readPixels.bind(gl),
      options.lowerLeftX,
      options.lowerLeftY,
      options.width,
      options.height,
      formatToEnum(gl, options.format),
      gl.UNSIGNED_BYTE,
      pixelBuf,
      0
    );
  }

  bind(gl: GL) {
    glOpErr(
      gl,
      gl.bindFramebuffer.bind(gl),
      targetToEnum(gl, this.target),
      this.id.innerId()
    );
  }

  unBind(gl: GL) {
    glOpErr(
      gl,
      gl.bindFramebuffer.bind(gl),
      targetToEnum(gl, this.target),
      null
    );
  }

  getWidth() {
    return this.width;
  }

  getHeight() {
    return this.height;
  }

  getTextureAttachment(): Texture {
    return this.attachedTexture
  }

  destroy(gl: GL) {
    this.id.destroy((id) => {
      gl.deleteFramebuffer(id);
    });
  }
}
