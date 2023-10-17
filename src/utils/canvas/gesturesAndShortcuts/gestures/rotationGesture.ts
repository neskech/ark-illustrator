import { type PointerPos, type Gesture, areValidPointerIDs, areValidPositions } from './gesture';
import { type AppState } from '~/utils/mainRoutine';
import { angle } from '~/utils/web/vector';
import { assert } from '~/utils/contracts';
import { displacement } from '../../../web/vector';
import { equalsNoOrder } from '~/utils/func/arrayUtils';

const ROTATION_FACTOR = 1;

export default class RotationGesture implements Gesture {
  private pointerId1: number;
  private pointerId2: number;
  private originalRotation: number;

  constructor() {
    this.pointerId1 = -1;
    this.pointerId2 = -1;
    this.originalRotation = Infinity;
  }

  fingerMoved(positions: PointerPos[], appState: AppState): boolean {
    if (!this.isInitialized()) {
      this.tryInitialize(positions);
      return false;
    }

    if (!this.isValidInput(positions)) {
        this.deInitialize()
        return false
    }

    const newAngle = angle(displacement(positions[0].pos, positions[1].pos));
    const rotation = rad2Deg(this.originalRotation - newAngle);
    console.log("WE GOT EM HERE BABY!!!!!", newAngle, rotation, rotation * ROTATION_FACTOR)
    appState.canvasState.camera.setRotation(rotation * ROTATION_FACTOR);

    return true;
  }

  fingerTapped(_: PointerPos[], __: AppState): boolean {
    return false;
  }

  private tryInitialize(positions: PointerPos[]) {
    const isInit = this.isInitialized();

    if (!isInit && this.isValidInput(positions)) {
      this.pointerId1 = positions[0].id;
      this.pointerId2 = positions[1].id;
      this.originalRotation = angle(displacement(positions[0].pos, positions[1].pos));
      console.log("IM IN BABBY!!!!!", this.originalRotation)
      assert(this.isInitialized());
    }
  }

  private isValidInput(positions: PointerPos[]): boolean {
    const validPositions = areValidPositions(...positions.map(p => p.pos))
    const validPointerIDs = areValidPointerIDs(...positions.map(p => p.id))
    const samePointerIDs = equalsNoOrder(
        positions.map((p) => p.id),
        [this.pointerId1, this.pointerId2]
    );
    const goodLength = positions.length == 2
    return validPositions && validPointerIDs && samePointerIDs && goodLength
  }


  private deInitialize() {
    this.pointerId1 = -1;
    this.pointerId2 = -1;
    this.originalRotation = Infinity;
  }

  private isInitialized(): boolean {
    const v1 = areValidPointerIDs(this.pointerId1, this.pointerId2);
    const v2 = this.originalRotation != Infinity;
    return v1 && v2;
  }
}

function rad2Deg(radians: number): number {
  return radians * (180 / Math.PI);
}
