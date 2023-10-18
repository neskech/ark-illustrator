import { Float32Vector2 } from 'matrixgl';
import { type AppState } from '~/utils/mainRoutine';
import { mouseToNormalized } from '../../camera';

export interface PointerPos {
  pos: Float32Vector2;
  id: number;
}

export interface Gesture {
  fingerMoved: (positions: PointerPos[], appState: AppState) => boolean;
  fingerTapped: (positions: PointerPos[], appState: AppState) => boolean;
  fingerReleased: () => boolean
}

export function isValidPosition(pos: Float32Vector2): boolean {
  return pos.x != -1 && pos.y != -1;
}

export function areValidPositions(...positions: Float32Vector2[]): boolean {
  return positions.every(isValidPosition);
}

export function isValidPointerID(id: number): boolean {
  return id != -1;
}

export function areValidPointerIDs(...ids: number[]): boolean {
  return ids.every(isValidPointerID);
}

export function getFingerDelta(
  a: Float32Vector2,
  b: Float32Vector2,
  appState: AppState
): Float32Vector2 {
  const aNorm = mouseToNormalized(a, appState.canvasState);
  const bNorm = mouseToNormalized(b, appState.canvasState);

  const deltaX = aNorm.x - bNorm.x;
  const deltaY = aNorm.y - bNorm.y;

  return new Float32Vector2(deltaX, deltaY);
}
