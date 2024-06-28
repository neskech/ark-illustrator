import { type BrushConfiguration } from '~/drawingEditor/Input/toolSystem/settings/brushConfig';
import { type BrushImplementationRenderer, type BrushRendererContext } from './brushImplementationRenderer';
import type AssetManager from '../../util/assetManager';
import BrushRendererFactory from './brushRendererFactory';

export default class BrushToolRenderer {
  private currentRenderer: BrushImplementationRenderer;
  constructor(assetManager: AssetManager, brushConfig: BrushConfiguration) {
    this.currentRenderer = BrushRendererFactory.GetRendererOfAppropiateType(
      assetManager,
      brushConfig
    );
  }

  renderBatchedStrokeContinued(
    context: BrushRendererContext,
    brushConfig: BrushConfiguration
  ): void {
    this.currentRenderer = this.getAppropiateRenderer(context.assetManager, brushConfig);
    this.currentRenderer.renderBatchedStrokeContinued(context);
  }

  renderBatchedStrokeFinished(
    context: BrushRendererContext,
    brushConfig: BrushConfiguration
  ): void {
    this.currentRenderer = this.getAppropiateRenderer(context.assetManager, brushConfig);
    this.currentRenderer.renderBatchedStrokeFinished(context);
  }

  renderBatchedStrokePartitioned(
    context: BrushRendererContext,
    brushConfig: BrushConfiguration
  ): void {
    this.currentRenderer = this.getAppropiateRenderer(context.assetManager, brushConfig);
    this.currentRenderer.renderBatchedStrokePartitioned(context);
  }

  renderIncrementalStroke(context: BrushRendererContext, brushConfig: BrushConfiguration): void {
    this.currentRenderer = this.getAppropiateRenderer(context.assetManager, brushConfig);
    this.currentRenderer.renderIncrementalStroke(context);
  }

  private getAppropiateRenderer(
    assetManager: AssetManager,
    brushConfig: BrushConfiguration
  ): BrushImplementationRenderer {
    if (this.currentRenderer.isOfType(brushConfig.type)) return this.currentRenderer;
    return (this.currentRenderer = BrushRendererFactory.GetRendererOfAppropiateType(
      assetManager,
      brushConfig
    ));
  }
}
