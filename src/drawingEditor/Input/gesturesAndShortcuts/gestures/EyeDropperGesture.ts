import EventManager from '~/util/eventSystem/eventManager';
import { None, Some, type Option } from '~/util/general/option';
import { type GestureContext, Gesture, type PointerPos } from './gesture';

const EYEDROPPER_DELAY_MILLIS = 500;

export default class EyeDropperGesture extends Gesture {
  private downPointerId: Option<number>;

  constructor() {
    super();
    this.downPointerId = None();
  }

  fingerTapped(context: GestureContext, positions: PointerPos[]) {
    if (!this.isInitialized()) {
      this.deInitialize();
      this.tryInitialize();
    }

    if (!this.isValidInput(positions)) {
      this.deInitialize();
      return;
    }

    this.downPointerId = Some(positions[0].id);
    setTimeout(() => {
      if (this.downPointerId.isNone()) return;
      EventManager.invoke('toggleEyeDropper', {
        canvas: context.canvas,
        canvasFramebuffer: context.layerManager.getCanvasFramebufferForMutation(),
        originPosition: Some(positions[0].pos),
      });
    }, EYEDROPPER_DELAY_MILLIS);

    return true;
  }

  fingerReleased(_: GestureContext, removedFingers: number[]) {
    const contained = removedFingers.some(
      (p) => this.downPointerId.isSome() && this.downPointerId.unwrap() == p
    );

    if (contained) this.downPointerId = None();
  }

  fingerMoved(): void {
      return
  }

  private tryInitialize() {
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
