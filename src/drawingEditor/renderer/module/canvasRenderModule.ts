import type FrameBuffer from '~/drawingEditor/webgl/frameBuffer';
import type AssetManager from '../assetManager';
import { type GL } from '~/drawingEditor/webgl/glUtils';
import type CanvasRenderModuleManager from './canvasModuleManager';
import type OverlayRenderer from './overlayRenderer';

export type CanvasRenderModuleArgs = {
  gl: GL;
  name: string;
  assetManager: AssetManager;
  moduleManager: CanvasRenderModuleManager;
};

export default abstract class CanvasRenderModule {
  protected readonly gl: GL;
  protected readonly name: string;
  protected canvasFramebuffer: FrameBuffer;
  protected canvasOverlayFramebuffer: FrameBuffer;
  protected assetManager: AssetManager;
  protected overlayRenderer: OverlayRenderer
  private moduleManager: CanvasRenderModuleManager;

  constructor(args: CanvasRenderModuleArgs) {
    this.name = args.name;
    this.gl = args.gl;
    this.canvasFramebuffer = args.moduleManager.getCanvasFramebuffer();
    this.canvasOverlayFramebuffer = args.moduleManager.getCanvasOverlayFramebuffer();
    this.overlayRenderer = args.moduleManager.getOverlayRenderer()
    this.assetManager = args.assetManager;
    this.moduleManager = args.moduleManager;
  }

  isOverlayFramebufferIsEmpty(yesOrNo: boolean) {
    this.moduleManager.isOverlayFramebufferBlank(yesOrNo);
  }

  getName(): string {
    return this.name;
  }
}
