import { Err, Ok, type Result } from '../util/general/result';
import { InputManager } from './Input/toolSystem/inputManager';
import AssetManager from './renderer/util/assetManager';
import Renderer from './renderer/renderer';
import { fetchWebGLContext, type GL } from '../util/webglWrapper/glUtils';
import LayerManager from './canvas/layerManager';
import { getDefaultSettings } from './Input/toolSystem/settings';
import { type EventTypeName } from './Input/toolSystem/tool';

export interface AppState {
  layerManager: LayerManager;
  inputManager: InputManager;
  renderer: Renderer;
  canvas: HTMLCanvasElement;
  assetManager: AssetManager;
}

export let gl: GL;

export default class EditorApplication {
  private appState!: AppState;
  private isInitialized: boolean;
  private lastUpdateTime: number;
  private static instance: EditorApplication;

  constructor() {
    this.isInitialized = false;
    this.lastUpdateTime = performance.now();
  }

  private static getInstance(): EditorApplication {
    if (!this.instance) this.instance = new EditorApplication();
    return this.instance;
  }

  static async init(canvas: HTMLCanvasElement, debug = false): Promise<Result<AppState, string>> {
    const instance = this.getInstance();

    if (instance.isInitialized) {
      console.warn('App already initialized');
      return Ok(instance.appState);
    }

    const context = fetchWebGLContext(canvas, debug);
    if (context.isNone()) return Err('Could not intialize webgl2. Your browser may not support it');
    gl = context.unwrap();

    canvas.width = canvas.clientWidth * 2;
    canvas.height = canvas.clientHeight * 2;

    const assetManager = new AssetManager();
    const resShader = await assetManager.initShaders();
    if (resShader.isErr()) return Err(resShader.unwrapErr());
    const resTexture = await assetManager.initTextures();
    if (resTexture.isErr()) return Err(resTexture.unwrapErr());

    const layerManager = new LayerManager(canvas);
    const inputManager = new InputManager(await getDefaultSettings());
    const renderer = new Renderer(canvas, inputManager.getSettings(), assetManager);
    instance.appState = {
      layerManager,
      inputManager,
      renderer,
      canvas,
      assetManager,
    };

    instance.initEventListeners(canvas);
    instance.updateLoop();

    return Ok(instance.appState);
  }

  static destroy() {
    //TODO
    //const instance = this.getInstance();
    //instance.appState.renderer.destroy();
  }

  private initEventListeners(canvas: HTMLCanvasElement) {
    const canvasEvents: EventTypeName[] = [
      'pointerdown',
      'pointermove',
      'pointerup',
      'pointerleave',
      'pointercancel',
      'pointerout',
      'wheel',
      'keydown',
      'keypress',
      'keyup',
    ];

    canvasEvents.forEach((e) => {
      if (e == 'pointermove')
          alert("M O V E")
      canvas.addEventListener(e, (ev) => {
        this.appState.inputManager.handleEvent(
          ev,
          e,
          this.appState.renderer.getCamera(),
          this.appState.layerManager,
          this.appState.canvas
        );
      });
    });

    const globalEvents: EventTypeName[] = ['keydown', 'keypress', 'keyup'];

    globalEvents.forEach((e) => {
      document.addEventListener(e, (ev) => {
        this.appState.inputManager.handleEvent(
          ev,
          e,
          this.appState.renderer.getCamera(),
          this.appState.layerManager,
          this.appState.canvas
        );
      });
    });
  }

  private updateLoop() {
    const now = performance.now();
    const delta = (now - this.lastUpdateTime) / 1000.0;
    this.lastUpdateTime = now;

    this.appState.inputManager.handleUpdate(
      delta,
      this.appState.inputManager.getSettings(),
      this.appState.canvas,
      this.appState.renderer.getToolRenderers(),
      {
        camera: this.appState.renderer.getCamera(),
        utilityRenderers: this.appState.renderer.getUtilityRenderers(),
        assetManager: this.appState.assetManager,
        layerManager: this.appState.layerManager,
        overlayFramebuffer: this.appState.renderer.getOverlayFramebuffer(),
      }
    );
    this.appState.renderer.render({
      camera: this.appState.renderer.getCamera(),
      utilityRenderers: this.appState.renderer.getUtilityRenderers(),
      layerManager: this.appState.layerManager,
      overlayFramebuffer: this.appState.renderer.getOverlayFramebuffer(),
    });

    window.requestAnimationFrame(this.updateLoop.bind(this));
  }
}
