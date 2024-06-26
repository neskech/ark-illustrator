import { requires } from '~/util/general/contracts';
import Layer from './layer';
import { todo } from '~/util/general/funUtils';
import FrameBuffer from '~/util/webglWrapper/frameBuffer';

export default class LayerManager {
  private layerStack: Layer[];
  private currentLayer: number;
  private canvasWidth: number;
  private canvasHeight: number;
  private canvasFramebuffer: FrameBuffer;
  private hasBeenMutated: boolean;

  constructor(canvas: HTMLCanvasElement) {
    this.canvasWidth = canvas.width;
    this.canvasHeight = canvas.height;
    this.layerStack = [new Layer(this.canvasWidth, this.canvasHeight)];
    this.currentLayer = 0;
    this.canvasFramebuffer = new FrameBuffer({
      type: 'with texture',
      target: 'Regular',
      texture: this.getCurrentLayer().getTexture(),
    });
    this.hasBeenMutated = false;
    this.setupEvents();
  }

  public getCurrentLayer(): Layer {
    requires(0 <= this.currentLayer && this.currentLayer < this.layerStack.length);
    return this.layerStack[this.currentLayer];
  }

  public getCurrentLayerIndex(): number {
    return this.currentLayer
  }

  public switchToLayer(layerIndex: number) {
    requires(0 <= layerIndex && layerIndex < this.layerStack.length);
    this.currentLayer = layerIndex;
    this.canvasFramebuffer.swapTexture(this.layerStack[this.currentLayer].getTexture());
  }

  public getTextureFromLayer(layerIndex: number) {
    requires(0 <= layerIndex && layerIndex < this.layerStack.length);
    return this.layerStack[layerIndex].getTexture();
  }

  public hasLayerBeenMutated() {
    return this.hasBeenMutated;
  }

  public resetMutation() {
    this.hasBeenMutated = false;
  }

  public getCanvasFramebuffer() {
    return this.canvasFramebuffer;
  }

  public getLayers(): Iterable<Layer> {
    return this.layerStack
  }

  private setupEvents() {
    todo();
  }
}
