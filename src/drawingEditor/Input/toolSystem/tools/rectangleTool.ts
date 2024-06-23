import { type Float32Vector2 } from 'matrixgl';
import { assertNotNull } from '../../../../util/general/contracts';
import { Tool, type HandleEventArgs } from '../tool';
import EventManager from '~/util/eventSystem/eventManager';

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

export class RectangleTool extends Tool {
  private isDrawingRectangle: boolean;
  private anchorPosition: Float32Vector2 | null;

  constructor() {
    super();
    this.isDrawingRectangle = false;
    this.anchorPosition = null;
  }

  handleEvent(args: HandleEventArgs) {
    if (!(args.event instanceof PointerEvent)) return;

    const evType = args.eventString;
    const event = args.event;

    if (event.pointerType == 'mouse' && event.button == MIDDLE_MOUSE) return;

    switch (evType) {
      case 'pointermove':
        this.pointerMovedHandler(args, event);
        return;
      case 'pointerup':
        this.pointerUpHandler(args, event);
        return;
      case 'pointerdown':
        this.pointerDownHandler(args, event);
        return;
      case 'pointerleave':
        this.pointerLeaveHandler();
        return;
    }
  }

  update(_: number): void {
    return;
  }

  private pointerMovedHandler(args: HandleEventArgs, event: MouseEvent) {
    if (!this.isDrawingRectangle) return;

    assertNotNull(this.anchorPosition);

    const point = args.appState.canvasState.camera.mouseToWorld(
      event,
      args.appState.canvasState.canvas
    );

    EventManager.invoke('rectangleContinued', {
      anchorPosition: this.anchorPosition,
      otherPosition: point,
    });
  }

  pointerUpHandler(args: HandleEventArgs, event: MouseEvent) {
    if (!this.isDrawingRectangle) return;

    assertNotNull(this.anchorPosition);

    const point = args.appState.canvasState.camera.mouseToWorld(
      event,
      args.appState.canvasState.canvas
    );

    EventManager.invoke('rectangleFinished', {
      anchorPosition: this.anchorPosition,
      otherPosition: point,
    });
    this.isDrawingRectangle = false;
  }

  private pointerDownHandler(args: HandleEventArgs, event: MouseEvent) {
    if (this.isDrawingRectangle) return;

    const point = args.appState.canvasState.camera.mouseToWorld(
      event,
      args.appState.canvasState.canvas
    );
    this.anchorPosition = point;

    EventManager.invoke('rectangleContinued', {
      anchorPosition: this.anchorPosition,
      otherPosition: point,
    });
    this.isDrawingRectangle = true;
  }

  private pointerLeaveHandler() {
    if (!this.isDrawingRectangle) return;

    EventManager.invokeVoid('rectangleCanceled');
    this.isDrawingRectangle = false;
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
