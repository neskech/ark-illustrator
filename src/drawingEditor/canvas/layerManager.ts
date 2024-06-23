import { requires } from '~/util/general/contracts';
import Layer from './layer';
import { todo } from '~/util/general/funUtils';

export default class LayerManager {
  private layerStack: Layer[];
  private currentLayer: number;
  private canvasWidth: number;
  private canvasHeight: number;

  constructor(canvas: HTMLCanvasElement) {
    this.canvasWidth = canvas.width;
    this.canvasHeight = canvas.height;
    this.layerStack = [new Layer(this.canvasWidth, this.canvasHeight)];
    this.currentLayer = 0;
    this.setupEvents();
  }

  public getCurrentLayer() {
    requires(0 <= this.currentLayer && this.currentLayer < this.layerStack.length);
    return this.layerStack[this.currentLayer];
  }

  private setupEvents() {
    todo();
  }
}
