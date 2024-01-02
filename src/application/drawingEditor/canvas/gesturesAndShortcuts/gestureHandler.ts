import { type AppState } from '~/application/drawingEditor/mainRoutine';
import { type CanvasEvent, type EventString } from '../toolSystem/tool';
import { Float32Vector2 } from 'matrixgl';
import { find } from '~/application/general/arrayUtils';
import { requires } from '~/application/general/contracts';
import { type PointerPos, type Gesture } from './gestures/gesture';
import PanGesture from './gestures/panGesture';
import RotationGesture from './gestures/rotationGesture';
import ZoomGesture from './gestures/zoomGesture';
import ClearScreenGesture from './gestures/clearScreenGesture';
import OpenSettingsGesture from './gestures/openSettingsGesture';
import EyeDropperGesture from './gestures/EyeDropperGesture';

export default class GestureHandler {
  private pointerPositions: PointerPos[];
  private gestures: Gesture[];

  constructor() {
    this.pointerPositions = [];
    this.gestures = [
      new PanGesture(),
      new RotationGesture(),
      new ZoomGesture(),
      new ClearScreenGesture(),
      new OpenSettingsGesture(),
      new EyeDropperGesture(),
    ];
  }

  handleEvent(event: CanvasEvent, appState: AppState, eventType: EventString) {
    if (!(event instanceof PointerEvent)) return;
    if (event.pointerType != 'touch') return;

    switch (eventType) {
      case 'pointerdown':
        return this.handlePointerDown(event, appState);
      case 'pointerup':
        return this.handlePointerUp(event, appState);
      case 'pointercancel':
        return this.handlePointerUp(event, appState);
      case 'pointerout':
        return this.handlePointerUp(event, appState);
      case 'pointerleave':
        return this.handlePointerUp(event, appState);
      case 'pointermove':
        return this.handlePointerMove(event, appState);
    }
  }

  handlePointerDown(event: PointerEvent, appState: AppState): boolean {
    requires(!this.pointerPositions.some((p) => p.id == event.pointerId));
    this.pointerPositions.push({
      pos: new Float32Vector2(event.clientX, event.clientY),
      id: event.pointerId,
    });

    let dirty = false;
    for (const gesture of this.gestures) {
      dirty = gesture.fingerTapped(this.pointerPositions, appState) || dirty;
    }
    return dirty;
  }

  handlePointerMove(event: PointerEvent, appState: AppState): boolean {
    find(this.pointerPositions, (p) => p.id == event.pointerId).map((p) => {
      p.pos.x = event.clientX;
      p.pos.y = event.clientY;
    });

    let dirty = false;
    for (const gesture of this.gestures) {
      dirty = gesture.fingerMoved(this.pointerPositions, appState) || dirty;
    }
    return dirty;
  }

  handlePointerUp(event: PointerEvent, appState: AppState): boolean {
    const removedIds = [];
    for (let i = 0; i < this.pointerPositions.length; i++) {
      const id = this.pointerPositions[i].id;
      if (event.pointerId == id) {
        this.pointerPositions.splice(i, 1);
        removedIds.push(id);
      }
    }

    let dirty = false;
    for (const gesture of this.gestures) {
      dirty = gesture.fingerReleased(removedIds, appState) || dirty;
    }
    return dirty;
  }
}
