import { type PointerPos, Gesture, areValidPointerIDs, type GestureContext } from './gesture';
import { assert } from '~/util/general/contracts';
import { equalsNoOrder } from '~/util/general/arrayUtils';
import type Camera from '~/drawingEditor/renderer/camera';
import { Vector2 } from 'matrixgl_fork';

const ROTATION_FACTOR = 1;

export default class RotationGesture extends Gesture {
  private pointerId1: number;
  private pointerId2: number;
  private originalRotation: number;
  private originalCameraRotation: number;

  constructor() {
    super();
    this.pointerId1 = -1;
    this.pointerId2 = -1;
    this.originalRotation = NaN;
    this.originalCameraRotation = NaN;
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

    const newAngle = rad2Deg(Vector2.displacement(positions[0].pos, positions[1].pos).angle());
    const rotation = newAngle - this.originalRotation;
    context.camera.setRotation(this.originalCameraRotation + rotation * ROTATION_FACTOR);
  }

  fingerReleased(_: GestureContext, removedIds: number[]) {
    if ([this.pointerId1, this.pointerId2].some((id) => removedIds.includes(id)))
      this.deInitialize();
  }

  fingerTapped(): void {
    return;
  }

  private tryInitialize(camera: Camera, positions: PointerPos[]) {
    if (positions.length == 2) {
      this.pointerId1 = positions[0].id;
      this.pointerId2 = positions[1].id;
      this.originalRotation = rad2Deg(
        Vector2.displacement(positions[0].pos, positions[1].pos).angle()
      );
      this.originalCameraRotation = camera.getRotation();
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
    this.originalRotation = NaN;
    this.originalCameraRotation = NaN;
  }

  private isInitialized(): boolean {
    const v1 = areValidPointerIDs(this.pointerId1, this.pointerId2);
    const v2 = !Number.isNaN(this.originalRotation);
    const v3 = !Number.isNaN(this.originalCameraRotation);
    return v1 && v2 && v3;
  }
}

function rad2Deg(radians: number): number {
  return radians * (180 / Math.PI);
}
