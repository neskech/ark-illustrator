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
import type InputState from './inputState';
import { EventHandler } from './eventHandler';
import LayerManager from '~/drawingEditor/canvas/layerManager';

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

export type ToolTypeName = keyof ToolMap;

export type ToolContext = {
  inputState: InputState;
  camera: Camera;
  settings: AllToolSettings;
  eventType: EventTypeName;
  layerManager: LayerManager;
  canvas: HTMLCanvasElement;
};

export type ToolUpdateContext = {
  deltaTime: number;
  inputState: InputState;
  settings: AllToolSettings;
  canvas: HTMLCanvasElement;
} & RenderContext;

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
//! MAIN TOOL CLASS
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

export abstract class Tool extends EventHandler<ToolContext> {
  abstract updateAndRender(context: ToolUpdateContext, toolRenderers: ToolRenderers): void;
}
