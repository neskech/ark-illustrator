import { assert, requires } from '~/util/general/contracts';
import Layer from './layer';
import FrameBuffer from '~/util/webglWrapper/frameBuffer';
import { clearFramebuffer } from '../renderer/util/renderUtils';
import EventManager from '~/util/eventSystem/eventManager';
import type OverlayRenderer from '../renderer/utilityRenderers.ts/overlayRenderer';

export default class LayerManager {
  private layerStack: Layer[];
  private currentLayer: number;
  private canvasWidth: number;
  private canvasHeight: number;
  private canvasFramebuffer: FrameBuffer;
  private hasBeenMutated: boolean;

  constructor(canvas: HTMLCanvasElement, overlayRenderer: OverlayRenderer) {
    this.canvasWidth = canvas.width;
    this.canvasHeight = canvas.height;
    this.layerStack = [new Layer('Layer #1', this.canvasWidth, this.canvasHeight)];
    this.currentLayer = 0;
    this.canvasFramebuffer = new FrameBuffer({
      type: 'with texture',
      target: 'Regular',
      texture: this.getCurrentLayer().getTexture(),
    });
    clearFramebuffer(this.canvasFramebuffer, 1, 1, 1, 0);
    this.hasBeenMutated = false;
    this.setupEvents(overlayRenderer);
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

  public getLayers(): readonly Layer[] {
    return this.layerStack;
  }

  public hasCurrentLayerBeenMutated() {
    return this.hasBeenMutated;
  }

  public insertNewLayer(name: string, insertionIndex: number) {
    requires(0 <= insertionIndex && insertionIndex <= this.layerStack.length);
    const layer = new Layer(name, this.canvasWidth, this.canvasHeight);
    this.layerStack.splice(insertionIndex, 0, layer);
  }

  public swapLayers(fromIndex: number, toIndex: number) {
    requires(0 <= fromIndex && fromIndex < this.layerStack.length);
    requires(0 <= toIndex && toIndex < this.layerStack.length);
    const tmp = this.layerStack[fromIndex];
    this.layerStack[fromIndex] = this.layerStack[toIndex];
    this.layerStack[toIndex] = tmp;

    if (this.currentLayer == fromIndex) this.switchToLayer(toIndex);
    else if (this.currentLayer == toIndex) this.switchToLayer(fromIndex);
  }

  public reorderLayersOnIndices(indices: number[]) {
    requires(this.layerStack.length == indices.length);
    const newStack = new Array<Layer>(this.layerStack.length);
    for (let i = 0; i < this.layerStack.length; i++) {
      assert(0 <= indices[i] && indices[i] < this.layerStack.length);
      newStack[i] = this.layerStack[indices[i]];
    }
    this.layerStack = newStack;
  }

  public addNewLayer(name: string) {
    this.layerStack.push(new Layer(name, this.canvasWidth, this.canvasHeight));
  }

  public duplicateLayer(
    name: string,
    fromIndex: number,
    toIndex: number,
    overlayRenderer: OverlayRenderer
  ) {
    requires(0 <= fromIndex && fromIndex < this.layerStack.length);
    requires(0 <= toIndex && toIndex <= this.layerStack.length);
    const targetLayer = this.layerStack[fromIndex];
    this.layerStack.splice(toIndex, 0, targetLayer.duplicate(name, overlayRenderer));
  }

  deleteLayer(index: number) {
    requires(0 <= index && index < this.layerStack.length);
    requires(this.layerStack.length > 1);
    this.layerStack.splice(index, 1);

    if (this.currentLayer >= index)
      this.switchToLayer(mod(this.currentLayer - 1, this.layerStack.length));
  }

  public resetMutation() {
    this.hasBeenMutated = false;
  }

  public getCanvasFramebufferForMutation() {
    this.hasBeenMutated = true;
    this.getCurrentLayer().modified = true;
    return this.canvasFramebuffer;
  }

  public registerMutation(overlayRenderer: OverlayRenderer) {
    this.hasBeenMutated = true;
    this.getCurrentLayer().registerMutation(overlayRenderer);
  }

  public undo() {
    this.getCurrentLayer().revertToPreviousState();
    this.canvasFramebuffer = new FrameBuffer({
      type: 'with texture',
      target: 'Regular',
      texture: this.getCurrentLayer().getTexture(),
    });
    this.hasBeenMutated = true;
  }

  private setupEvents(overlayRenderer: OverlayRenderer) {
    EventManager.subscribe('clearCanvas', () => {
      this.registerMutation(overlayRenderer);
      clearFramebuffer(this.canvasFramebuffer, 1, 1, 1, 1);
    });
    EventManager.subscribe('undo', () => this.undo());
  }
}

// Always returns a positive result
function mod(n: number, m: number) {
  return ((n % m) + m) % m;
}
