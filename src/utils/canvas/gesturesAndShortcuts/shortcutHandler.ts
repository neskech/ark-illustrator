import { type AppState } from '~/utils/mainRoutine';
import { type CanvasEvent, type EventString } from '../tools/tool';
import { Float32Vector2 } from 'matrixgl';
import { mouseToNormalized, mouseToNormalizedWithEvent } from '../camera';
import { dot, scale } from '~/utils/web/vector';
import EventManager from '~/utils/event/eventManager';
import { None } from '~/utils/func/option';

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
        return this.handleScroll(event as WheelEvent, appState);
      case 'pointerdown':
        return this.handleMouseDown(event as PointerEvent);
      case 'pointerup':
        return this.handleMouseUp(event as PointerEvent);
      case 'pointermove':
        return this.handleMouseMove(event as PointerEvent, appState);
      case 'keydown':
        return this.handleKeyDown(event as KeyboardEvent, appState);
      case 'keyup':
        return this.handleKeyUp(event as KeyboardEvent);
      default:
        return false;
    }
  }

  handleScroll(wheelEvent: WheelEvent, appState: AppState): boolean {
    const scrollAmount = wheelEvent.deltaY * ZOOM_SCALING;
    appState.canvasState.camera.translateZoom(scrollAmount);
    return true;
  }

  handleMouseMove(mouseEvent: PointerEvent, appState: AppState): boolean {
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

    return isCurrPositionValid && (this.isAltKeyDown || this.isMiddleMouseHeldDown > 0);
  }

  handleMouseDown(mouseEvent: PointerEvent): boolean {
    switch (mouseEvent.button) {
      case LEFT_MOUSE:
        this.isLeftMouseHeldDown += 1;
      case MIDDLE_MOUSE:
        this.isMiddleMouseHeldDown += mouseEvent.which == MIDDLE_MOUSE_WHICH ? 1 : 0;
      case RIGHT_MOUSE:
        this.isRightMouseHeldDown += 1;
    }

    return false;
  }

  handleMouseUp(mouseEvent: PointerEvent): boolean {
    switch (mouseEvent.button) {
      case LEFT_MOUSE:
        this.isLeftMouseHeldDown -= 1;
      case MIDDLE_MOUSE:
        this.isMiddleMouseHeldDown -= mouseEvent.which == MIDDLE_MOUSE_WHICH ? 1 : 0;
      case RIGHT_MOUSE:
        this.isRightMouseHeldDown -= 1;
    }

    return false;
  }

  handleKeyDown(keyEvent: KeyboardEvent, appState: AppState): boolean {
    this.isAltKeyDown = keyEvent.key == 'Alt';

    if (keyEvent.key == 'c') {
      EventManager.invokeVoid('clearCanvas');
      return true;
    }

    if (keyEvent.key == 's') {
      EventManager.invokeVoid('openSettings');
      return true;
    }

    if (keyEvent.key == 'i') {
      EventManager.invoke('toggleEyeDropper', {
        canvas: appState.canvasState.canvas,
        canvasFramebuffer: appState.renderer.getCanvasFramebuffer(),
        gl: appState.renderer.getGLHandle(),
        originPosition: None()
      });
    }

    return false;
  }

  handleKeyUp(_: KeyboardEvent): boolean {
    this.isAltKeyDown = false;
    return false;
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
