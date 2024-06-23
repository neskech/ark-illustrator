import { requires } from '../../../../util/general/contracts';
import { Tool, type HandleEventArgs } from '../tool';
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
//! CLASS DEFINITION
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

export class CircleTool extends Tool {
  constructor() {
    super();
  }

  handleEvent(args: HandleEventArgs) {
    requires(this.areValidCircleSettings());

    const evType = args.eventString;
    const event = args.event as MouseEvent;

    switch (evType) {
      case 'mousemove':
        this.mouseMovedHandler(args, event);
        return;
      case 'mouseup':
        this.mouseUpHandler(args, event);
        return;
      case 'mousedown':
        this.mouseDownHandler(args, event);
        return;
    }
  }

  update(deltaTime: number): void {
    throw new Error('Method not implemented.');
  }

  private mouseMovedHandler(args: HandleEventArgs, event: MouseEvent) {
    const { appState: canvasState, settings } = args;
  }

  private mouseUpHandler(args: HandleEventArgs, event: MouseEvent) {
    const { appState: canvasState, settings } = args;
  }

  private mouseDownHandler(args: HandleEventArgs, event: MouseEvent) {
    const { appState: canvasState, settings } = args;
  }

  private areValidCircleSettings(): boolean {
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