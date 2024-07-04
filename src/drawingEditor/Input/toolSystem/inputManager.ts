import type ToolRenderers from '~/drawingEditor/renderer/toolRenderers/toolRendererList';
import GestureHandler from '../gesturesAndShortcuts/gestureHandler';
import ShortcutHandler, { type ShortcutContext } from '../gesturesAndShortcuts/shortcutHandler';
import { type AllToolSettings } from './settings';
import {
  type ToolMap,
  type ToolTypeName,
  type CanvasEvent,
  type EventTypeName,
  type ToolContext,
  type Tool,
} from './tool';
import { BrushTool } from './tools/brushTool/brushTool';
import { CircleTool } from './tools/circleTool';
import { FillTool } from './tools/fillTool';
import { HandTool } from './tools/handTool';
import { RectangleTool } from './tools/rectangleTool';
import { type RenderContext } from '~/drawingEditor/renderer/renderer';
import type Camera from '~/drawingEditor/renderer/camera';
import type LayerManager from '../../canvas/layerManager';
import { type GestureContext } from '../gesturesAndShortcuts/gestures/gesture';
import InputState from './inputState';

export class InputManager {
  private toolMap: ToolMap;
  private settings: AllToolSettings;
  private inputState: InputState;
  private currentTool: ToolTypeName;
  private gestures: GestureHandler;
  private shortcuts: ShortcutHandler;

  constructor(settings: AllToolSettings, defaultTool: ToolTypeName = 'brush') {
    this.settings = settings;
    this.toolMap = {
      fillBucket: new FillTool(),
      hand: new HandTool(),
      square: new RectangleTool(),
      circle: new CircleTool(),
      brush: new BrushTool(this.settings),
    };
    this.inputState = new InputState();
    this.currentTool = defaultTool;

    this.gestures = new GestureHandler();
    this.shortcuts = new ShortcutHandler();
  }

  handleEvent(
    event: CanvasEvent,
    eventType: EventTypeName,
    camera: Camera,
    layerManager: LayerManager,
    canvas: HTMLCanvasElement
  ) {
    const tool = this.toolMap[this.currentTool];

    this.inputState.update();
    this.inputState.callAppropiateEventFunction(eventType, event);

    // const toolContext: ToolContext = {
    //   camera,
    //   settings: this.settings,
    //   inputState: this.inputState,
    //   eventType,
    //   canvas,
    // };
    // tool.handleEvent(toolContext, event);
    // tool.callAppropiateEventFunction(toolContext, event);

    const gestureContext: GestureContext = {
      camera,
      eventType,
      canvas,
      layerManager,
    };
    this.gestures.callAppropiateEventFunction(gestureContext, event);

    const shortcutContext: ShortcutContext = {
      camera,
      eventType,
      canvas,
      layerManager,
    };
    this.shortcuts.callAppropiateEventFunction(shortcutContext, event);
  }

  handleUpdate(
    deltaTime: number,
    settings: AllToolSettings,
    canvas: HTMLCanvasElement,
    renderers: ToolRenderers,
    renderContext: RenderContext
  ) {
    const tool: Tool = this.toolMap[this.currentTool];
    tool.updateAndRender(
      {
        deltaTime,
        inputState: this.inputState,
        settings,
        canvas,
        ...renderContext,
      },
      renderers
    );
  }

  getCurrentTool() {
    return this.currentTool;
  }

  getSettings(): AllToolSettings {
    return this.settings;
  }

  setCurrentTool(tool: ToolTypeName) {
    this.currentTool = tool;
  }
}
