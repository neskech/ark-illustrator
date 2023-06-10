import { type Option } from "~/utils/func/option";
import { type CanvasState } from "../canvas";
import { type GlobalToolSettings } from './settings';

export type EventString = keyof HTMLElementEventMap;
export type CanvasEvent = HTMLElementEventMap[EventString];

export interface HandleEventArgs {
  canvasState: CanvasState;
  event: CanvasEvent;
  eventString: EventString;
  settings: GlobalToolSettings;
  presetNumber: Option<number>;
}

export abstract class Tool {
  abstract handleEvent(args: HandleEventArgs): boolean;
}




