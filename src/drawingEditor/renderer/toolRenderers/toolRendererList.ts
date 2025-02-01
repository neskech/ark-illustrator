import { type AllToolSettings } from '~/drawingEditor/Input/toolSystem/settings';
import type AssetManager from '../util/assetManager';
import BrushToolRenderer from './brush/brushToolRenderer';
import RectangleToolRenderer from './rectangleToolRenderer';
import FillToolRenderer from './fillToolRenderer';

export default class ToolRenderers {
  private brushToolRenderer: BrushToolRenderer;
  private rectangleToolRenderer: RectangleToolRenderer;
  private fillToolRenderer: FillToolRenderer;

  constructor(assetManager: AssetManager, settings: AllToolSettings) {
    this.brushToolRenderer = new BrushToolRenderer(
      assetManager,
      settings.brushConfigurations.getCurrentPreset()
    );
    this.rectangleToolRenderer = new RectangleToolRenderer(assetManager);
    this.fillToolRenderer = new FillToolRenderer();
  }

  getBrushToolRenderer() {
    return this.brushToolRenderer;
  }

  getRectangleToolRenderer() {
    return this.rectangleToolRenderer;
  }

  getFillToolRenderer() {
    return this.fillToolRenderer;
  }
}
