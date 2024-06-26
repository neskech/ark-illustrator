/* eslint-disable @typescript-eslint/no-unused-vars */
import { type AllToolSettings } from './settings';
import { type CircleTool } from './tools/circleTool';
import { type RectangleTool } from './tools/rectangleTool';
import { type HandTool } from './tools/handTool';
import { type FillTool } from './tools/fillTool';
import { type BrushTool } from './tools/brushTool/brushTool';
import type ToolRenderers from '~/drawingEditor/renderer/toolRenderers/toolRendererList';
import { type RenderContext } from '~/drawingEditor/renderer/renderer';
import type Camera from '~/drawingEditor/renderer/camera';
import EventHandler from './eventHandler';

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
//! TOOL MAP
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

export type ToolMap = {
  brush: BrushTool;
  fillBucket: FillTool;
  hand: HandTool;
  square: RectangleTool;
  circle: CircleTool;
};

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
//! TYPE DEFINITIONS
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

export type EventTypeName = keyof GlobalEventHandlersEventMap;
export type CanvasEvent = GlobalEventHandlersEventMap[EventTypeName];

export type ToolType = keyof ToolMap;

export type ToolContext = {
  camera: Camera;
  settings: AllToolSettings;
  eventType: EventTypeName;
  canvas: HTMLCanvasElement;
};

export type ToolUpdateContext = {
  camera: Camera;
  settings: AllToolSettings;
  canvas: HTMLCanvasElement;
};

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
//! MAIN TOOL CLASS
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

export abstract class Tool extends EventHandler<ToolContext> {
  abstract update(context: ToolUpdateContext, deltaTime: number): void;
  abstract acceptRenderer(renderers: ToolRenderers, renderContext: RenderContext): void;
}
