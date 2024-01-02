import GestureHandler from '../gesturesAndShortcuts/gestureHandler';
import ShortcutHandler from '../gesturesAndShortcuts/shortcutHandler';
import { Brush } from './tools/brush';
import { type GlobalToolSettings } from './settings';
import { CanvasEvent, type EventString } from './tool';
import EventManager from '../../../eventSystem/eventManager';
import { Fill } from './tools/fill';
import { Hand } from './tools/hand';
import { Square } from './tools/square';
import { Circle } from './tools/circle';
import { AppState, appState } from '../../mainRoutine';
import { Option } from '~/application/general/option';
import { CanvasState } from '../canvas';

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
  appState: AppState
  settings: GlobalToolSettings;
  presetNumber: Option<number>;
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
