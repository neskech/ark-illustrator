import type AssetManager from '../util/assetManager';
import OverlayRenderer from './overlayRenderer';

export default class UtilityRenderers {
  private overlayRenderer: OverlayRenderer;

  constructor(assetManager: AssetManager) {
    this.overlayRenderer = new OverlayRenderer(assetManager);
  }

  getOverlayRenderer() {
    return this.overlayRenderer;
  }
}
