import { type PointerPos, type Gesture } from './gesture';
import { type AppState } from '~/utils/mainRoutine';
import { assert } from '~/utils/contracts';
import EventManager from '~/utils/event/eventManager';

const TAP_DELAY_MILLIS = 300;

export default class OpenSettingsGesture implements Gesture {
  private tapCount: number;
  private lastTapTime: number;

  constructor() {
    this.tapCount = -1;
    this.lastTapTime = -1;
  }

  fingerMoved(_: PointerPos[], __: AppState): boolean {
    return false;
  }

  fingerTapped(positions: PointerPos[], _: AppState): boolean {
    if (!this.isInitialized()) {
      this.deInitialize()
      this.tryInitialize(positions);
    }

    if (positions.length > 4) {
        this.deInitialize()
        return false
      }

    if (!this.isValidInput(positions)) {
      return false;
    }

    const now = new Date().getTime();
    if (now - this.lastTapTime <= TAP_DELAY_MILLIS) {
      this.tapCount += 1;
      if (this.tapCount == 2) {
        EventManager.invokeVoid('openSettings')
        this.tapCount = 0;
      }
      this.lastTapTime = now;
    }

    return true;
  }

  fingerReleased(): boolean {
    return false;
  }

  private tryInitialize(positions: PointerPos[]) {
    if (positions.length == 4) {
      this.tapCount = 0;
      this.lastTapTime = new Date().getTime();
      assert(this.isInitialized());
    }
  }

  private isValidInput(positions: PointerPos[]): boolean {
    const goodLength = positions.length == 4;
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
