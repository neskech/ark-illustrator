import { type AppState } from '~/utils/mainRoutine';
import { type CanvasEvent, type EventString } from '../tools/tool';
import { Float32Vector2 } from 'matrixgl';
import { find } from '~/utils/func/arrayUtils';
import { requires } from '~/utils/contracts';
import { type PointerPos, type Gesture } from './gestures/gesture';
import PanGesture from './gestures/panGesture';
import RotationGesture from './gestures/rotationGesture';
import ZoomGesture from './gestures/zoomGesture';

export default class GestureHandler {
  private pointerPositions: PointerPos[];
  private gestures: Gesture[];

  constructor() {
    this.pointerPositions = [];
    this.gestures = [new PanGesture(), new RotationGesture(), new ZoomGesture()];
  }

  handleEvent(event: CanvasEvent, appState: AppState, eventType: EventString) {
    if (!(event instanceof PointerEvent)) return;

    switch (eventType) {
      case 'pointerdown':
        this.handlePointerDown(event, appState);
      case 'pointerup':
        this.handlePointerUp(event);
      case 'pointermove':
        this.handlePointerMove(event, appState);
    }
  }

  handlePointerDown(event: PointerEvent, appState: AppState) {
    requires(!this.pointerPositions.some((p) => p.id == event.pointerId));
    console.log('down', event.pointerId)
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

  handlePointerUp(event: PointerEvent) {
    console.log('up', event.pointerId)
    for (let i = 0; i < this.pointerPositions.length; i++) {
      const id = this.pointerPositions[i].id;
      if (event.pointerId == id) {
        this.pointerPositions.splice(i, 1);
        return;
      }
    }
  }
}
