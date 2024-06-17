import { type CanvasEvent, type EventString } from '../toolSystem/tool';
import { Float32Vector2 } from 'matrixgl';
import { find } from '~/util/general/arrayUtils';
import { requires } from '~/util/general/contracts';
import { type PointerPos, type Gesture } from './gestures/gesture';
import PanGesture from './gestures/panGesture';
import RotationGesture from './gestures/rotationGesture';
import ZoomGesture from './gestures/zoomGesture';
import ClearScreenGesture from './gestures/clearScreenGesture';
import OpenSettingsGesture from './gestures/openSettingsGesture';
import EyeDropperGesture from './gestures/EyeDropperGesture';
import { type AppState } from '../../application';

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
        this.handlePointerDown(event, appState);
        return;
      case 'pointerup':
        this.handlePointerUp(event, appState);
        return;
      case 'pointercancel':
        this.handlePointerUp(event, appState);
        return;
      case 'pointerout':
        this.handlePointerUp(event, appState);
        return;
      case 'pointerleave':
        this.handlePointerUp(event, appState);
        return;
      case 'pointermove':
        this.handlePointerMove(event, appState);
        return;
    }
  }

  handlePointerDown(event: PointerEvent, appState: AppState) {
    requires(!this.pointerPositions.some((p) => p.id == event.pointerId));
    this.pointerPositions.push({
      pos: new Float32Vector2(event.clientX, event.clientY),
      id: event.pointerId,
    });

    for (const gesture of this.gestures) gesture.fingerTapped(this.pointerPositions, appState);
  }

  handlePointerMove(event: PointerEvent, appState: AppState) {
    find(this.pointerPositions, (p) => p.id == event.pointerId).map((p) => {
      p.pos.x = event.clientX;
      p.pos.y = event.clientY;
    });

    for (const gesture of this.gestures) gesture.fingerMoved(this.pointerPositions, appState);
  }

  handlePointerUp(event: PointerEvent, appState: AppState) {
    const removedIds = [];
    for (let i = 0; i < this.pointerPositions.length; i++) {
      const id = this.pointerPositions[i].id;
      if (event.pointerId == id) {
        this.pointerPositions.splice(i, 1);
        removedIds.push(id);
      }
    }

    for (const gesture of this.gestures) gesture.fingerReleased(removedIds, appState);
  }
}
