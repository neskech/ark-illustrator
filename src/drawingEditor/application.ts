import EventManager from '../util/eventSystem/eventManager';
import { Err, Ok, type Result } from '../util/general/result';
import { getDefaultCanvasState, type CanvasState } from './canvas/canvas';
import { getDefaultToolState, handleEvent, type InputState } from './canvas/toolSystem/handler';
import { getDefaultSettings, type GlobalToolSettings } from './canvas/toolSystem/settings';
import AssetManager from './renderer/assetManager';
import { MasterPipeline } from './renderer/pipelines/MasterPipeline';
import { fetchWebGLContext } from './webgl/glUtils';

export interface AppState {
  canvasState: CanvasState;
  settings: GlobalToolSettings;
  inputState: InputState;
  renderer: MasterPipeline;
  assetManager: AssetManager;
}

export default class EditorApplication {
  private appState!: AppState;
  private isInitialized: boolean;
  private static instance: EditorApplication;

  constructor() {
    this.isInitialized = false;
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
    gl.viewport(0, 0, canvas.width, canvas.height)

    const assetManager = new AssetManager();
    const resShader = await assetManager.initShaders(gl);
    if (resShader.isErr()) return Err(resShader.unwrapErr());
    const resTexture = await assetManager.initTextures(gl);
    if (resTexture.isErr()) return Err(resTexture.unwrapErr());

    const settings = getDefaultSettings(gl);
    instance.appState = {
      settings,
      canvasState: getDefaultCanvasState(canvas),
      inputState: getDefaultToolState(settings),
      renderer: new MasterPipeline(gl, canvas, assetManager),
      assetManager,
    };

    instance.initEventListeners(canvas);
    instance.appState.renderer.init(instance.appState.canvasState.camera);
    EventManager.invokeVoid('appStateMutated');

    return Ok(instance.appState);
  }

  static destroy() {
    const instance = this.getInstance();
    instance.appState.renderer.destroy();
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
        handleEvent({
          map: this.appState.inputState.tools,
          event: ev,
          gestures: this.appState.inputState.gestures,
          shortcuts: this.appState.inputState.shortcuts,
          currentTool: this.appState.inputState.currentTool.current,
          appState: this.appState,
          settings: this.appState.settings,
        });
      });
    });

    const globalEvents: (keyof HTMLElementEventMap)[] = ['keydown', 'keypress', 'keyup'];

    globalEvents.forEach((e) => {
      document.addEventListener(e, (ev) => {
        handleEvent({
          map: this.appState.inputState.tools,
          event: ev,
          gestures: this.appState.inputState.gestures,
          shortcuts: this.appState.inputState.shortcuts,
          currentTool: this.appState.inputState.currentTool.current,
          appState: this.appState,
          settings: this.appState.settings,
        });
      });
    });
  }
}
