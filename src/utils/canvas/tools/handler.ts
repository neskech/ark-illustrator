import GestureHandler from '../gesturesAndShortcuts/gestureHandler';
import ShortcutHandler from '../gesturesAndShortcuts/shortcutHandler';
import { Brush } from './brush';
import { type GlobalToolSettings } from './settings';
import { type EventString, type HandleEventArgs } from './tool';

export type ToolMap = {
  brush: Brush;
};
export type ToolType = keyof ToolMap;

export interface InputState {
  tools: ToolMap;
  currentTool: ToolType;
  gestures: GestureHandler;
  shortcuts: ShortcutHandler;
}

export function getDefaultToolState(settings: Readonly<GlobalToolSettings>): InputState {
  return {
    tools: {
      brush: new Brush(settings),
    },
    currentTool: 'brush',
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

  let dirty = false

  dirty = tool.handleEvent({
    event,
    appState,
    eventString: evStr,
    settings,
    presetNumber,
  }) || dirty;

  dirty = gestures.handleEvent(event, appState, evStr) || dirty;
  dirty = shortcuts.handleEvent(event, appState, evStr) || dirty;

  if (dirty) appState.onAppStateMutated.invoke()
}
