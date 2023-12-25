import { assert } from '~/utils/contracts';
import EventManager from '~/utils/event/eventManager';
import { noOp } from '~/utils/func/funUtils';
import { None, Some, type Option } from '~/utils/func/option';
import { type AppState } from '~/utils/mainRoutine';
import { type Gesture, type PointerPos } from './gesture';

const EYEDROPPER_DELAY_MILLIS = 300;

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

    if (positions.length > 1) {
      this.deInitialize();
      return false;
    }

    if (!this.isValidInput(positions)) {
      return false;
    }

    this.downPointerId = Some(positions[0].id);
    setTimeout(() => {
      if (this.downPointerId.isNone()) return;
      EventManager.invoke('toggleEyeDropper', {
        canvas: appState.canvasState.canvas,
        canvasFramebuffer: appState.renderer.getCanvasFramebuffer(),
        gl: appState.renderer.getGLHandle(),
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
    if (positions.length == 1) {
      assert(this.isInitialized());
    }
  }

  private isValidInput(positions: PointerPos[]): boolean {
    const goodLength = positions.length == 1;
    return goodLength;
  }

  private deInitialize() {
    noOp();
  }

  private isInitialized(): boolean {
    return true;
  }
}
