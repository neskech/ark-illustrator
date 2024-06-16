import CanvasRenderModuleManager from './module/canvasModuleManager';
import WorldModuleManager from './module/worldModuleManager';
import BrushModule from './module/brushModule';
import { type GL } from '../webgl/glUtils';
import type AssetManager from './assetManager';
import WorldModule from './module/worldModule';
import type Camera from '../canvas/camera';

export default class Renderer {
  private canvasModules: CanvasRenderModuleManager;
  private worldModules: WorldModuleManager;

  constructor(gl: GL, canvas: HTMLCanvasElement, camera: Camera, assetManager: AssetManager) {
    this.canvasModules = new CanvasRenderModuleManager(gl, canvas);
    this.worldModules = new WorldModuleManager();

    this.setCanvasModules(gl, assetManager);
    this.setWorldModules(gl, camera, assetManager);
  }

  render() {
    const canvas = this.canvasModules.getCanvasFramebufferInUse();
    this.worldModules.render(canvas);
  }

  private setCanvasModules(gl: GL, assetManager: AssetManager) {
    this.canvasModules.addModule(
      new BrushModule({
        name: 'brush module',
        gl,
        assetManager,
        moduleManager: this.canvasModules,
      })
    );
  }

  private setWorldModules(gl: GL, camera: Camera, assetManager: AssetManager) {
    this.worldModules.addModule(
      new WorldModule({ name: 'world module', gl, camera, zIndex: 0, assetManager })
    );
  }
}
