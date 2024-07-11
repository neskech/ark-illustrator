import {
  type PointerPos,
  Gesture,
  areValidPointerIDs,
  areValidPositions,
  getFingerDelta,
} from './gesture';
import { assert } from '~/util/general/contracts';
import { equalsNoOrder } from '~/util/general/arrayUtils';
import { type GestureContext } from './gesture';
import type Camera from '../../../renderer/camera';
import { Vector2 } from 'matrixgl_fork';

const PAN_FACTOR = 1.5;

export default class PanGesture extends Gesture {
  private originPosition1: Vector2;
  private originPosition2: Vector2;
  private pointerId1: number;
  private pointerId2: number;
  private originCameraPos: Vector2;

  constructor() {
    super();
    this.originPosition1 = new Vector2(-1, -1);
    this.originPosition2 = new Vector2(-1, -1);
    this.pointerId1 = -1;
    this.pointerId2 = -1;
    this.originCameraPos = new Vector2(-1, -1);
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

    const originalMid = Vector2.midpoint(this.originPosition1, this.originPosition2);
    const newMid = Vector2.midpoint(positions[0].pos, positions[1].pos);
    const deltaVector = getFingerDelta(newMid, originalMid, context.canvas);
    const newPos = this.originCameraPos.add(
      deltaVector.mult(-PAN_FACTOR * context.camera.getCameraWidth())
    );
    context.camera.setPosition(newPos);
  }

  fingerReleased(_: GestureContext, removedIds: number[]) {
    if ([this.pointerId1, this.pointerId2].some((id) => removedIds.includes(id)))
      this.deInitialize();
    return;
  }

  fingerTapped(): void {
    return;
  }

  private tryInitialize(camera: Camera, positions: PointerPos[]) {
    const isInit = this.isInitialized();

    if (!isInit && positions.length == 2) {
      this.originPosition1 = positions[0].pos;
      this.originPosition2 = positions[1].pos;
      this.pointerId1 = positions[0].id;
      this.pointerId2 = positions[1].id;
      this.originCameraPos = camera.getPosition().xy;
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
    this.originPosition1 = new Vector2(-1, -1);
    this.originPosition2 = new Vector2(-1, -1);
    this.pointerId1 = -1;
    this.pointerId2 = -1;
    this.originCameraPos = new Vector2(-1, -1);
  }

  private isInitialized(): boolean {
    const v1 = areValidPointerIDs(this.pointerId1, this.pointerId2);
    const v2 = areValidPositions(this.originPosition1, this.originPosition2, this.originCameraPos);
    return v1 && v2;
  }
}
