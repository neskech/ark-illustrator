import { type Option } from "~/utils/func/option";
import { type CanvasState } from "../canvas";
import { createBrush, type Brush } from "./brush";
import { type GlobalToolSettings } from './settings';

type EventString = keyof HTMLElementEventMap;
export type CanvasEventHandler<Settings> = (
  e: CanvasEvent,
  state: CanvasState,
  settings?: Settings,
  canvasX?: number,
  canvasY?: number
) => void;

export type CanvasEvent = HTMLElementEventMap[EventString];

export type EventDispatcher<S> = (
  e: CanvasEvent,
  evFn: CanvasEventHandler<S>,
  state: CanvasState,
  settings: GlobalToolSettings,
  presetNumber: Option<number>
) => void;

type Tool_<Settings> = {
  [key in EventString]?: CanvasEventHandler<Settings>;
};

export interface Tool<S> extends Tool_<S> {
  dispatchEvent: EventDispatcher<S>;
}

export type ToolMap = {
  brush: Brush;
};

export type ToolType = keyof ToolMap;

export interface ToolState {
    tools: ToolMap,
    currentTool: ToolType
}

export function getDefaultToolState(): ToolState {
    return {
        tools: {
            brush: createBrush()
        },
        currentTool: 'brush'
    }
}

export interface HandleEventArgs {
  map: ToolMap;
  currentTool: ToolType;
  canvasState: CanvasState;
  event: CanvasEvent;
  globalSettings: GlobalToolSettings;
  presetNumber: Option<number>;
}

export function handleEvent({
  map,
  currentTool,
  event,
  canvasState,
  globalSettings,
  presetNumber,
}: HandleEventArgs): void {
  const tool = map[currentTool];
  const evStr: EventString = event.type as EventString; //TODO: pain point
  const handler = tool[evStr];

  if (handler) tool.dispatchEvent(event, handler, canvasState, globalSettings, presetNumber);
}
