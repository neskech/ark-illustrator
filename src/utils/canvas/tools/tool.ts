import { type Option } from '~/utils/func/option';
import { type GlobalToolSettings } from './settings';
import { type AppState } from '~/utils/mainRoutine';

export type EventString = keyof HTMLElementEventMap;
export type CanvasEvent = HTMLElementEventMap[EventString];

export interface HandleEventArgs {
  appState: AppState;
  event: CanvasEvent;
  eventString: EventString;
  settings: GlobalToolSettings;
  presetNumber: Option<number>;
}

export abstract class Tool {
  abstract handleEvent(args: HandleEventArgs): boolean;
}
