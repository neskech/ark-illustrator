import { type AppState } from '~/drawingEditor/application';
import { type AllToolSettings } from './settings';

export type EventString = keyof HTMLElementEventMap;
export type CanvasEvent = HTMLElementEventMap[EventString];

export interface HandleEventArgs {
  appState: AppState;
  event: CanvasEvent;
  eventString: EventString;
  settings: AllToolSettings;
}

export abstract class Tool {
  abstract handleEvent(args: HandleEventArgs): void;
  abstract update(deltaTime: number): void;
}
