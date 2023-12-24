import GestureHandler from '../gesturesAndShortcuts/gestureHandler';
import ShortcutHandler from '../gesturesAndShortcuts/shortcutHandler';
import { Brush } from './brush';
import { type GlobalToolSettings } from './settings';
import { type EventString, type HandleEventArgs } from './tool';
import EventManager from '../../event/eventManager';
import { Fill } from './fill';
import { Hand } from './hand';
import { Square } from './square';
import { Circle } from './circle';

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

export type HandlerArgs = Omit<HandleEventArgs, 'eventString'> & {
  map: ToolMap;
  currentTool: ToolType;
  gestures: GestureHandler;
  shortcuts: ShortcutHandler;
};

export function handleEvent({
  map,
  currentTool,
  gestures,
  shortcuts,
  event,
  appState,
  settings,
  presetNumber,
}: HandlerArgs): void {
  const tool = map[currentTool];
  const evStr: EventString = event.type as EventString; //TODO: pain point

  let dirty = false;

  dirty = tool.handleEvent({
    event,
    appState,
    eventString: evStr,
    settings,
    presetNumber,
  });

  dirty = gestures.handleEvent(event, appState, evStr) || dirty;
  dirty = shortcuts.handleEvent(event, appState, evStr) || dirty;

  if (dirty) EventManager.invokeVoid('appStateMutated');
}
