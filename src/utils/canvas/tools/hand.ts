import { requires } from '../../contracts';
import { Tool, type HandleEventArgs } from './tool';
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
//! CLASS DEFINITION
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

const HAND_SENSITIVITY = 1.0;

export class Hand extends Tool {
  constructor() {
    super();
  }

  handleEvent(args: HandleEventArgs): boolean {
    requires(this.areValidHandSettings());

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
    const { appState: canvasState, settings, presetNumber } = args;
    return false;
  }

  mouseUpHandler(args: HandleEventArgs, event: MouseEvent): boolean {
    const { appState: canvasState, settings, presetNumber } = args;
    return false;
  }

  mouseDownHandler(args: HandleEventArgs, event: MouseEvent): boolean {
    const { appState: canvasState, settings, presetNumber } = args;
    return false;
  }

  areValidHandSettings(): boolean {
    return 0 <= HAND_SENSITIVITY && HAND_SENSITIVITY <= 1;
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
