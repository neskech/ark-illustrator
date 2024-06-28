import { type BrushConfiguration } from '~/drawingEditor/Input/toolSystem/settings/brushConfig';
import type AssetManager from '../../util/assetManager';
import { type BrushImplementationRenderer } from './brushImplementationRenderer';
import StampBrushRenderer from './stampBrushRenderer';
import LineBrushRenderer from './lineBrushRenderer';
import { unreachable } from '~/util/general/funUtils';

export default class BrushRendererFactory {
  public static GetRendererOfAppropiateType(
    assetManager: AssetManager,
    brushConfig: BrushConfiguration
  ): BrushImplementationRenderer {
    switch (brushConfig.type) {
      case 'stamp':
        return new StampBrushRenderer(assetManager, brushConfig.brushSettings);
      case 'line':
        return new LineBrushRenderer(assetManager, brushConfig.brushSettings);
      default:
        return unreachable();
    }
  }
}
