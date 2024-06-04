import { requires } from '../../../../util/general/contracts';
import { Tool, type HandleEventArgs } from '../tool';
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
//! CLASS DEFINITION
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

const ZOOM_SENSITIVITY = 1.0;

export class Zoom extends Tool {
  constructor() {
    super();
  }

  handleEvent(args: HandleEventArgs): boolean {
    requires(this.areValidRotationSettings());

    const evType = args.eventString;
    const event = args.event as MouseEvent;

    switch (evType) {
      case 'mousemove':
        return this.mouseMovedHandler(args, event);
      case 'mouseup':
        return this.mouseUpHandler(args, event);
      case 'mousedown':
        return this.mouseDownHandler(args, event);
      default:
        return false;
    }
  }

  mouseMovedHandler(args: HandleEventArgs, event: MouseEvent): boolean {
    const { appState: canvasState, settings } = args;
    return false;
  }

  mouseUpHandler(args: HandleEventArgs, event: MouseEvent): boolean {
    const { appState: canvasState, settings } = args;
    return false;
  }

  mouseDownHandler(args: HandleEventArgs, event: MouseEvent): boolean {
    const { appState: canvasState, settings } = args;
    return false;
  }

  areValidRotationSettings(): boolean {
    return 0 <= ZOOM_SENSITIVITY && ZOOM_SENSITIVITY <= 1;
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