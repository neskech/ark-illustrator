/* eslint-disable @typescript-eslint/restrict-template-expressions */
import Jimp from 'jimp';
import { assert, requires } from '../../general/contracts';
import { unreachable } from '../../general/funUtils';
import { None, Option, Some } from '../../general/option';
import type FrameBuffer from './frameBuffer';
import { type ReadPixelOptions } from './frameBuffer';
import { GLObject, type GL, checkError } from './glUtils';
import { Err, Ok, Result, type Unit, unit } from '../../general/result';

type TextureFilter = 'Linear' | 'Nearest';
type TextureWrap = 'Clamp To Edge' | 'Repeat' | 'Mirrored Repeat';
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

function textureFilterToEnum(gl: GL, t: TextureFilter): GLenum {
  switch (t) {
    case 'Linear':
      return gl.LINEAR;
    case 'Nearest':
      return gl.NEAREST;
    default:
      return unreachable();
  }
}

function textureWrapToEnum(gl: GL, t: TextureWrap): GLenum {
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

export interface CopySubTextureOptions {
  lowerDestinationX: number;
  lowerDestinationY: number;
  lowerSourceX: number;
  lowerSourceY: number;
  sourceWidth: number;
  sourceHeight: number;
  format: Format;
}

export interface TextureOptions {
  width?: number;
  height?: number;
  wrapX: TextureWrap;
  wrapY: TextureWrap;
  minFilter: TextureFilter;
  magFilter: TextureFilter;
  format: Format;
}

export default class Texture {
  private id: GLObject<WebGLTexture>;
  private options: TextureOptions;
  private width: Option<number>;
  private height: Option<number>;

  constructor(gl: GL, options: TextureOptions) {
    const bId = Option.fromNull(gl.createTexture());
    const gId = bId.expect(`Couldn't create texture with options ${options}`);
    this.id = new GLObject(gId, 'texture');

    this.options = options;
    this.setTextureParams(gl);

    this.width = options.width == null ? None() : Some(options.width);
    this.height = options.height == null ? None() : Some(options.height);
  }

  private assertValidDimensions() {
    assert(this.width.isSome() && this.height.isSome());
  }

  private setDimensions(width: number, height: number) {
    // if dimensions don't match, error. Else take them
    this.width = Some(
      this.width
        .map((w) => {
          assert(w == width);
          return w;
        })
        .unwrapOrDefault(width)
    );

    this.height = Some(
      this.height
        .map((h) => {
          assert(h == height);
          return h;
        })
        .unwrapOrDefault(height)
    );
  }

  private setTextureParams(gl: GL) {
    this.bind(gl);

    gl.texParameteri(
      gl.TEXTURE_2D,
      gl.TEXTURE_MAG_FILTER,
      textureFilterToEnum(gl, this.options.magFilter)
    );
    gl.texParameteri(
      gl.TEXTURE_2D,
      gl.TEXTURE_MIN_FILTER,
      textureFilterToEnum(gl, this.options.minFilter)
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, textureWrapToEnum(gl, this.options.wrapX));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, textureWrapToEnum(gl, this.options.wrapY));

    this.unBind(gl);
  }

  allocateFromPixels(gl: GL, width: number, height: number, data: ArrayBufferView, offset = 0) {
    this.bind(gl);

    const mipMapLevels = 0; //something to consider for future
    const border = 0;

    gl.texImage2D(
      gl.TEXTURE_2D,
      mipMapLevels,
      formatToEnum(gl, this.options.format),
      width,
      height,
      border,
      formatToEnum(gl, this.options.format),
      gl.UNSIGNED_BYTE,
      data,
      offset
    );

    this.unBind(gl);
  }

  allocateEmpty(gl: GL, width: number, height: number) {
    this.setDimensions(width, height);

    this.bind(gl);

    const mipMapLevels = 0;
    const border = 0;
    gl.texImage2D(
      gl.TEXTURE_2D,
      mipMapLevels,
      formatToEnum(gl, this.options.format),
      width,
      height,
      border,
      formatToEnum(gl, this.options.format),
      gl.UNSIGNED_BYTE,
      null
    );

    this.unBind(gl);
  }

  allocateFromImageUrl(gl: GL, url: string, preload = true) {
    const img = new Image();

    /**
     * Because images have to be downloaded over the internet
     * they might take a moment until they are ready.
     * Until then put a single pixel in the texture so we can
     * use it immediately. When the image has finished downloading
     * we'll update the texture with the contents of the image.
     */
    if (preload) {
      const pixel = new Uint8Array([255, 255, 255, 255]);
      this.allocateFromPixels(gl, 1, 1, pixel);
    }

    const format = formatToEnum(gl, this.options.format);
    function allocateFromImg() {
      const mipMapLevels = 0;
      const texelType = gl.UNSIGNED_BYTE;

      gl.texImage2D(gl.TEXTURE_2D, mipMapLevels, format, format, texelType, img);

      checkError(gl, 'texImage2D');
    }

    img.onload = () => {
      this.bind(gl);
      allocateFromImg();
      this.unBind(gl);

      this.setDimensions(img.width, img.height);
    };

    img.src = url;
    img.crossOrigin = 'anonymous';
  }

  async allocateFromImageUrlAsync(gl: GL, url: string): Promise<Result<Unit, string>> {
    function asyncImgLoad(img: HTMLImageElement, url: string) {
      return new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = url;
        img.crossOrigin = 'anonymous';
      });
    }

    const img = new Image();
    const res = await Result.fromErrorAsync(asyncImgLoad(img, url));
    if (res.isErr()) return Err(res.unwrapErr().message);

    this.bind(gl);

    const format = formatToEnum(gl, this.options.format);
    const mipMapLevels = 0;
    const texelType = gl.UNSIGNED_BYTE;
    gl.texImage2D(gl.TEXTURE_2D, mipMapLevels, format, format, texelType, img);
    checkError(gl, 'texImage2D');
    this.setDimensions(img.width, img.height);

    this.unBind(gl);

    return Ok(unit);
  }

  allocateFromSubFramebuffer(gl: GL, options: CopySubTextureOptions) {
    this.setDimensions(options.sourceWidth, options.sourceHeight);

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
  }

  copyFromFramebuffer(gl: GL, frameBuffer: FrameBuffer) {
    this.bind(gl);

    const mipMapLevels = 0;
    const xOffset = 0;
    const yOffset = 0;
    const border = 0;

    this.setDimensions(frameBuffer.getWidth(), frameBuffer.getHeight());

    gl.copyTexSubImage2D(
      gl.TEXTURE_2D,
      mipMapLevels,
      formatToEnum(gl, this.options.format),
      xOffset,
      yOffset,
      this.width.unwrap(),
      this.height.unwrap(),
      border
    );

    this.unBind(gl);
  }

  readPixelsViaFramebuffer(
    gl: GL,
    frameBuffer: FrameBuffer,
    options: ReadPixelOptions,
    pixelBuf: Uint8Array,
    handleBinding = false
  ) {
    if (handleBinding) {
      frameBuffer.bind(gl);
      this.bind(gl);
    }

    this.setDimensions(frameBuffer.getWidth(), frameBuffer.getHeight());
    frameBuffer.readPixelsTo(gl, pixelBuf, options);

    if (handleBinding) {
      this.unBind(gl);
      frameBuffer.unBind(gl);
    }
  }

  async writeToFileViaFramebuffer(
    gl: GL,
    filePath: string,
    frameBuffer: FrameBuffer,
    options: ReadPixelOptions
  ): Promise<Result<Unit, string>> {
    this.assertValidDimensions();
    requires(this.options.format == 'RGBA');

    const w = this.width.unwrap();
    const h = this.height.unwrap();
    const channels = 4; // r g b a

    const pixelBuf = new Uint8Array(w * h * channels);
    this.readPixelsViaFramebuffer(gl, frameBuffer, options, pixelBuf, true);

    try {
      const img = await Jimp.create(w, h);
      for (let i = 0; i < w * h; i++) {
        const red = pixelBuf[i];
        const blue = pixelBuf[i + 1];
        const green = pixelBuf[i + 2];
        const alpha = pixelBuf[i + 3];

        img.bitmap.data[i] = (alpha << 24) | (green << 16) | (blue << 8) | red;
      }

      await img.writeAsync(filePath);
      return Ok(unit);
    } catch (err) {
      const errMsg = `Failed to write texture to ${filePath}\n
                       Texture Information: ${this.toString()}\n`;
      if (err instanceof Error) return Err(`${errMsg}\n\nThe error: ${err.message}`);
      return Err(errMsg);
    }
  }

  bind(gl: GL) {
    gl.bindTexture(gl.TEXTURE_2D, this.id.innerId());
  }

  unBind(gl: GL) {
    gl.bindTexture(gl.TEXTURE_2D, null);
  }

  static activateUnit(gl: GL, unitOffset: number) {
    gl.activeTexture(gl.TEXTURE0 + unitOffset);
  }

  getId(): GLObject<WebGLTexture> {
    return this.id;
  }

  getOptions(): TextureOptions {
    return this.options;
  }

  getWidth() {
    return this.width.expect('tried getting texture width, but it was unspecified');
  }

  getHeight() {
    return this.height.expect('tried getting texture height, but it was unspecified');
  }

  toString(): string {
    return `Texture Object --\n
            Width: ${this.width.map((t) => `${t}`).unwrapOrDefault('unspecified')}\n
            Height: ${this.height.map((t) => `${t}`).unwrapOrDefault('unspecified')}\n
            Wrapping Behavior X: ${this.options.wrapX}\n
            Wrapping Behavior Y: ${this.options.wrapY}\n
            Mag Filter: ${this.options.magFilter}\n
            Min Filter: ${this.options.minFilter}\n
            Format: ${this.options.format}
    `;
  }

  log(logger: (s: string) => void = console.log) {
    logger(this.toString());
  }
}
