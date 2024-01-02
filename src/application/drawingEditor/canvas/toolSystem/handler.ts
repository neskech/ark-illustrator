import EventManager from '../../../eventSystem/eventManager';
import { type AppState } from '../../application';
import GestureHandler from '../gesturesAndShortcuts/gestureHandler';
import ShortcutHandler from '../gesturesAndShortcuts/shortcutHandler';
import { type GlobalToolSettings } from './settings';
import { type CanvasEvent, type EventString } from './tool';
import { Brush } from './tools/brush';
import { Circle } from './tools/circle';
import { Fill } from './tools/fill';
import { Hand } from './tools/hand';
import { Square } from './tools/square';

export type ToolMap = {
  brush: Brush;
  fillBucket: Fill;
  hand: Hand;
  square: Square;
  circle: Circle;
};
export type ToolType = keyof ToolMap;
export type ToolTypeRef = { current: ToolType };

export interface InputState {
  tools: ToolMap;
  currentTool: ToolTypeRef;
  gestures: GestureHandler;
  shortcuts: ShortcutHandler;
}

export function getDefaultToolState(settings: Readonly<GlobalToolSettings>): InputState {
  return {
    tools: {
      fillBucket: new Fill(),
      hand: new Hand(),
      square: new Square(),
      circle: new Circle(),
      brush: new Brush(settings),
    },
    currentTool: { current: 'brush' },
    gestures: new GestureHandler(),
    shortcuts: new ShortcutHandler(),
  };
}

export type HandlerArgs = {
  map: ToolMap;
  currentTool: ToolType;
  gestures: GestureHandler;
  shortcuts: ShortcutHandler;
  event: CanvasEvent;
  appState: AppState;
  settings: GlobalToolSettings;
};

export function handleEvent({
  map,
  currentTool,
  gestures,
  shortcuts,
  event,
  appState,
  settings,
}: HandlerArgs): void {
  const tool = map[currentTool];
  const evStr: EventString = event.type as EventString; //TODO: pain point

  let dirty = false;

  dirty = tool.handleEvent({
    event,
    appState,
    eventString: evStr,
    settings,
  });

  dirty = gestures.handleEvent(event, appState, evStr) || dirty;
  dirty = shortcuts.handleEvent(event, appState, evStr) || dirty;

  if (dirty) EventManager.invokeVoid('appStateMutated');
}
