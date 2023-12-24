import { requires } from '../../contracts';
import { Tool, type HandleEventArgs } from './tool';
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
//! CLASS DEFINITION
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

export class Circle extends Tool {
  constructor() {
    super();
  }

  handleEvent(args: HandleEventArgs): boolean {
    requires(this.areValidCircleSettings());

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

  areValidCircleSettings(): boolean {
    return true;
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
