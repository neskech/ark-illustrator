import type ToolRenderers from '~/drawingEditor/renderer/toolRenderers/toolRendererList';
import GestureHandler from '../gesturesAndShortcuts/gestureHandler';
import ShortcutHandler, { type ShortcutContext } from '../gesturesAndShortcuts/shortcutHandler';
import { getDefaultSettings, type AllToolSettings } from './settings';
import {
  type ToolMap,
  type ToolType,
  type CanvasEvent,
  type EventTypeName,
  type ToolContext,
  Tool,
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

export class InputManager {
  private toolMap: ToolMap;
  private settings: AllToolSettings;
  private currentTool: ToolType;
  private gestures: GestureHandler;
  private shortcuts: ShortcutHandler;

  constructor(defaultTool: ToolType = 'brush') {
    this.settings = getDefaultSettings();
    this.toolMap = {
      fillBucket: new FillTool(),
      hand: new HandTool(),
      square: new RectangleTool(),
      circle: new CircleTool(),
      brush: new BrushTool(this.settings),
    };
    this.currentTool = defaultTool;

    this.gestures = new GestureHandler();
    this.shortcuts = new ShortcutHandler();
  }

  handleEvent(
    event: CanvasEvent,
    camera: Camera,
    layerManager: LayerManager,
    canvas: HTMLCanvasElement
  ) {
    const tool = this.toolMap[this.currentTool];
    const eventType = event.type as EventTypeName;

    const toolContext: ToolContext = {
      camera,
      settings: this.settings,
      eventType,
      canvas,
    };
    tool.handleEvent(toolContext, event);
    tool.callAppropiateEventFunction(toolContext, event);

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
    camera: Camera,
    settings: AllToolSettings,
    canvas: HTMLCanvasElement
  ) {
    const tool: Tool = this.toolMap[this.currentTool];
    tool.update({ camera, settings, canvas }, deltaTime);
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
