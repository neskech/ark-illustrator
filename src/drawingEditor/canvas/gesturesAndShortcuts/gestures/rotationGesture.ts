import { type PointerPos, type Gesture, areValidPointerIDs } from './gesture';
import { type AppState } from '../../../application';
import { angle } from '~/drawingEditor/webgl/vector';
import { assert } from '~/util/general/contracts';
import { displacement } from '../../../webgl/vector';
import { equalsNoOrder } from '~/util/general/arrayUtils';

const ROTATION_FACTOR = 1;

export default class RotationGesture implements Gesture {
  private pointerId1: number;
  private pointerId2: number;
  private originalRotation: number;
  private originalCameraRotation: number;

  constructor() {
    this.pointerId1 = -1;
    this.pointerId2 = -1;
    this.originalRotation = NaN;
    this.originalCameraRotation = NaN;
  }

  fingerMoved(positions: PointerPos[], appState: AppState){
    if (!this.isInitialized()) {
      this.tryInitialize(positions, appState);
      return
    }

    if (!this.isValidInput(positions)) {
      this.deInitialize();
      return
    }

    const newAngle = rad2Deg(angle(displacement(positions[0].pos, positions[1].pos)));
    const rotation = newAngle - this.originalRotation;
    appState.canvasState.camera.setRotation(
      this.originalCameraRotation + rotation * ROTATION_FACTOR
    );

  }

  fingerReleased(removedIds: number[]) {
    if ([this.pointerId1, this.pointerId2].some((id) => removedIds.includes(id)))
      this.deInitialize();
  }

  fingerTapped(_: PointerPos[], __: AppState) {
    return
  }

  private tryInitialize(positions: PointerPos[], appState: AppState) {
    if (positions.length == 2) {
      this.pointerId1 = positions[0].id;
      this.pointerId2 = positions[1].id;
      this.originalRotation = rad2Deg(angle(displacement(positions[0].pos, positions[1].pos)));
      this.originalCameraRotation = appState.canvasState.camera.getRotation();
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
