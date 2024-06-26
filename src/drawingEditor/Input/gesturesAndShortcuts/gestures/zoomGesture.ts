import { type PointerPos, Gesture, areValidPointerIDs, type GestureContext } from './gesture';
import { distance } from '~/util/webglWrapper/vector';
import { assert } from '~/util/general/contracts';
import { equalsNoOrder } from '~/util/general/arrayUtils';
import type Camera from '~/drawingEditor/renderer/camera';

const ZOOM_FACTOR = 1 / 300;

export default class ZoomGesture extends Gesture {
  private pointerId1: number;
  private pointerId2: number;
  private originalDistance: number;
  private originalZoom: number;

  constructor() {
    super();
    this.pointerId1 = -1;
    this.pointerId2 = -1;
    this.originalDistance = Infinity;
    this.originalZoom = Infinity;
  }

  fingerMoved(context: GestureContext, positions: PointerPos[]) {
    if (!this.isInitialized()) {
      this.tryInitialize(context.camera, positions);
      return;
    }

    if (!this.isValidInput(positions)) {
      this.deInitialize();
      return;
    }

    const newDistance = distance(positions[0].pos, positions[1].pos);
    const deltaDistance = this.originalDistance - newDistance;
    context.camera.setZoom(this.originalZoom + deltaDistance * ZOOM_FACTOR);
  }

  fingerTapped() {
    return;
  }

  fingerReleased(_: GestureContext, removedIds: number[]) {
    if ([this.pointerId1, this.pointerId2].some((id) => removedIds.includes(id)))
      this.deInitialize();
  }

  private tryInitialize(camera: Camera, positions: PointerPos[]) {
    if (positions.length == 2) {
      this.pointerId1 = positions[0].id;
      this.pointerId2 = positions[1].id;
      this.originalDistance = distance(positions[0].pos, positions[1].pos);
      this.originalZoom = camera.getZoomLevel();
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
