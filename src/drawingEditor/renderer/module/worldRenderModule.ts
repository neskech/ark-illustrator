import type FrameBuffer from '~/drawingEditor/webgl/frameBuffer';
import type AssetManager from '../assetManager';
import { type GL } from '~/drawingEditor/webgl/glUtils';

export type WorldRenderModuleArgs = {
  gl: GL;
  name: string;
  zIndex: number;
  assetManager: AssetManager;
};

export default abstract class WorldRenderModule {
  protected readonly gl: GL;
  protected readonly name: string;
  protected readonly zIndex: number;
  protected assetManager: AssetManager;

  constructor(args: WorldRenderModuleArgs) {
    this.gl = args.gl;
    this.name = args.name;
    this.zIndex = args.zIndex;
    this.assetManager = args.assetManager;
  }

  abstract render(canvasFramebuffer: FrameBuffer): void;

  getName(): string {
    return this.name;
  }

  getZIndex(): number {
    return this.zIndex;
  }
}
