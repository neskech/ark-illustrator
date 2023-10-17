import { Float32Vector2 } from 'matrixgl';
import {
  type PointerPos,
  type Gesture,
  areValidPointerIDs,
  areValidPositions,
  getFingerDelta,
} from './gesture';
import { type AppState } from '~/utils/mainRoutine';
import { add, copy, midpoint, scale } from '~/utils/web/vector';
import { assert } from '~/utils/contracts';
import { equalsNoOrder } from '~/utils/func/arrayUtils';

const PAN_FACTOR = 1;

export default class PanGesture implements Gesture {
  private originPosition1: Float32Vector2;
  private originPosition2: Float32Vector2;
  private pointerId1: number;
  private pointerId2: number;
  private originCameraPos: Float32Vector2;

  constructor() {
    this.originPosition1 = new Float32Vector2(-1, -1);
    this.originPosition2 = new Float32Vector2(-1, -1);
    this.pointerId1 = -1;
    this.pointerId2 = -1;
    this.originCameraPos = new Float32Vector2(-1, -1);
  }

  fingerMoved(positions: PointerPos[], appState: AppState): boolean {
    if (!this.isInitialized()) {
      this.tryInitialize(positions, appState);
      return false;
    }

    const originalMid = midpoint(this.originPosition1, this.originPosition2);
    const newMid = midpoint(positions[0].pos, positions[1].pos);
    const deltaVector = getFingerDelta(newMid, originalMid, appState);
    const newPos = add(copy(this.originCameraPos), scale(deltaVector, PAN_FACTOR));
    appState.canvasState.camera.setPosition(newPos);

    return true;
  }

  fingerTapped(_: PointerPos[], __: AppState): boolean {
    return false;
  }

  private tryInitialize(positions: PointerPos[], appState: AppState) {
    const isInit = this.isInitialized();

    console.log('init status:', isInit, positions)

    if (isInit && positions.length == 2) {
      this.originPosition1 = copy(positions[0].pos);
      this.originPosition2 = copy(positions[1].pos);
      this.pointerId1 = positions[0].id;
      this.pointerId2 = positions[1].id;
      this.originCameraPos = appState.canvasState.camera.getPosition();
      console.log("IM IN BABYYYYYYYYYY!!!!!!!!!!!!!!!")
      assert(this.isInitialized());
    }

    const samePointerIDs = equalsNoOrder(
      positions.map((p) => p.id),
      [this.pointerId1, this.pointerId2]
    );
    if (isInit && positions.length != 2 && samePointerIDs) this.deInitialize();
  }

  private deInitialize() {
    console.log("OH NOO!!!!!")
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
