import { type PointerPos, type Gesture, areValidPointerIDs } from './gesture';
import { type AppState } from '~/drawingEditor/drawingEditor/application';
import { distance } from '~/drawingEditor/webgl/vector';
import { assert } from '~/util/general/contracts';
import { equalsNoOrder } from '~/util/general/arrayUtils';

const ZOOM_FACTOR = 1 / 300;

export default class ZoomGesture implements Gesture {
  private pointerId1: number;
  private pointerId2: number;
  private originalDistance: number;
  private originalZoom: number;

  constructor() {
    this.pointerId1 = -1;
    this.pointerId2 = -1;
    this.originalDistance = Infinity;
    this.originalZoom = Infinity;
  }

  fingerMoved(positions: PointerPos[], appState: AppState): boolean {
    if (!this.isInitialized()) {
      this.tryInitialize(positions, appState);
      return false;
    }

    if (!this.isValidInput(positions)) {
      this.deInitialize();
      return false;
    }

    const newDistance = distance(positions[0].pos, positions[1].pos);
    const deltaDistance = this.originalDistance - newDistance;
    appState.canvasState.camera.setZoom(this.originalZoom + deltaDistance * ZOOM_FACTOR);

    return true;
  }

  fingerTapped(_: PointerPos[], __: AppState): boolean {
    return false;
  }

  fingerReleased(removedIds: number[]): boolean {
    if ([this.pointerId1, this.pointerId2].some((id) => removedIds.includes(id)))
      this.deInitialize();
    return false;
  }

  private tryInitialize(positions: PointerPos[], appState: AppState) {
    if (positions.length == 2) {
      this.pointerId1 = positions[0].id;
      this.pointerId2 = positions[1].id;
      this.originalDistance = distance(positions[0].pos, positions[1].pos);
      this.originalZoom = appState.canvasState.camera.getZoomLevel();
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
    this.pointerId1 = -1;
    this.pointerId2 = -1;
    this.originalDistance = Infinity;
    this.originalZoom = Infinity;
  }

  private isInitialized(): boolean {
    const v1 = areValidPointerIDs(this.pointerId1, this.pointerId2);
    const v2 = this.originalDistance != Infinity;
    const v3 = this.originalZoom != Infinity;
    return v1 && v2 && v3;
  }
}
