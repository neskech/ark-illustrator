import { type AppState } from '~/drawingEditor/application';
import { type CanvasEvent, type EventString } from '../toolSystem/tool';
import { Float32Vector2 } from 'matrixgl';
import { mouseToNormalized, mouseToNormalizedWithEvent } from '../camera';
import { dot, scale } from '~/util/webglWrapper/vector';
import EventManager from '~/util/eventSystem/eventManager';
import { None } from '~/util/general/option';

const LEFT_MOUSE = 0;
const RIGHT_MOUSE = 2;
const MIDDLE_MOUSE = 1;

const MIDDLE_MOUSE_WHICH = 2;

const PAN_SCALING = 1.0;
const ROTATION_SCALING = 100.0;
const ZOOM_SCALING = 0.005;

export default class ShortcutHandler {
  private isMiddleMouseHeldDown: number;
  private isRightMouseHeldDown: number;
  private isLeftMouseHeldDown: number;
  private isAltKeyDown: boolean;
  private mousePosition: Float32Vector2;

  constructor() {
    this.isMiddleMouseHeldDown = 0;
    this.isRightMouseHeldDown = 0;
    this.isLeftMouseHeldDown = 0;
    this.isAltKeyDown = false;
    this.mousePosition = new Float32Vector2(-1, -1);
  }

  handleEvent(event: CanvasEvent, appState: AppState, eventType: EventString) {
    switch (eventType) {
      case 'wheel':
        this.handleScroll(event as WheelEvent, appState);
        return;
      case 'pointerdown':
        this.handleMouseDown(event as PointerEvent);
        return;
      case 'pointerup':
        this.handleMouseUp(event as PointerEvent);
        return;
      case 'pointermove':
        this.handleMouseMove(event as PointerEvent, appState);
        return;
      case 'keydown':
        this.handleKeyDown(event as KeyboardEvent, appState);
        return;
      case 'keyup':
        this.handleKeyUp(event as KeyboardEvent);
        return;
    }
  }

  handleScroll(wheelEvent: WheelEvent, appState: AppState) {
    const scrollAmount = wheelEvent.deltaY * ZOOM_SCALING;
    appState.canvasState.camera.translateZoom(scrollAmount);
  }

  handleMouseMove(mouseEvent: PointerEvent, appState: AppState) {
    const isCurrPositionValid = isValidMousePos(this.mousePosition);

    if (isCurrPositionValid && this.isMiddleMouseHeldDown > 0) {
      const delta = getMouseDeltaFromEvent(this.mousePosition, mouseEvent, appState);
      scale(delta, -PAN_SCALING * appState.canvasState.camera.getCameraWidth());
      appState.canvasState.camera.translatePosition(delta);
    } else if (isCurrPositionValid && this.isAltKeyDown) {
      const delta = getMouseDeltaFromEvent(this.mousePosition, mouseEvent, appState);

      const xAlignment = dot(new Float32Vector2(1, 0), delta);
      const yAlignment = dot(new Float32Vector2(0, 1), delta);

      const rotation_factor = (xAlignment + yAlignment) * ROTATION_SCALING;
      appState.canvasState.camera.translateRotation(rotation_factor);
    }

    this.mousePosition.x = mouseEvent.clientX;
    this.mousePosition.y = mouseEvent.clientY;
  }

  handleMouseDown(mouseEvent: PointerEvent) {
    switch (mouseEvent.button) {
      case LEFT_MOUSE:
        this.isLeftMouseHeldDown += 1;
      case MIDDLE_MOUSE:
        this.isMiddleMouseHeldDown += mouseEvent.which == MIDDLE_MOUSE_WHICH ? 1 : 0;
      case RIGHT_MOUSE:
        this.isRightMouseHeldDown += 1;
    }
  }

  handleMouseUp(mouseEvent: PointerEvent) {
    switch (mouseEvent.button) {
      case LEFT_MOUSE:
        this.isLeftMouseHeldDown -= 1;
      case MIDDLE_MOUSE:
        this.isMiddleMouseHeldDown -= mouseEvent.which == MIDDLE_MOUSE_WHICH ? 1 : 0;
      case RIGHT_MOUSE:
        this.isRightMouseHeldDown -= 1;
    }
  }

  handleKeyDown(keyEvent: KeyboardEvent, appState: AppState) {
    this.isAltKeyDown = keyEvent.key == 'Alt';

    if (keyEvent.key == 'c') {
      EventManager.invokeVoid('clearCanvas');
      return;
    }

    if (keyEvent.key == 's') {
      EventManager.invokeVoid('openSettings');
      return;
    }

    if (keyEvent.key == 'i') {
      EventManager.invoke('toggleEyeDropper', {
        canvas: appState.canvasState.canvas,
        canvasFramebuffer: appState.renderer.getCanvasFramebuffer(),
        gl: appState.renderer.getGLHandle(),
        originPosition: None(),
      });
    }
  }

  handleKeyUp(_: KeyboardEvent) {
    this.isAltKeyDown = false;
  }
}

function isValidMousePos(pos: Float32Vector2): boolean {
  return pos.x != -1 && pos.y != -1;
}

function getMouseDeltaFromEvent(
  mouse: Float32Vector2,
  event: MouseEvent,
  appState: AppState
): Float32Vector2 {
  const normCurrPos = mouseToNormalized(mouse, appState.canvasState.canvas);
  const normEventPos = mouseToNormalizedWithEvent(event, appState.canvasState.canvas);

  const deltaX = normEventPos.x - normCurrPos.x;
  const deltaY = normEventPos.y - normCurrPos.y;

  return new Float32Vector2(deltaX, deltaY);
}
