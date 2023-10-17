import { type AppState } from '~/utils/mainRoutine';
import { type CanvasEvent, type EventString } from '../tools/tool';
import { Float32Vector2 } from 'matrixgl';
import { find } from '~/utils/func/arrayUtils';
import { requires } from '~/utils/contracts';
import { type PointerPos, type Gesture } from './gestures/gesture';
import PanGesture from './gestures/panGesture';
import RotationGesture from './gestures/rotationGesture';
import ZoomGesture from './gestures/zoomGesture';
import { Event } from '~/utils/func/event';
import ClearScreenGesture from './gestures/clearScreenGesture';

export default class GestureHandler {
  private pointerPositions: PointerPos[];
  private gestures: Gesture[];
  private onScreenClearGesture: Event<void>

  constructor() {
    this.pointerPositions = [];
    this.onScreenClearGesture = new Event()
    this.gestures = [new PanGesture(), new RotationGesture(), new ZoomGesture(), new ClearScreenGesture(this.onScreenClearGesture)];
  }

  handleEvent(event: CanvasEvent, appState: AppState, eventType: EventString) {
    if (!(event instanceof PointerEvent)) return;

    switch (eventType) {
      case 'pointerdown':
        return this.handlePointerDown(event, appState);
      case 'pointerup':
        return this.handlePointerUp(event);
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

    let dirty = false
    for (const gesture of this.gestures) {
      dirty = gesture.fingerTapped(this.pointerPositions, appState) || dirty;
    }
    return dirty
  }

  handlePointerMove(event: PointerEvent, appState: AppState): boolean {
    find(this.pointerPositions, (p) => p.id == event.pointerId).map((p) => {
      p.pos.x = event.clientX;
      p.pos.y = event.clientY;
    });

    let dirty = false
    for (const gesture of this.gestures) {
      dirty = gesture.fingerMoved(this.pointerPositions, appState) || dirty;
    }
    return dirty
  }

  handlePointerUp(event: PointerEvent): boolean {
    for (let i = 0; i < this.pointerPositions.length; i++) {
      const id = this.pointerPositions[i].id;
      if (event.pointerId == id) {
        this.pointerPositions.splice(i, 1);
        return false;
      }
    }

    return false;
  }

  subscribeToOnScreenClearGesture(f: () => void, hasPriority = false) {
    this.onScreenClearGesture.subscribe(f, hasPriority)
  }
}
