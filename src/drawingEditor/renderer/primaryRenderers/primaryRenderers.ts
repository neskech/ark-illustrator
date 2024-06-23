import type Camera from '~/drawingEditor/canvas/camera';
import CanvasRenderer from './canvasRenderer';
import type AssetManager from '../util/assetManager';

export default class PrimaryRenderers {
  private canvasRenderer: CanvasRenderer;

  constructor(camera: Camera, assetManager: AssetManager) {
    this.canvasRenderer = new CanvasRenderer(camera, assetManager);
  }

  getCanvasRenderer() {
    return this.canvasRenderer;
  }
}
