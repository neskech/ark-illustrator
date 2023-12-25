import { assert } from '~/utils/contracts';
import EventManager from '~/utils/event/eventManager';
import { noOp } from '~/utils/func/funUtils';
import { None, Some, type Option } from '~/utils/func/option';
import { type AppState } from '~/utils/mainRoutine';
import { type Gesture, type PointerPos } from './gesture';

const EYEDROPPER_DELAY_MILLIS = 500;

export default class EyeDropperGesture implements Gesture {
  private downPointerId: Option<number>;

  constructor() {
    this.downPointerId = None();
  }

  fingerMoved(_: PointerPos[], __: AppState): boolean {
    return false;
  }

  fingerTapped(positions: PointerPos[], appState: AppState): boolean {
    if (!this.isInitialized()) {
      this.deInitialize();
      this.tryInitialize(positions);
    }

    if (!this.isValidInput(positions)) {
      this.deInitialize();
      return false;
    }

    this.downPointerId = Some(positions[0].id);
    setTimeout(() => {
      if (this.downPointerId.isNone()) return;
      EventManager.invoke('toggleEyeDropper', {
        canvas: appState.canvasState.canvas,
        canvasFramebuffer: appState.renderer.getCanvasFramebuffer(),
        gl: appState.renderer.getGLHandle(),
        originPosition: Some(positions[0].pos)
      });
    }, EYEDROPPER_DELAY_MILLIS);

    return true;
  }

  fingerReleased(removedFingers: number[], _: AppState): boolean {
    const contained = removedFingers.some(
      (p) => this.downPointerId.isSome() && this.downPointerId.unwrap() == p
    );

    if (contained) {
      this.downPointerId = None();
      return true;
    }

    return false;
  }

  private tryInitialize(positions: PointerPos[]) {
     this.downPointerId = None()
  }

  private isValidInput(positions: PointerPos[]): boolean {
    if (positions.length < 1) return false;

    const goodLength = positions.length == 1;
    const sameId = this.downPointerId.isNone() || this.downPointerId.unwrap() == positions[0].id
    return goodLength && sameId;
  }

  private deInitialize() {
    this.downPointerId = None()
  }

  private isInitialized(): boolean {
    return true;
  }
}
