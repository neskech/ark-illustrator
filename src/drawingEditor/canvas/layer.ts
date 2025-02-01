import type Texture from '../../util/webglWrapper/texture';
import { TextureCreator } from '../../util/webglWrapper/texture';
import { type BlendMode } from './blendMode';
export default class Layer {
  private imageData: Texture;
  private history: Texture[];
  private opacity: number;
  private visibility: boolean;
  private locked: boolean;
  private blendMode: BlendMode;
  private name: string;

  constructor(
    name: string,
    canvasWidth: number,
    canvasHeight: number,
    defaultTexture: Texture | null = null
  ) {
    this.imageData =
      defaultTexture ??
      TextureCreator.allocateEmpty({
        width: canvasWidth,
        height: canvasHeight,
        wrapX: 'Repeat',
        wrapY: 'Repeat',
        magFilter: 'Nearest',
        minFilter: 'Nearest',
        format: 'RGBA',
      });
    this.history = [];
    this.opacity = 1;
    this.visibility = true;
    this.locked = false;
    this.blendMode = 'Normal';
    this.name = name;
  }

  registerMutation() {
    const copy = TextureCreator.duplicate(this.imageData);
    this.history.push(copy);
  }

  revertToPreviousState() {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    if (this.history.length > 0) this.imageData = this.history.pop()!;
  }

  duplicate(name: string) {
    const copy = TextureCreator.duplicate(this.imageData);
    const layer = new Layer(name, this.imageData.getWidth(), this.imageData.getHeight(), copy);
    layer.setOpacity(this.opacity);
    return layer;
  }

  getTexture() {
    return this.imageData;
  }

  getName() {
    return this.name;
  }

  setName(name: string) {
    this.name = name;
  }

  getOpacity() {
    return this.opacity;
  }

  setOpacity(opacity: number) {
    this.opacity = opacity;
  }

  isVisible() {
    return this.visibility;
  }

  setVisibility(visibility: boolean) {
    this.visibility = visibility;
  }

  isLocked() {
    return this.locked;
  }

  setLocked(locked: boolean) {
    this.locked = locked;
  }

  getBlendMode() {
    return this.blendMode;
  }

  setBlendMode(mode: BlendMode) {
    this.blendMode = mode;
  }
}
