import {
  type BrushConfiguration,
  type BrushConfigType,
} from '~/drawingEditor/Input/toolSystem/settings/brushConfig';
import { unreachable } from '~/util/general/funUtils';
import StampBrushRenderer from './stampBrushRenderer';
import LineBrushRenderer from './lineBrushRenderer';
import { assert } from '~/util/general/contracts';
import { type BrushPoint } from '~/drawingEditor/Input/toolSystem/tools/brushTool/brushTool';
import { type RenderContext } from '../../renderer';
import type AssetManager from '../../util/assetManager';

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
//! TYPE DEFINITIONS
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

export type BrushRendererContext = {
  pointData: BrushPoint[];
} & RenderContext;

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
//! MAIN CLASS
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

export abstract class BrushImplementationRenderer {
  private implType: BrushConfigType;

  constructor(implType: BrushConfigType) {
    this.implType = implType;
    this.assertValidImplType();
  }

  abstract renderBatchedStrokeContinued(context: BrushRendererContext): void;

  abstract renderBatchedStrokeFinished(context: BrushRendererContext): void;

  abstract renderBatchedStrokePartitioned(context: BrushRendererContext): void;

  abstract renderIncrementalStroke(context: BrushRendererContext): void;

  public isOfType(implType: BrushConfigType): boolean {
    return this.implType == implType;
  }

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

  private assertValidImplType() {
    switch (this.implType) {
      case 'stamp':
        assert(this instanceof StampBrushRenderer);
      case 'line':
        assert(this instanceof LineBrushRenderer);
      default:
        return unreachable();
    }
  }
}
