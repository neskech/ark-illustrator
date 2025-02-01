import { type RenderContext } from '~/drawingEditor/renderer/renderer';
import type ToolRenderers from '~/drawingEditor/renderer/toolRenderers/toolRendererList';
import { Tool, ToolContext, ToolUpdateContext } from '../tool';
import { clearFramebuffer } from '~/drawingEditor/renderer/util/renderUtils';

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
//! CLASS DEFINITION
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

export class FillTool extends Tool {
  isDown: boolean
  hasClicked: boolean

  constructor() {
    super();
    this.isDown = false
    this.hasClicked = false
  }

  updateAndRender(context: ToolUpdateContext, toolRenderers: ToolRenderers): void {
    if (this.hasClicked) {
      console.log("FUCK")
      this.hasClicked = false
      const tolerance = context.settings.fillSettings.tolerance;
      toolRenderers.getFillToolRenderer().render({ tolerance, ...context });
    }
  }

  protected pointerDown(context: ToolContext, event: PointerEvent): void {
      this.isDown = true
  }

  protected pointerUp(context: ToolContext, event: PointerEvent): void {
      if (this.isDown) {
        this.hasClicked = true
        this.isDown = false
      }
  }
}
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
//! HELPERS
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
