import type Texture from '../../util/webglWrapper/texture';
import { TextureCreator } from '../../util/webglWrapper/texture';
export default class Layer {
  private imageData: Texture;
  private history: Texture[];
  private opacity: number
  private isVisible: boolean;
  private isLocked: boolean;
  private name: string;

  constructor(name: string, canvasWidth: number, canvasHeight: number) {
    this.imageData = TextureCreator.allocateEmpty({
      width: canvasWidth,
      height: canvasHeight,
      wrapX: 'Repeat',
      wrapY: 'Repeat',
      magFilter: 'Nearest',
      minFilter: 'Nearest',
      format: 'RGBA',
    });
    this.history = [];
    this.opacity = 1
    this.isVisible = true
    this.isLocked = false
    this.name = name
  }

  registerMutation() {
    const buffer = new Uint8Array(this.imageData.getWidth() * this.imageData.getHeight() * 4);
    this.imageData.writePixelsToBuffer({
      lowerLeftX: 0,
      lowerLeftY: 0,
      width: this.imageData.getWidth(),
      format: this.imageData.getOptions().format,
      height: this.imageData.getHeight(),
      pixelBuffer: buffer,
    });
    const copy = TextureCreator.allocateFromPixels({
      data: buffer,
      textureOptions: this.imageData.getOptions(),
    });
    this.history.push(copy);
  }

  revertToPreviousState() {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    if (this.history.length > 0) this.imageData = this.history.pop()!;
  }

  getTexture() {
    return this.imageData;
  }

  getName() {
    return this.name
  }

  setName(name: string) {
    this.name = name
  }

  getOpacity() {
    return this.opacity
  }

  setOpacity(opacity: number) {
    this.opacity = opacity
  }

  getVisibility() {
    return this.isVisible
  }

  setVisibility(visibility: boolean) {
    this.isVisible = visibility
  }

  getLocked() {
    return this.isLocked
  }

  setLocked(locked: boolean) {
    this.isLocked = locked
  }
}
