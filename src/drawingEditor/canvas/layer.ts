import type Texture from '../../util/webglWrapper/texture';
import { TextureCreator } from '../../util/webglWrapper/texture';

export default class Layer {
  private imageData: Texture;

  constructor(canvasWidth: number, canvasHeight: number) {
    this.imageData = TextureCreator.allocateEmpty({
      width: canvasWidth,
      height: canvasHeight,
      wrapX: 'Repeat',
      wrapY: 'Repeat',
      magFilter: 'Nearest',
      minFilter: 'Nearest',
      format: 'RGBA',
    });
  }

  getTexture() {
    return this.imageData;
  }
}
