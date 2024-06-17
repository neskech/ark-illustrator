import { type PointerPos, type Gesture } from './gesture';
import { type AppState } from '../../../application';
import { assert } from '~/util/general/contracts';
import EventManager from '~/util/eventSystem/eventManager';

const TAP_DELAY_MILLIS = 300;

export default class ClearScreenGesture implements Gesture {
  private tapCount: number;
  private lastTapTime: number;

  constructor() {
    this.tapCount = -1;
    this.lastTapTime = -1;
  }

  fingerMoved(_: PointerPos[], __: AppState) {
    return;
  }

  fingerTapped(positions: PointerPos[], _: AppState) {
    if (!this.isInitialized()) {
      this.deInitialize();
      this.tryInitialize(positions);
    }

    if (positions.length > 2) {
      this.deInitialize();
      return;
    }

    if (!this.isValidInput(positions)) {
      return;
    }

    const now = new Date().getTime();
    if (now - this.lastTapTime <= TAP_DELAY_MILLIS) {
      this.tapCount += 1;
      if (this.tapCount == 3) {
        EventManager.invokeVoid('clearCanvas');
        this.tapCount = 0;
      }
      this.lastTapTime = now;
    }
  }

  fingerReleased() {
    return;
  }

  private tryInitialize(positions: PointerPos[]) {
    if (positions.length == 2) {
      this.tapCount = 0;
      this.lastTapTime = new Date().getTime();
      assert(this.isInitialized());
    }
  }

  private isValidInput(positions: PointerPos[]): boolean {
    const goodLength = positions.length == 2;
    return goodLength;
  }

  private deInitialize() {
    this.tapCount = -1;
    this.lastTapTime = -1;
  }

  private isInitialized(): boolean {
    const v1 = this.tapCount != -1;
    const now = new Date().getTime();
    const delta = now - this.lastTapTime;
    const v2 = this.lastTapTime != -1 && delta < TAP_DELAY_MILLIS;
    return v1 && v2;
  }
}
