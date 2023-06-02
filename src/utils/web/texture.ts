/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { unreachable } from "../func/funUtils";
import { Option } from "../func/option";
import {
  GLObject,
  glOpErr,
  type GL,
  type Color,
  colorTypeToPacked,
} from "./glUtils";

type TextureFilter = "Linear" | "Nearest";
type TextureWrap = "Clamp To Edge" | "Repeat" | "Mirrored Repeat";

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

interface TextureOptions {
  wrapX: TextureWrap;
  wrapY: TextureWrap;
  minFilter: TextureFilter;
  magFilter: TextureFilter;
}

export default class Texture {
  private id: GLObject<WebGLTexture>;
  private options: TextureOptions;

  constructor(gl: GL, options: TextureOptions) {
    const bId = Option.fromNull(glOpErr(gl, gl.createTexture.bind(this)));
    const gId = bId.expect(`Couldn't create texture with options ${options}`);
    this.id = new GLObject(gId);

    this.options = options;
    this.setTextureParams(gl);
  }

  private setTextureParams(gl: GL) {
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
  }

  allocateFromPixels(
    gl: GL,
    width: number,
    height: number,
    data: ArrayBufferView,
    offset = 0
  ) {
    this.bind(gl);

    const mipMapLevels = 0; //something to consider for future
    const format = gl.RGBA; //will not change
    const border = 0; //just has to be
    const texelType = gl.UNSIGNED_BYTE; //packed colors

    glOpErr(
      gl,
      gl.texImage2D.bind(this),
      gl.TEXTURE_2D,
      mipMapLevels,
      format,
      width,
      height,
      border,
      format,
      texelType,
      data,
      offset
    );

    this.unbind(gl);
  }

  allocateEmpty(gl: GL, width: number, height: number, clearColor: Color) {
    const packedColor = colorTypeToPacked(clearColor);
    const pixels = new Uint32Array(width * height);

    for (let i = 0; i < width * height; i++) pixels[i] = packedColor;

    this.allocateFromPixels(gl, width, height, pixels);
  }

  allocateFromImageUrl(gl: GL, url: string, preload=true) {
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

    function allocateFromImg() {
      const mipMapLevels = 0;
      const format = gl.RGBA;
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

  copyFromFramebuffer(gl: GL, width: number, height: number) {
    this.bind(gl);

    const mipMapLevels = 0;
    const format = gl.RGBA;
    const xOffset = 0;
    const yOffset = 0;
    const border = 0;

    glOpErr(
        gl,
        gl.copyTexSubImage2D.bind(this),
        gl.TEXTURE_2D,
        mipMapLevels,
        format,
        xOffset,
        yOffset,
        width,
        height,
        border
    );

    this.unbind(gl);
  }

  bind(gl: GL) {
    glOpErr(gl, gl.bindTexture.bind(this), gl.TEXTURE_2D, this.id.innerId());
  }

  unbind(gl: GL) {
    glOpErr(gl, gl.bindTexture.bind(this), gl.TEXTURE_2D, 0);
  }

  getId(): GLObject<WebGLTexture> {
    return this.id;
  }

  getOptions(): TextureOptions {
    return this.options;
  }

}
