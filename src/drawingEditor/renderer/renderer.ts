import CanvasRenderModuleManager from './module/canvasModuleManager';
import WorldModuleManager from './module/worldModuleManager';
import BrushModule from './module/moduleTypes/brushModule';
import { type GL } from '../webgl/glUtils';
import type AssetManager from './assetManager';
import WorldModule from './module/moduleTypes/worldModule';
import type Camera from '../canvas/camera';
import { clearScreen } from './util';
import type FrameBuffer from '../webgl/frameBuffer';
import RectangleModule from './module/moduleTypes/rectangleModule';

export default class Renderer {
  private gl: GL;
  private canvasModules: CanvasRenderModuleManager;
  private worldModules: WorldModuleManager;

  constructor(gl: GL, canvas: HTMLCanvasElement, camera: Camera, assetManager: AssetManager) {
    this.gl = gl;
    this.canvasModules = new CanvasRenderModuleManager(gl, canvas, assetManager);
    this.worldModules = new WorldModuleManager();
    this.init(gl, canvas, camera, assetManager);
  }

  render() {
    const canvas = this.canvasModules.getCanvasFramebufferInUse();
    this.worldModules.render(canvas);
  }

  getGLHandle(): GL {
    return this.gl;
  }

  getCanvasFramebuffer(): FrameBuffer {
    return this.canvasModules.getCanvasFramebuffer();
  }

  private init(gl: GL, canvas: HTMLCanvasElement, camera: Camera, assetManager: AssetManager) {
    gl.viewport(0, 0, canvas.width, canvas.height);

    clearScreen(gl);
    gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    this.setCanvasModules(gl, assetManager);
    this.setWorldModules(gl, camera, assetManager);
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

    this.canvasModules.addModule(
      new RectangleModule({
        name: 'rectangle module',
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
