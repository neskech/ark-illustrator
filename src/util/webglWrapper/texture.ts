/* eslint-disable @typescript-eslint/restrict-template-expressions */
import Jimp from 'jimp';
import { requires } from '../general/contracts';
import { unreachable } from '../general/funUtils';
import { Option } from '../general/option';
import FrameBuffer from './frameBuffer';
import { type ReadPixelOptions } from './frameBuffer';
import { BindHandle, GLObject, checkError } from './glUtils';
import { Err, Ok, Result, type Unit, unit } from '../general/result';
import { gl } from '../../drawingEditor/application';

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
//! TYPES
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

type TextureFilter = 'Linear' | 'Nearest';
type TextureWrap = 'Clamp To Edge' | 'Repeat' | 'Mirrored Repeat';
type Format = 'RGBA' | 'RGB' | 'ALPHA';

export interface CopySubTextureOptions {
  frameBuffer: FrameBuffer;
  lowerDestinationX: number;
  lowerDestinationY: number;
  lowerSourceX: number;
  lowerSourceY: number;
  sourceWidth: number;
  sourceHeight: number;
  format: Format;
}

type WriteToFileOptions = {
  filePath: string;
  lowerLeftX: number;
  lowerLeftY: number;
  width: number;
  height: number;
  format: Format;
};
export interface TextureOptions {
  width: number;
  height: number;
  wrapX: TextureWrap;
  wrapY: TextureWrap;
  minFilter: TextureFilter;
  magFilter: TextureFilter;
  format: Format;
}

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
//! CLASS DEFINITION
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

//TODO: Remove the option widht and height and just make a creator class or somethinjg
export default class Texture {
  private id: GLObject<WebGLTexture>;
  private options: TextureOptions;
  private width: number;
  private height: number;

  constructor(options: TextureOptions) {
    const bId = Option.fromNull(gl.createTexture());
    const gId = bId.expect(`Couldn't create texture with options ${options}`);
    this.id = new GLObject(gId, 'texture');

    this.options = options;
    this.setTextureParams();

    this.width = options.width;
    this.height = options.height;
  }

  private setTextureParams() {
    this.bind();

    gl.texParameteri(
      gl.TEXTURE_2D,
      gl.TEXTURE_MAG_FILTER,
      textureFilterToEnum(this.options.magFilter)
    );
    gl.texParameteri(
      gl.TEXTURE_2D,
      gl.TEXTURE_MIN_FILTER,
      textureFilterToEnum(this.options.minFilter)
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, textureWrapToEnum(this.options.wrapX));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, textureWrapToEnum(this.options.wrapY));

    this.unBind();
  }

  copyFromFramebuffer(frameBuffer: FrameBuffer) {
    requires(
      this.width == frameBuffer.getWidth() && this.height == frameBuffer.getHeight(),
      'texture and framebuffer dimensions must be the same'
    );

    this.bind();
    frameBuffer.bind();

    const mipMapLevels = 0;
    const xOffset = 0;
    const yOffset = 0;
    const border = 0;

    gl.copyTexSubImage2D(
      gl.TEXTURE_2D,
      mipMapLevels,
      formatToEnum(this.options.format),
      xOffset,
      yOffset,
      this.width,
      this.height,
      border
    );

    this.unBind();
    frameBuffer.unBind();
  }

  allocateFromSubArrayFramebuffer(options: CopySubTextureOptions) {
    requires(
      this.width == options.frameBuffer.getWidth() &&
        this.height == options.frameBuffer.getHeight(),
      'texture and framebuffer dimensions must be the same'
    );

    this.bind();
    options.frameBuffer.bind();

    const mipMapLevels = 0;
    gl.copyTexImage2D(
      gl.TEXTURE_2D,
      mipMapLevels,
      options.lowerDestinationX,
      options.lowerDestinationY,
      options.lowerSourceX,
      options.lowerSourceY,
      options.sourceWidth,
      options.sourceHeight
    );

    this.unBind();
    options.frameBuffer.unBind();
  }

  writePixelsToBuffer(options: ReadPixelOptions) {
    const frameBuffer = new FrameBuffer({ target: 'Read', type: 'with texture', texture: this });
    frameBuffer.bind();
    this.bind();

    frameBuffer.readPixelsTo(options);

    this.unBind();
    frameBuffer.unBind();
  }

  async writeToFile(options: WriteToFileOptions): Promise<Result<Unit, string>> {
    requires(this.options.format == 'RGBA');

    const channels = 4; // r g b a

    const pixelBuffer = new Uint8Array(this.width * this.height * channels);
    this.writePixelsToBuffer({ pixelBuffer, ...options });

    try {
      const img = await Jimp.create(this.width, this.height);
      for (let i = 0; i < this.width * this.height; i++) {
        const red = pixelBuffer[i];
        const blue = pixelBuffer[i + 1];
        const green = pixelBuffer[i + 2];
        const alpha = pixelBuffer[i + 3];

        img.bitmap.data[i] = (alpha << 24) | (green << 16) | (blue << 8) | red;
      }

      await img.writeAsync(options.filePath);
      return Ok(unit);
    } catch (err) {
      const errMsg = `Failed to write texture to ${options.filePath}\n
                       Texture Information: ${this.toString()}\n`;
      if (err instanceof Error) return Err(`${errMsg}\n\nThe error: ${err.message}`);
      return Err(errMsg);
    }
  }

  bind() {
    gl.bindTexture(gl.TEXTURE_2D, this.id.innerId());
  }

  unBind() {
    gl.bindTexture(gl.TEXTURE_2D, null);
  }

  bindHandle(): BindHandle {
    return new BindHandle(
      () => this.bind(),
      () => this.unBind()
    );
  }

  static activateUnit(unitOffset: number) {
    gl.activeTexture(gl.TEXTURE0 + unitOffset);
  }

  getId(): GLObject<WebGLTexture> {
    return this.id;
  }

  getOptions(): TextureOptions {
    return this.options;
  }

  getWidth(): number {
    return this.width;
  }

  getHeight(): number {
    return this.height;
  }

  toString(): string {
    return `Texture Object --\n
            Width: ${this.width}\n
            Height: ${this.height}\n
            Wrapping Behavior X: ${this.options.wrapX}\n
            Wrapping Behavior Y: ${this.options.wrapY}\n
            Mag Filter: ${this.options.magFilter}\n
            Min Filter: ${this.options.minFilter}\n
            Format: ${this.options.format}
    `;
  }
}

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
//! HELPER CLASS DEFINITION
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

