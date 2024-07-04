import { Float32Vector2 } from 'matrixgl';
import {
  type PointerPos,
  Gesture,
  areValidPointerIDs,
  areValidPositions,
  getFingerDelta,
} from './gesture';
import { add, copy, midpoint, scale } from '~/util/webglWrapper/vector';
import { assert } from '~/util/general/contracts';
import { equalsNoOrder } from '~/util/general/arrayUtils';
import { type GestureContext } from './gesture';
import type Camera from '../../../renderer/camera';

const PAN_FACTOR = 1.5;

export default class PanGesture extends Gesture {
  private originPosition1: Float32Vector2;
  private originPosition2: Float32Vector2;
  private pointerId1: number;
  private pointerId2: number;
  private originCameraPos: Float32Vector2;

  constructor() {
    super();
    this.originPosition1 = new Float32Vector2(-1, -1);
    this.originPosition2 = new Float32Vector2(-1, -1);
    this.pointerId1 = -1;
    this.pointerId2 = -1;
    this.originCameraPos = new Float32Vector2(-1, -1);
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

    const originalMid = midpoint(this.originPosition1, this.originPosition2);
    const newMid = midpoint(positions[0].pos, positions[1].pos);
    const deltaVector = getFingerDelta(newMid, originalMid, context.canvas);
    const newPos = add(
      copy(this.originCameraPos),
      scale(deltaVector, -PAN_FACTOR * context.camera.getCameraWidth())
    );
    context.camera.setPosition(newPos);
  }

  fingerReleased(_: GestureContext, removedIds: number[]) {
    if ([this.pointerId1, this.pointerId2].some((id) => removedIds.includes(id)))
      this.deInitialize();
    return;
  }

  fingerTapped(): void {
      return
  }

  private tryInitialize(camera: Camera, positions: PointerPos[]) {
    const isInit = this.isInitialized();

    if (!isInit && positions.length == 2) {
      this.originPosition1 = copy(positions[0].pos);
      this.originPosition2 = copy(positions[1].pos);
      this.pointerId1 = positions[0].id;
      this.pointerId2 = positions[1].id;
      this.originCameraPos = camera.getPosition();
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
    this.originPosition1 = new Float32Vector2(-1, -1);
    this.originPosition2 = new Float32Vector2(-1, -1);
    this.pointerId1 = -1;
    this.pointerId2 = -1;
    this.originCameraPos = new Float32Vector2(-1, -1);
  }

  private isInitialized(): boolean {
    const v1 = areValidPointerIDs(this.pointerId1, this.pointerId2);
    const v2 = areValidPositions(this.originPosition1, this.originPosition2, this.originCameraPos);
    return v1 && v2;
  }
}
