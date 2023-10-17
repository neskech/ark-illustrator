import { type PointerPos, type Gesture, areValidPointerIDs } from './gesture';
import { type AppState } from '~/utils/mainRoutine';
import { assert } from '~/utils/contracts';
import { equalsNoOrder } from '~/utils/func/arrayUtils';
import { type Event } from '~/utils/func/event';

const TAP_DELAY_MILLIS = 200

export default class ClearScreenGesture implements Gesture {
  private tapCount: number
  private lastTapTime: number
  private pointerId1: number;
  private pointerId2: number;
  private onScreenClearGesture: Event<void>

  constructor(onScreenClearGesture: Event<void>) {
    this.tapCount = -1
    this.lastTapTime = -1
    this.pointerId1 = -1;
    this.pointerId2 = -1;
    this.onScreenClearGesture = onScreenClearGesture
  }

  fingerMoved(_: PointerPos[], __: AppState): boolean {
    return false;
  }

  fingerTapped(positions: PointerPos[], _: AppState): boolean {
    if (!this.isInitialized()) {
      this.tryInitialize(positions);
      return false;
    }

    if (!this.isValidInput(positions)) {
      this.deInitialize();
      return false;
    }

    const now = new Date().getTime()
    if (now - this.lastTapTime <= TAP_DELAY_MILLIS) {
        this.tapCount += 1
        if (this.tapCount == 2) {
            this.onScreenClearGesture.invoke()
            this.tapCount = 0
        }
        this.lastTapTime = now
    }

    return true;
  }

  private tryInitialize(positions: PointerPos[]) {
    if (positions.length == 2) {
      this.pointerId1 = positions[0].id;
      this.pointerId2 = positions[1].id;
      this.tapCount = -1
      this.lastTapTime = new Date().getTime()
      assert(this.isInitialized());
    }
  }

  private isValidInput(positions: PointerPos[]): boolean {
    const samePointerIDs = equalsNoOrder(
      positions.map((p) => p.id),
      [this.pointerId1, this.pointerId2]
    );
    const goodLength = positions.length == 2;
    return samePointerIDs && goodLength;
  }

  private deInitialize() {
    this.tapCount = -1
    this.pointerId1 = -1;
    this.pointerId2 = -1;
    this.lastTapTime = -1
  }

  private isInitialized(): boolean {
    const v1 = areValidPointerIDs(this.pointerId1, this.pointerId2);
    const v2 = this.tapCount != -1
    const v3 = this.lastTapTime != -1
    return v1 && v2 && v3;
  }
}
