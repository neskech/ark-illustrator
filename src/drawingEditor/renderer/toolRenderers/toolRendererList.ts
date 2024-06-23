import type FrameBuffer from '~/drawingEditor/webgl/frameBuffer';
import type AssetManager from '../util/assetManager';
import BrushToolRenderer from './brushRenderer';
import RectangleToolRenderer from './rectangleToolRenderer';
import type UtilityRenderers from '../utilityRenderers.ts/utilityRenderers';

//TODO: Refractor all to flat args 
export type ToolRenderersArgs = {
  assetManager: AssetManager;
  canvasFramebuffer: FrameBuffer;
  canvasOverlayFramebuffer: FrameBuffer;
  utilityRenderers: UtilityRenderers;
};

export default class ToolRenderers {
  private brushToolRenderer: BrushToolRenderer;
  private rectangleToolRenderer: RectangleToolRenderer;

  constructor(args: ToolRenderersArgs) {
    this.brushToolRenderer = new BrushToolRenderer(args);
    this.rectangleToolRenderer = new RectangleToolRenderer(args);
  }

  getBrushToolRenderer() {
    return this.brushToolRenderer;
  }

  getRectangleToolRenderer() {
    return this.rectangleToolRenderer
  }
}
