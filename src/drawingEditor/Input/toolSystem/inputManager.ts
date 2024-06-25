import type ToolRenderers from '~/drawingEditor/renderer/toolRenderers/toolRendererList';
import { type AppState } from '../../application';
import GestureHandler from '../gesturesAndShortcuts/gestureHandler';
import ShortcutHandler from '../gesturesAndShortcuts/shortcutHandler';
import { type AllToolSettings } from './settings';
import {
  type ToolMap,
  type ToolType,
  type CanvasEvent,
  type EventTypeName,
  type ToolContext,
} from './tool';
import { BrushTool } from './tools/brushTool/brushTool';
import { CircleTool } from './tools/circleTool';
import { FillTool } from './tools/fillTool';
import { HandTool } from './tools/handTool';
import { RectangleTool } from './tools/rectangleTool';
import { type RenderContext } from '~/drawingEditor/renderer/renderer';

export class InputManager {
  private toolMap: ToolMap;
  private settings: AllToolSettings;
  private currentTool: ToolType;
  private gestures: GestureHandler;
  private shortcuts: ShortcutHandler;

  constructor(settings: AllToolSettings, defaultTool: ToolType = 'brush') {
    this.settings = settings;
    this.toolMap = {
      fillBucket: new FillTool(),
      hand: new HandTool(),
      square: new RectangleTool(),
      circle: new CircleTool(),
      brush: new BrushTool(settings),
    };
    this.currentTool = defaultTool;

    this.gestures = new GestureHandler();
    this.shortcuts = new ShortcutHandler();
  }

  handleEvent(event: CanvasEvent, appState: AppState) {
    const tool = this.toolMap[this.currentTool];
    const eventType = event.type as EventTypeName;

    const toolContext: ToolContext = {
      canvasState: appState.canvasState,
      settings: this.settings,
      eventType,
    };
    tool.handleEvent(toolContext, event);
    tool.callAppropiateEventFunction(toolContext, event);

    this.gestures.handleEvent(event, appState, eventType);
    this.shortcuts.handleEvent(event, appState, eventType);
  }

  handleUpdate(deltaTime: number) {
    const tool = this.toolMap[this.currentTool];
    tool.update(deltaTime);
  }

  handleRender(renderers: ToolRenderers, renderContext: RenderContext) {
    const tool = this.toolMap[this.currentTool];
    tool.acceptRenderer(renderers, renderContext);
  }

  getCurrentTool() {
    return this.currentTool;
  }

  getSettings(): AllToolSettings {
    return this.settings;
  }

  setCurrentTool(tool: ToolType) {
    this.currentTool = tool;
  }
}
