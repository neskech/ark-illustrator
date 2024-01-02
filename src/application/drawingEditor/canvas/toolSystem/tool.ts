import { type AppState } from '~/application/drawingEditor/application';
import { type GlobalToolSettings } from './settings';

export type EventString = keyof HTMLElementEventMap;
export type CanvasEvent = HTMLElementEventMap[EventString];

export interface HandleEventArgs {
  appState: AppState
  event: CanvasEvent;
  eventString: EventString;
  settings: GlobalToolSettings;
}

export abstract class Tool {
  abstract handleEvent(args: HandleEventArgs): boolean;
}