type AllocateFromPixelsOptions = {
  data: ArrayBufferView;
  offset?: number;
  textureOptions: TextureOptions;
};

type AllocateEmptyOptions = TextureOptions;

type AllocateFromImageOptions = {
  url: string;
  texureOptions: Omit<TextureOptions, 'width' | 'height'>;
};

export class TextureCreator {
  static allocateFromPixels(options: AllocateFromPixelsOptions): Texture {
    const texture = new Texture(options.textureOptions);
    texture.bind();

    const mipMapLevels = 0; //something to consider for future
    const border = 0;

    gl.texImage2D(
      gl.TEXTURE_2D,
      mipMapLevels,
      formatToEnum(options.textureOptions.format),
      options.textureOptions.width,
      options.textureOptions.height,
      border,
      formatToEnum(options.textureOptions.format),
      gl.UNSIGNED_BYTE,
      options.data,
      options.offset ?? 0
    );

    texture.unBind();
    return texture;
  }

  static allocateEmpty(options: AllocateEmptyOptions): Texture {
    const texture = new Texture(options);
    texture.bind();

    const mipMapLevels = 0;
    const border = 0;
    gl.texImage2D(
      gl.TEXTURE_2D,
      mipMapLevels,
      formatToEnum(options.format),
      options.width,
      options.height,
      border,
      formatToEnum(options.format),
      gl.UNSIGNED_BYTE,
      null
    );

    texture.unBind();
    return texture;
  }

  static allocateFromImageUrlSync(options: AllocateFromImageOptions): Texture {
    const img = new Image();
    let texture: Texture | null = null;

    const format = formatToEnum(options.texureOptions.format);
    function allocateFromImg() {
      const mipMapLevels = 0;
      const texelType = gl.UNSIGNED_BYTE;

      texture = new Texture({ width: img.width, height: img.height, ...options.texureOptions });

      texture.bind();
      gl.texImage2D(gl.TEXTURE_2D, mipMapLevels, format, format, texelType, img);
      checkError('texImage2D');
      texture.unBind();
    }

    img.onload = () => {
      allocateFromImg();
    };

    img.src = options.url;
    img.crossOrigin = 'anonymous';

    while (texture == null) {
      sleep(100);
    }

    return texture;
  }

  static async allocateFromImageUrlAsync(
    options: AllocateFromImageOptions
  ): Promise<Result<Texture, string>> {
    function asyncImgLoad(img: HTMLImageElement, url: string) {
      return new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = url;
        img.crossOrigin = 'anonymous';
      });
    }

    const img = new Image();
    const res = await Result.fromExceptionAsync(asyncImgLoad(img, options.url));
    if (res.isErr()) return Err(res.unwrapErr().message);

    const texture = new Texture({ width: img.width, height: img.height, ...options.texureOptions });
    texture.bind();

    const format = formatToEnum(options.texureOptions.format);
    const mipMapLevels = 0;
    const texelType = gl.UNSIGNED_BYTE;
    gl.texImage2D(gl.TEXTURE_2D, mipMapLevels, format, format, texelType, img);
    checkError('texImage2D');

    texture.unBind();
    return Ok(texture);
  }

  static duplicate(texture: Texture) {
    let dataPerTexel;
    switch (texture.getOptions().format) {
      case 'RGBA':
        dataPerTexel = 4;
        break;
      case 'RGB':
        dataPerTexel = 3;
        break;
      case 'ALPHA':
        dataPerTexel = 1;
        break;
    }

    const bufSize = dataPerTexel * texture.getWidth() * texture.getHeight();
    const buffer = new Uint8Array(bufSize);
    texture.writePixelsToBuffer({
      lowerLeftX: 0,
      lowerLeftY: 0,
      width: texture.getWidth(),
      format: texture.getOptions().format,
      height: texture.getHeight(),
      pixelBuffer: buffer,
    });
    const copy = TextureCreator.allocateFromPixels({
      data: buffer,
      textureOptions: texture.getOptions(),
    });
    return copy;
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

function textureFilterToEnum(t: TextureFilter): GLenum {
  switch (t) {
    case 'Linear':
      return gl.LINEAR;
    case 'Nearest':
      return gl.NEAREST;
    default:
      return unreachable();
  }
}

function textureWrapToEnum(t: TextureWrap): GLenum {
  switch (t) {
    case 'Clamp To Edge':
      return gl.CLAMP_TO_EDGE;
    case 'Repeat':
      return gl.REPEAT;
    case 'Mirrored Repeat':
      return gl.MIRRORED_REPEAT;
    default:
      return unreachable();
  }
}

function sleep(ms: number) {
  const start = new Date().getTime();
  const expire = start + ms;
  while (new Date().getTime() < expire) {}
  return;
}
