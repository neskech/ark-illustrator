import { requires } from '~/util/general/contracts';
import Layer from './layer';
import FrameBuffer from '~/util/webglWrapper/frameBuffer';
import { clearFramebuffer } from '../renderer/util/renderUtils';
import EventManager from '~/util/eventSystem/eventManager';

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
    clearFramebuffer(this.canvasFramebuffer, 1, 1, 1, 0);
    this.hasBeenMutated = false;
    this.setupEvents();
  }

  public getCurrentLayer(): Layer {
    requires(0 <= this.currentLayer && this.currentLayer < this.layerStack.length);
    return this.layerStack[this.currentLayer];
  }

  public getCurrentLayerIndex(): number {
    return this.currentLayer;
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

  public getCanvasFramebufferForMutation() {
    this.hasBeenMutated = true;
    this.getCurrentLayer().registerMutation();
    return this.canvasFramebuffer;
  }

  public undo() {
    this.getCurrentLayer().revertToPreviousState();
    this.canvasFramebuffer.swapTexture(this.getCurrentLayer().getTexture());
  }

  public getLayers(): Iterable<Layer> {
    return this.layerStack;
  }

  private setupEvents() {
    EventManager.subscribe('clearCanvas', () => {
      clearFramebuffer(this.canvasFramebuffer, 1, 1, 1, 1);
    });
    EventManager.subscribe('undo', () => this.undo());
  }
}
