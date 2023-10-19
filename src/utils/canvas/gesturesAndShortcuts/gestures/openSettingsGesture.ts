import { type PointerPos, type Gesture } from './gesture';
import { type AppState } from '~/utils/mainRoutine';
import { assert } from '~/utils/contracts';
import { type Event } from '~/utils/func/event';

const TAP_DELAY_MILLIS = 300;

export default class OpenSettingsGesture implements Gesture {
  private tapCount: number;
  private lastTapTime: number;
  private openSettingsGesture: Event<void>;

  constructor(openSettingsGesture: Event<void>) {
    this.tapCount = -1;
    this.lastTapTime = -1;
    this.openSettingsGesture = openSettingsGesture;
  }

  fingerMoved(_: PointerPos[], __: AppState): boolean {
    return false;
  }

  fingerTapped(positions: PointerPos[], _: AppState): boolean {
    if (!this.isInitialized()) {
      this.deInitialize()
      this.tryInitialize(positions);
    }

    if (!this.isValidInput(positions)) {
      return false;
    }

    const now = new Date().getTime();
    if (now - this.lastTapTime <= TAP_DELAY_MILLIS) {
      this.tapCount += 1;
      if (this.tapCount == 3) {
        this.openSettingsGesture.invoke();
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
    if (positions.length == 3) {
      this.tapCount = 0;
      this.lastTapTime = new Date().getTime();
      assert(this.isInitialized());
    }
  }

  private isValidInput(positions: PointerPos[]): boolean {
    const goodLength = positions.length == 3;
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
