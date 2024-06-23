import { type AppState } from '../../application';
import GestureHandler from '../gesturesAndShortcuts/gestureHandler';
import ShortcutHandler from '../gesturesAndShortcuts/shortcutHandler';
import { type AllToolSettings } from './settings';
import { type CanvasEvent, type EventString } from './tool';
import { BrushTool } from './tools/brushTool/brushTool';
import { CircleTool } from './tools/circleTool';
import { FillTool } from './tools/fillTool';
import { HandTool } from './tools/handTool';
import { RectangleTool } from './tools/rectangleTool';

export type ToolMap = {
  brush: BrushTool;
  fillBucket: FillTool;
  hand: HandTool;
  square: RectangleTool;
  circle: CircleTool;
};

export type ToolType = keyof ToolMap;

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
    const evStr: EventString = event.type as EventString; //TODO: pain point

    tool.handleEvent({
      event,
      appState,
      eventString: evStr,
      settings: this.settings,
    });

    this.gestures.handleEvent(event, appState, evStr);
    this.shortcuts.handleEvent(event, appState, evStr);
  }

  handleUpdate(deltaTime: number) {
    const tool = this.toolMap[this.currentTool];
    tool.update(deltaTime);
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
