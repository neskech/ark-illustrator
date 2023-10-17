import { type PointerPos, type Gesture, areValidPointerIDs } from './gesture';
import { type AppState } from '~/utils/mainRoutine';
import { distanceSquared } from '~/utils/web/vector';
import { assert } from '~/utils/contracts';
import { equals } from '~/utils/func/arrayUtils';

const ZOOM_FACTOR = 1;

export default class ZoomGesture implements Gesture {
  private pointerId1: number;
  private pointerId2: number;
  private originalDistance: number;

  constructor() {
    this.pointerId1 = -1;
    this.pointerId2 = -1;
    this.originalDistance = Infinity;
  }

  fingerMoved(positions: PointerPos[], appState: AppState): boolean {
    if (!this.isInitialized()) {
      this.tryInitialize(positions);
      return false;
    }

    const newDistance = distanceSquared(positions[0].pos, positions[1].pos);
    const deltaDistance = this.originalDistance - newDistance;
    appState.canvasState.camera.setZoom(deltaDistance * ZOOM_FACTOR);

    return true;
  }

  fingerTapped(_: PointerPos[], __: AppState): boolean {
    return false;
  }

  private tryInitialize(positions: PointerPos[]) {
    const isInit = this.isInitialized();

    if (isInit && positions.length == 2) {
      this.pointerId1 = positions[0].id;
      this.pointerId2 = positions[1].id;
      this.originalDistance = distanceSquared(positions[0].pos, positions[1].pos);
      assert(this.isInitialized());
    }

    const samePointerIDs = equals(
      positions.map((p) => p.id),
      [this.pointerId1, this.pointerId2]
    );
    if (isInit && positions.length != 2 && samePointerIDs) this.deInitialize();
  }

  private deInitialize() {
    this.pointerId1 = -1;
    this.pointerId2 = -1;
    this.originalDistance = Infinity;
  }

  private isInitialized(): boolean {
    const v1 = areValidPointerIDs(this.pointerId1, this.pointerId2);
    const v2 = this.originalDistance != Infinity;
    return v1 && v2;
  }
}