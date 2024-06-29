import CanvasRenderer from './canvasRenderer';
import type AssetManager from '../util/assetManager';
import type Camera from '../camera';
import type LayerManager from '~/drawingEditor/canvas/layerManager';
import type FrameBuffer from '~/util/webglWrapper/frameBuffer';
import LayerRenderer from './layerRenderer';
import type UtilityRenderers from '../utilityRenderers.ts/utilityRenderers';
import { clearFramebuffer } from '../util/renderUtils';

export type PrimaryRendererContext = {
  camera: Camera;
  layerManager: LayerManager;
  overlayFramebuffer: FrameBuffer;
  utilityRenderers: UtilityRenderers;
};

export default class PrimaryRenderers {
  private canvasRenderer: CanvasRenderer;
  private layerRenderer: LayerRenderer;

  constructor(assetManager: AssetManager, camera: Camera, canvas: HTMLCanvasElement) {
    this.canvasRenderer = new CanvasRenderer(camera, assetManager);
    this.layerRenderer = new LayerRenderer(canvas);
  }

  render(renderContext: PrimaryRendererContext) {
    const finalResult = this.layerRenderer.renderAndGetFinalFramebuffer(renderContext);
    this.canvasRenderer.render({ canvasFramebuffer: finalResult, ...renderContext });
    renderContext.layerManager.resetMutation();
  }
}
