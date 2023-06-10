import { Brush } from './brush';
import { type EventString, type HandleEventArgs } from './tool';

export type ToolMap = {
  brush: Brush;
};
export type ToolType = keyof ToolMap;

export interface ToolState {
  tools: ToolMap;
  currentTool: ToolType;
}

export function getDefaultToolState(): ToolState {
  return {
    tools: {
      brush: new Brush(),
    },
    currentTool: 'brush',
  };
}

export type HandlerArgs = Omit<HandleEventArgs, 'eventString'> & {
  map: ToolMap;
  currentTool: ToolType;
};

export function handleEvent({
  map,
  currentTool,
  event,
  canvasState,
  settings,
  presetNumber,
}: HandlerArgs): void {
  const tool = map[currentTool];
  const evStr: EventString = event.type as EventString; //TODO: pain point
  
  tool.handleEvent({
    event,
    canvasState,
    eventString: evStr,
    settings,
    presetNumber,
  });
}
