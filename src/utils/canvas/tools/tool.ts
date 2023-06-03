import { type CanvasState } from "../canvas";
import { type Brush } from "./brush";

type EventString = keyof HTMLElementEventMap
export type CanvasEventHandler = (e: CanvasEvent, state: CanvasState, canvasX?: number, canvasY?: number) => void;
export type CanvasEvent = HTMLElementEventMap[EventString]
export type EventDispatcher = (e: CanvasEvent, evFn: CanvasEventHandler, state: CanvasState) => void
 
type Tool_ = {
    [key in EventString]?: CanvasEventHandler;
};

export interface Tool extends Tool_ {
    dispatchEvent: EventDispatcher
}

type ToolMap = {
    brush: Brush
}
type ToolType = keyof ToolMap

export function handleEvent(map: ToolMap, currentTool: ToolType, event: CanvasEvent, state: CanvasState): void {
    const tool = map[currentTool];
    const evStr: EventString = event.type as EventString; //TODO: pain point
    const handler = tool[evStr];

    if (handler)
        tool.dispatchEvent(event, handler, state);
}