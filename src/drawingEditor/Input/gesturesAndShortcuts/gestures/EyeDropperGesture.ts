import EventManager from '~/util/eventSystem/eventManager';
import { None, Some, type Option } from '~/util/general/option';
import { type AppState } from '../../../application';
import { type Gesture, type PointerPos } from './gesture';

const EYEDROPPER_DELAY_MILLIS = 500;

export default class EyeDropperGesture implements Gesture {
  private downPointerId: Option<number>;

  constructor() {
    this.downPointerId = None();
  }

  fingerMoved(_: PointerPos[], __: AppState) {
    return;
  }

  fingerTapped(positions: PointerPos[], appState: AppState) {
    if (!this.isInitialized()) {
      this.deInitialize();
      this.tryInitialize(positions);
    }

    if (!this.isValidInput(positions)) {
      this.deInitialize();
      return;
    }

    this.downPointerId = Some(positions[0].id);
    setTimeout(() => {
      if (this.downPointerId.isNone()) return;
      EventManager.invoke('toggleEyeDropper', {
        canvas: appState.canvasState.canvas,
        canvasFramebuffer: appState.renderer.getCanvasFramebuffer(),
        gl: appState.renderer.getGLHandle(),
        originPosition: Some(positions[0].pos),
      });
    }, EYEDROPPER_DELAY_MILLIS);

    return true;
  }

  fingerReleased(removedFingers: number[], _: AppState) {
    const contained = removedFingers.some(
      (p) => this.downPointerId.isSome() && this.downPointerId.unwrap() == p
    );

    if (contained) this.downPointerId = None();
  }

  private tryInitialize(_: PointerPos[]) {
    this.downPointerId = None();
  }

  private isValidInput(positions: PointerPos[]): boolean {
    if (positions.length < 1) return false;

    const goodLength = positions.length == 1;
    const sameId = this.downPointerId.isNone() || this.downPointerId.unwrap() == positions[0].id;
    return goodLength && sameId;
  }

  private deInitialize() {
    this.downPointerId = None();
  }

  private isInitialized(): boolean {
    return true;
  }
}
