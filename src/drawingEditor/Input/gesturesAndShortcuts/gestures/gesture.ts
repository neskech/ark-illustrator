import { Float32Vector2 } from 'matrixgl';
import Camera from '~/drawingEditor/renderer/camera';
import { type EventTypeName } from '../../toolSystem/tool';
import type LayerManager from '~/drawingEditor/canvas/layerManager';

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
//! TYPE DEFINITIONS
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

export type GestureContext = {
  eventType: EventTypeName;
  camera: Camera;
  canvas: HTMLCanvasElement;
  layerManager: LayerManager;
};

export interface PointerPos {
  pos: Float32Vector2;
  id: number;
}

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
//! MAIN CLASS
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

export abstract class Gesture {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  abstract fingerMoved(context: GestureContext, positions: PointerPos[]): void;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  abstract fingerTapped(context: GestureContext, positions: PointerPos[]): void;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  abstract fingerReleased(context: GestureContext, removedIds: number[]): void;
}

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
//! EXPORTED HELPERS
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

export function isValidPosition(pos: Float32Vector2): boolean {
  return pos.x != -1 && pos.y != -1;
}

export function areValidPositions(...positions: Float32Vector2[]): boolean {
  return positions.every(isValidPosition);
}

export function isValidPositionsList(positions: Float32Vector2[]): boolean {
  return positions.every(isValidPosition);
}

export function isValidPointerID(id: number): boolean {
  return id != -1;
}

export function areValidPointerIDs(...ids: number[]): boolean {
  return ids.every(isValidPointerID);
}

export function isValidPointerIDList(...ids: number[]): boolean {
  return ids.every(isValidPointerID);
}

export function getFingerDelta(
  a: Float32Vector2,
  b: Float32Vector2,
  canvas: HTMLCanvasElement
): Float32Vector2 {
  const aNorm = Camera.mouseToNormalized(a, canvas);
  const bNorm = Camera.mouseToNormalized(b, canvas);

  const deltaX = aNorm.x - bNorm.x;
  const deltaY = aNorm.y - bNorm.y;

  return new Float32Vector2(deltaX, deltaY);
}
