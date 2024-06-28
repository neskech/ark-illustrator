import { type AllToolSettings } from '~/drawingEditor/Input/toolSystem/settings';
import type AssetManager from '../util/assetManager';
import BrushToolRenderer from './brush/brushToolRenderer';
import RectangleToolRenderer from './rectangleToolRenderer';

export default class ToolRenderers {
  private brushToolRenderer: BrushToolRenderer;
  private rectangleToolRenderer: RectangleToolRenderer;

  constructor(assetManager: AssetManager, settings: AllToolSettings) {
    this.brushToolRenderer = new BrushToolRenderer(
      assetManager,
      settings.brushConfigurations.getCurrentPreset()
    );
    this.rectangleToolRenderer = new RectangleToolRenderer(assetManager);
  }

  getBrushToolRenderer() {
    return this.brushToolRenderer;
  }

  getRectangleToolRenderer() {
    return this.rectangleToolRenderer;
  }
}
