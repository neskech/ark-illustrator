import { type Float32Vector2 } from 'matrixgl';
import { type AllToolSettings } from '../../settings';
import { Tool, type ToolContext } from '../../tool';
import { Stabilizer } from './stabilizing/stabilizer';
import { type RenderContext } from '~/drawingEditor/renderer/renderer';
import type ToolRenderers from '~/drawingEditor/renderer/toolRenderers/toolRendererList';
import { type BrushConfiguration } from '../../settings/brushConfig';

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
//! CONSTANTS
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

const MIDDLE_MOUSE = 1;

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
//! CLASS DEFINITION
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

export interface BrushPoint {
  position: Float32Vector2;
  pressure: number;
}

export const newPoint = (pos: Float32Vector2, pressure: number): BrushPoint => ({
  position: pos,
  pressure,
});

export class BrushTool extends Tool {
  private isPointerDown: boolean;
  private stabilizer: Stabilizer;

  constructor(settings: AllToolSettings) {
    super();
    this.isPointerDown = false;
    const config = settings.brushConfigurations.getCurrentPreset();
    this.stabilizer = Stabilizer.getStabilizerOfAppropiateType(
      config.stabilizerSettings,
      config.brushSettings
    );
  }

  update(context: ToolContext, deltaTime: number): void {
    const config = context.settings.brushConfigurations.getCurrentPreset();
    this.setAppropiateStabilizer(config);

    this.stabilizer.update(
      deltaTime,
      context.settings.brushConfigurations.getCurrentPreset().brushSettings
    );
  }

  acceptRenderer(renderers: ToolRenderers, renderContext: RenderContext): void {
    throw new Error('Method not implemented.');
  }

  pointerMove(context: ToolContext, event: PointerEvent): void {
    const config = context.settings.brushConfigurations.getCurrentPreset();
    this.setAppropiateStabilizer(config);

    const point = context.camera.mouseToWorld(event, context.canvas);
    const brushPoint = newPoint(point, event.pressure);
    if (this.isPointerDown) {
      this.stabilizer.addPoint(brushPoint, config.brushSettings);
    }
  }

  pointerUp(context: ToolContext, event: PointerEvent): void {
    const config = context.settings.brushConfigurations.getCurrentPreset();
    this.setAppropiateStabilizer(config);

    this.stabilizer.reset();
    this.isPointerDown = false;
  }

  pointerDown(context: ToolContext, event: PointerEvent): void {
    const config = context.settings.brushConfigurations.getCurrentPreset();
    this.setAppropiateStabilizer(config);

    const point = context.camera.mouseToWorld(event, context.canvas);
    const brushPoint = newPoint(point, event.pressure);

    if (!this.isPointerDown) {
      this.stabilizer.addPoint(
        brushPoint,
        context.settings.brushConfigurations.getCurrentPreset().brushSettings
      );
    }

    this.isPointerDown = true;
  }

  pointerLeave(context: ToolContext, event: PointerEvent): void {
    const config = context.settings.brushConfigurations.getCurrentPreset();
    this.setAppropiateStabilizer(config);

    this.stabilizer.reset();
    this.isPointerDown = false;
  }

  private setAppropiateStabilizer(brushConfig: BrushConfiguration) {
    if (this.stabilizer.isOfType(brushConfig.stabilizerSettings.type)) return;

    this.stabilizer = Stabilizer.getStabilizerOfAppropiateType(
      brushConfig.stabilizerSettings,
      brushConfig.brushSettings
    );
  }
}

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
//! HELPERS
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
