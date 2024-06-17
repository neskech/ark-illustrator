import { type AppState } from '../../application';
import GestureHandler from '../gesturesAndShortcuts/gestureHandler';
import ShortcutHandler from '../gesturesAndShortcuts/shortcutHandler';
import { type AllToolSettings } from './settings';
import { type CanvasEvent, type EventString } from './tool';
import { Brush } from './tools/brush';
import { Circle } from './tools/circle';
import { Fill } from './tools/fill';
import { Hand } from './tools/hand';
import { Rectangle } from './tools/rectangle';

export type ToolMap = {
  brush: Brush;
  fillBucket: Fill;
  hand: Hand;
  square: Rectangle;
  circle: Circle;
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
      fillBucket: new Fill(),
      hand: new Hand(),
      square: new Rectangle(),
      circle: new Circle(),
      brush: new Brush(settings),
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
