
import { type AllToolSettings } from '../../settings';
import { Tool, type ToolUpdateContext, type ToolContext } from '../../tool';
import type ToolRenderers from '~/drawingEditor/renderer/toolRenderers/toolRendererList';
import { type BrushConfiguration } from '../../settings/brushConfig';
import { type Stabilizer } from './stabilizing/stabilizer';
import { MAX_POINTS_PER_FRAME } from '~/drawingEditor/renderer/toolRenderers/brush/stampBrushRenderer';
import StabilizerFactory from './stabilizing/stabilizerFactory';
import { type Vector2 } from 'matrixgl_fork';

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
//! CONSTANTS
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
//! TYPE DEFINITIONS & HELPERS
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

export interface BrushPoint {
  position: Vector2;
  pressure: number;
}

export const newPoint = (pos: Vector2, pressure: number): BrushPoint => ({
  position: pos,
  pressure,
});

type StrokeState = 'notDrawing' | 'drawing' | 'finished';

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
//! CLASS DEFINITION
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

export class BrushTool extends Tool {
  private stabilizer: Stabilizer;
  private strokeState: StrokeState;

  constructor(settings: AllToolSettings) {
    super();

    const config = settings.brushConfigurations.getCurrentPreset();
    this.stabilizer = StabilizerFactory.getStabilizerOfAppropiateType(
      config.stabilizerSettings,
      config.brushSettings
    );

    this.strokeState = 'notDrawing';
  }

  updateAndRender(context: ToolUpdateContext, toolRenderers: ToolRenderers): void {
    if (this.strokeState == 'notDrawing') return;

    this.stabilizer.update(
      context.deltaTime,
      context.settings.brushConfigurations.getCurrentPreset().brushSettings
    );

    const brushConfig = context.settings.brushConfigurations.getCurrentPreset();
    const renderer = toolRenderers.getBrushToolRenderer();

    if (this.strokeState == 'finished') {
      this.strokeState = 'notDrawing';

      if (this.stabilizer.isBatchedStabilizer()) {
        const size = this.stabilizer.predictSizeOfOutput();

        if (size > MAX_POINTS_PER_FRAME) {
          const partition = this.stabilizer.partitionStroke(
            brushConfig.brushSettings,
            MAX_POINTS_PER_FRAME
          );
          renderer.renderBatchedStrokePartitioned(
            { pointData: partition, ...context },
            brushConfig
          );
        }

        const points = this.stabilizer.getProcessedCurve(brushConfig.brushSettings);
        renderer.renderBatchedStrokeFinished({ pointData: points, ...context }, brushConfig);
      } else {
        const points = this.stabilizer.getProcessedCurve(brushConfig.brushSettings);
        renderer.renderIncrementalStroke({ pointData: points, ...context }, brushConfig);
      }

      this.stabilizer.reset();
      return;
    }

    if (this.stabilizer.isBatchedStabilizer()) {
      const size = this.stabilizer.predictSizeOfOutput();

      if (size > MAX_POINTS_PER_FRAME) {
        const points = this.stabilizer.partitionStroke(
          brushConfig.brushSettings,
          MAX_POINTS_PER_FRAME
        );
        renderer.renderBatchedStrokePartitioned({ pointData: points, ...context }, brushConfig);
      } else {
        const points = this.stabilizer.getProcessedCurve(brushConfig.brushSettings);
        renderer.renderBatchedStrokeContinued({ pointData: points, ...context }, brushConfig);
      }
    } else {
      const points = this.stabilizer.getProcessedCurve(brushConfig.brushSettings);
      renderer.renderIncrementalStroke({ pointData: points, ...context }, brushConfig);
    }
  }

  pointerMove(context: ToolContext, event: PointerEvent): void {
    if (event.pointerType == 'touch') return;
    if (this.strokeState != 'drawing') return;

    const config = context.settings.brushConfigurations.getCurrentPreset();
    this.setAppropiateStabilizer(config);

    const point = context.camera.mouseToWorldByEvent(event, context.canvas);
    const brushPoint = newPoint(point, event.pressure);
    this.stabilizer.addPoint(brushPoint, config.brushSettings);
  }

  pointerUp(context: ToolContext, event: PointerEvent): void {
    if (event.pointerType == 'touch') return;
    if (this.strokeState != 'drawing') return;

    if (event.pointerType == 'mouse') {
      const button = context.inputState.mouseButtonToString(event.button);
      if (button == 'middle' || button == 'right') return;
    }

    const config = context.settings.brushConfigurations.getCurrentPreset();
    this.setAppropiateStabilizer(config);

    this.strokeState = 'finished';
  }

  pointerDown(context: ToolContext, event: PointerEvent): void {
    if (event.pointerType == 'touch') return;
    if (this.strokeState != 'notDrawing') return;

    if (event.pointerType == 'mouse') {
      const button = context.inputState.mouseButtonToString(event.button);
      if (button == 'middle' || button == 'right') return;
    }

    const config = context.settings.brushConfigurations.getCurrentPreset();
    this.setAppropiateStabilizer(config);

    const point = context.camera.mouseToWorldByEvent(event, context.canvas);
    const brushPoint = newPoint(point, event.pressure);
    this.stabilizer.addPoint(
      brushPoint,
      context.settings.brushConfigurations.getCurrentPreset().brushSettings
    );

    this.strokeState = 'drawing';
    context.layerManager.registerMutation(context.utilityRenderers.getOverlayRenderer());
  }

  private setAppropiateStabilizer(brushConfig: BrushConfiguration) {
    if (this.stabilizer.isOfType(brushConfig.stabilizerSettings.type)) return;

    this.stabilizer = StabilizerFactory.getStabilizerOfAppropiateType(
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
