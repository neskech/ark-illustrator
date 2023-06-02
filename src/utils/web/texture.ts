/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { unreachable } from "../func/funUtils";
import { Option } from "../func/option";
import type FrameBuffer from "./frameBuffer";
import { type ReadPixelOptions } from "./frameBuffer";
import {
  GLObject,
  glOpErr,
  type GL,
  type Color,
  colorTypeToPacked,
} from "./glUtils";

type TextureFilter = "Linear" | "Nearest";
type TextureWrap = "Clamp To Edge" | "Repeat" | "Mirrored Repeat";
type Format = "RGBA" | "RGB" | "ALPHA";

function formatToEnum(gl: GL, f: Format): GLenum {
  switch (f) {
    case "RGBA":
      return gl.RGBA;
    case "RGB":
      return gl.RGB;
    case "ALPHA":
      return gl.ALPHA;
    default:
      return unreachable();
  }
}

function textureFilterToEnum(gl: GL, t: TextureFilter): GLenum {
  switch (t) {
    case "Linear":
      return gl.LINEAR;
    case "Nearest":
      return gl.NEAREST;
    default:
      return unreachable();
  }
}

function textureWrapToEnum(gl: GL, t: TextureWrap): GLenum {
  switch (t) {
    case "Clamp To Edge":
      return gl.CLAMP_TO_EDGE;
    case "Repeat":
      return gl.REPEAT;
    case "Mirrored Repeat":
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
  wrapX: TextureWrap;
  wrapY: TextureWrap;
  minFilter: TextureFilter;
  magFilter: TextureFilter;
  format: Format
}

export default class Texture {
  private id: GLObject<WebGLTexture>;
  private options: TextureOptions;

  constructor(gl: GL, options: TextureOptions) {
    const bId = Option.fromNull(glOpErr(gl, gl.createTexture.bind(this)));
    const gId = bId.expect(`Couldn't create texture with options ${options}`);
    this.id = new GLObject(gId, 'texture');

    this.options = options;
    this.setTextureParams(gl);
  }

  private setTextureParams(gl: GL) {
    this.bind(gl);

    glOpErr(
      gl,
      gl.texParameteri.bind(this),
      gl.TEXTURE_2D,
      gl.TEXTURE_MAG_FILTER,
      textureFilterToEnum(gl, this.options.magFilter)
    );

    glOpErr(
      gl,
      gl.texParameteri.bind(this),
      gl.TEXTURE_2D,
      gl.TEXTURE_MIN_FILTER,
      textureFilterToEnum(gl, this.options.minFilter)
    );

    glOpErr(
      gl,
      gl.texParameteri.bind(this),
      gl.TEXTURE_2D,
      gl.TEXTURE_WRAP_S,
      textureWrapToEnum(gl, this.options.wrapX)
    );

    glOpErr(
      gl,
      gl.texParameteri.bind(this),
      gl.TEXTURE_2D,
      gl.TEXTURE_WRAP_T,
      textureWrapToEnum(gl, this.options.wrapY)
    );

    this.unbind(gl);
  }

  allocateFromPixels(
    gl: GL,
    width: number,
    height: number,
    data: ArrayBufferView,
    offset = 0
  ) {

    const mipMapLevels = 0; //something to consider for future
    const border = 0;

    glOpErr(
      gl,
      gl.texImage2D.bind(this),
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

  }

  allocateEmpty(gl: GL, width: number, height: number, clearColor: Color) {
    const packedColor = colorTypeToPacked(clearColor);
    const pixels = new Uint32Array(width * height);

    for (let i = 0; i < width * height; i++) pixels[i] = packedColor;

    this.allocateFromPixels(gl, width, height, pixels);
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

      gl.texImage2D(
        gl.TEXTURE_2D,
        mipMapLevels,
        format,
        format,
        texelType,
        img
      );
    }

    img.onload = () => {
      this.bind(gl);
      glOpErr(gl, allocateFromImg);
      this.unbind(gl);
    };

    img.src = url;
  }

  allocateFromSubFramebuffer(
    gl: GL,
    options: CopySubTextureOptions
  ) {

    const mipMapLevels = 0;
    glOpErr(
      gl,
      gl.copyTexSubImage2D.bind(this),
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

  copyFromFramebuffer(gl: GL, width: number, height: number) {
    this.bind(gl);

    const mipMapLevels = 0;
    const xOffset = 0;
    const yOffset = 0;
    const border = 0;

    glOpErr(
      gl,
      gl.copyTexSubImage2D.bind(this),
      gl.TEXTURE_2D,
      mipMapLevels,
      formatToEnum(gl, this.options.format),
      xOffset,
      yOffset,
      width,
      height,
      border
    );

    this.unbind(gl);
  }

  readPixelsViaFramebuffer(gl: GL, frameBuffer: FrameBuffer, options: ReadPixelOptions, pixelBuf: Uint8Array, handleBinding=false) {
      if (handleBinding) {
        frameBuffer.bind(gl);
        this.bind(gl);
      }

      frameBuffer.readPixelsTo(gl, options, pixelBuf);

      if (handleBinding) {
        this.unbind(gl);
        frameBuffer.unBind(gl);
      }
  }

  writeToFile(filePath: string) {
    
  }

  bind(gl: GL) {
    glOpErr(gl, gl.bindTexture.bind(this), gl.TEXTURE_2D, this.id.innerId());
  }

  unbind(gl: GL) {
    glOpErr(gl, gl.bindTexture.bind(this), gl.TEXTURE_2D, 0);
  }

  static activateUnit(gl: GL, unitOffset: number) {
     glOpErr(gl, gl.activeTexture.bind(this), gl.TEXTURE0 + unitOffset)
  }

  getId(): GLObject<WebGLTexture> {
    return this.id;
  }

  getOptions(): TextureOptions {
    return this.options;
  }

  toString(): string {
    return `Texture Object --\n
            Wrapping Behavior X: ${this.options.wrapX}\n
            Wrapping Behavior Y: ${this.options.wrapY}\n
            Mag Filter: ${this.options.magFilter}\n
            Min Filter: ${this.options.minFilter}\n
            Format: ${this.options.format}
    `
  }

  log(logger: (s: string) => void = console.log) {
     logger(this.toString());
  }
}
