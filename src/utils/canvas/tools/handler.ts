import { Option } from "~/utils/func/option";
import { GlobalToolSettings } from "./settings";
import { CanvasEvent, HandleEventArgs } from "./tool";

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

export type HandlerArgs = Omit<HandleEventArgs, 'eventString'> & {
  map: ToolMap;
  currentTool: ToolType;
}

export function handleEvent({
  map,
  currentTool,
  event,
  canvasState,
  settings,
  presetNumber,
}: HandleEventArgs): void {
  const tool = map[currentTool];
  const evStr: EventString = event.type as EventString; //TODO: pain point
  const handler = tool[evStr];

  if (handler) tool.dispatchEvent(event, handler, canvasState, globalSettings, presetNumber);
}
