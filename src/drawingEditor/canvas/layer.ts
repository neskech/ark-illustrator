import Texture from '../../util/webglWrapper/texture';

export default class Layer {
  imageData: Texture;

  constructor(canvasWidth: number, canvasHeight: number) {
    this.imageData = new Texture({
      width: canvasWidth,
      height: canvasHeight,
      wrapX: 'Repeat',
      wrapY: 'Repeat',
      magFilter: 'Nearest',
      minFilter: 'Nearest',
      format: 'RGBA',
    });
  }
}
