import { type EventTypeName } from '../toolSystem/tool';
import EventManager from '~/util/eventSystem/eventManager';
import { None } from '~/util/general/option';
import Camera from '~/drawingEditor/renderer/camera';
import type LayerManager from '~/drawingEditor/canvas/layerManager';
import { EventHandler } from '../toolSystem/eventHandler';
import { Vector2 } from 'matrixgl_fork';

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
//! CONSTANTS
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

const LEFT_MOUSE = 0;
const RIGHT_MOUSE = 2;
const MIDDLE_MOUSE = 1;

const MIDDLE_MOUSE_WHICH = 2;

const PAN_SCALING = 1.0;
const ROTATION_SCALING = 100.0;
const ZOOM_SCALING = 0.005;

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
//! TYPE DEFINITIONS
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

export type ShortcutContext = {
  camera: Camera;
  canvas: HTMLCanvasElement;
  layerManager: LayerManager;
  eventType: EventTypeName;
};
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
//! MAIN CLASS
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

export default class ShortcutHandler extends EventHandler<ShortcutContext> {
  private isMiddleMouseHeldDown: number;
  private isRightMouseHeldDown: number;
  private isLeftMouseHeldDown: number;
  private isAltKeyDown: boolean;
  private mousePosition: Vector2;

  constructor() {
    super();
    this.isMiddleMouseHeldDown = 0;
    this.isRightMouseHeldDown = 0;
    this.isLeftMouseHeldDown = 0;
    this.isAltKeyDown = false;
    this.mousePosition = new Vector2(-1, -1);
  }

  wheel(context: ShortcutContext, wheelEvent: WheelEvent): void {
    const scrollAmount = wheelEvent.deltaY * ZOOM_SCALING;
    context.camera.translateZoom(scrollAmount);
  }

  pointerMove(context: ShortcutContext, mouseEvent: MouseEvent): void {
    const isCurrPositionValid = isValidMousePos(this.mousePosition);

    if (isCurrPositionValid && this.isMiddleMouseHeldDown > 0) {
      let delta = getMouseDeltaFromEvent(this.mousePosition, mouseEvent, context.canvas);
      delta = delta.mult(-PAN_SCALING * context.camera.getCameraWidth());
      context.camera.translatePosition(delta);
    } else if (isCurrPositionValid && this.isAltKeyDown) {
      const delta = getMouseDeltaFromEvent(this.mousePosition, mouseEvent, context.canvas);

      const xAlignment = delta.dotProductWith(new Vector2(1, 0));
      const yAlignment = delta.dotProductWith(new Vector2(0, 1));

      const rotation_factor = (xAlignment + yAlignment) * ROTATION_SCALING;
      context.camera.translateRotation(rotation_factor);
    }

    this.mousePosition.x = mouseEvent.clientX;
    this.mousePosition.y = mouseEvent.clientY;
  }

  pointerDown(_: ShortcutContext, mouseEvent: MouseEvent): void {
    switch (mouseEvent.button) {
      case LEFT_MOUSE:
        this.isLeftMouseHeldDown += 1;
      case MIDDLE_MOUSE:
        this.isMiddleMouseHeldDown += mouseEvent.which == MIDDLE_MOUSE_WHICH ? 1 : 0;
      case RIGHT_MOUSE:
        this.isRightMouseHeldDown += 1;
    }
  }

  pointerUp(_: ShortcutContext, mouseEvent: MouseEvent): void {
    switch (mouseEvent.button) {
      case LEFT_MOUSE:
        this.isLeftMouseHeldDown -= 1;
      case MIDDLE_MOUSE:
        this.isMiddleMouseHeldDown -= mouseEvent.which == MIDDLE_MOUSE_WHICH ? 1 : 0;
      case RIGHT_MOUSE:
        this.isRightMouseHeldDown -= 1;
    }
  }

  keyDown(context: ShortcutContext, keyEvent: KeyboardEvent): void {
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
        canvas: context.canvas,
        canvasFramebuffer: context.layerManager.getCanvasFramebufferForMutation(),
        originPosition: None<Vector2>(),
      });
    }

    if (keyEvent.key == 'z' && keyEvent.ctrlKey) EventManager.invokeVoid('undo');
  }

  keyUp(): void {
    this.isAltKeyDown = false;
  }
}

function isValidMousePos(pos: Vector2): boolean {
  return pos.x != -1 && pos.y != -1;
}

function getMouseDeltaFromEvent(
  mouse: Vector2,
  event: MouseEvent,
  canvas: HTMLCanvasElement
): Vector2 {
  const normCurrPos = Camera.mouseToNormalized(mouse, canvas);
  const normEventPos = Camera.mouseToNormalizedWithEvent(event as PointerEvent, canvas);

  const deltaX = normEventPos.x - normCurrPos.x;
  const deltaY = normEventPos.y - normCurrPos.y;

  return new Vector2(deltaX, deltaY);
}
