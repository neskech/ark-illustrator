import type AssetManager from '../util/assetManager';
import BrushToolRenderer from './brushToolRenderer';
import RectangleToolRenderer from './rectangleToolRenderer';

export default class ToolRenderers {
  private brushToolRenderer: BrushToolRenderer;
  private rectangleToolRenderer: RectangleToolRenderer;

  constructor(assetManager: AssetManager) {
    this.brushToolRenderer = new BrushToolRenderer(assetManager);
    this.rectangleToolRenderer = new RectangleToolRenderer(assetManager);
  }

  getBrushToolRenderer() {
    return this.brushToolRenderer;
  }

  getRectangleToolRenderer() {
    return this.rectangleToolRenderer;
  }
}
