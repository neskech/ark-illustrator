import { Err, Ok, type Result } from '../util/general/result';
import { getDefaultCanvasState, type CanvasState } from './canvas/canvas';
import { InputManager } from './canvas/toolSystem/inputManager';
import { getDefaultSettings, type AllToolSettings } from './canvas/toolSystem/settings';
import AssetManager from './renderer/assetManager';
import Renderer from './renderer/renderer';
import { fetchWebGLContext } from './webgl/glUtils';

export interface AppState {
  canvasState: CanvasState;
  settings: AllToolSettings;
  inputManager: InputManager;
  renderer: Renderer;
  assetManager: AssetManager;
}

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
    const gl = context.unwrap();

    canvas.width = canvas.clientWidth * 2;
    canvas.height = canvas.clientHeight * 2;

    const assetManager = new AssetManager();
    const resShader = await assetManager.initShaders(gl);
    if (resShader.isErr()) return Err(resShader.unwrapErr());
    const resTexture = await assetManager.initTextures(gl);
    if (resTexture.isErr()) return Err(resTexture.unwrapErr());

    const settings = getDefaultSettings(gl);
    const canvasState = getDefaultCanvasState(canvas);
    instance.appState = {
      settings,
      canvasState,
      inputManager: new InputManager(settings),
      renderer: new Renderer(gl, canvas, canvasState.camera, assetManager),
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
    const canvasEvents: (keyof HTMLElementEventMap)[] = [
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
      canvas.addEventListener(e, (ev) => {
        this.appState.inputManager.handleEvent(ev, this.appState);
      });
    });

    const globalEvents: (keyof HTMLElementEventMap)[] = ['keydown', 'keypress', 'keyup'];

    globalEvents.forEach((e) => {
      document.addEventListener(e, (ev) => {
        this.appState.inputManager.handleEvent(ev, this.appState);
      });
    });
  }

  private updateLoop() {
    const now = performance.now();
    const delta = (now - this.lastUpdateTime) / 1000.0;
    this.lastUpdateTime = now;

    this.appState.inputManager.handleUpdate(delta);
    this.appState.renderer.render();
    window.requestAnimationFrame(this.updateLoop.bind(this));
  }
}
