import { Float32Vector2 } from 'matrixgl';
import { find } from '~/util/general/arrayUtils';
import { requires } from '~/util/general/contracts';
import { type PointerPos, type Gesture, type GestureContext } from './gestures/gesture';
import PanGesture from './gestures/panGesture';
import RotationGesture from './gestures/rotationGesture';
import ZoomGesture from './gestures/zoomGesture';
import ClearScreenGesture from './gestures/clearScreenGesture';
import OpenSettingsGesture from './gestures/openSettingsGesture';
import EyeDropperGesture from './gestures/EyeDropperGesture';
import { EventHandler } from '../toolSystem/eventHandler';

export default class GestureHandler extends EventHandler<GestureContext> {
  private pointerPositions: PointerPos[];
  private gestures: Gesture[];

  constructor() {
    super();
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

  pointerDown(context: GestureContext, event: PointerEvent): void {
    if (event.pointerType != 'touch') return;
    requires(!this.pointerPositions.some((p) => p.id == event.pointerId));

    this.pointerPositions.push({
      pos: new Float32Vector2(event.clientX, event.clientY),
      id: event.pointerId,
    });

    for (const gesture of this.gestures) gesture.fingerTapped(context, this.pointerPositions);
  }

  pointerMove(context: GestureContext, event: PointerEvent): void {
    if (event.pointerType != 'touch') return;

    find(this.pointerPositions, (p) => p.id == event.pointerId).map((p) => {
      p.pos.x = event.clientX;
      p.pos.y = event.clientY;
    });

    for (const gesture of this.gestures) gesture.fingerMoved(context, this.pointerPositions);
  }

  pointerUp(context: GestureContext, event: PointerEvent): void {
    if (event.pointerType != 'touch') return;

    const removedIds = [];
    for (let i = 0; i < this.pointerPositions.length; i++) {
      const id = this.pointerPositions[i].id;
      if (event.pointerId == id) {
        this.pointerPositions.splice(i, 1);
        removedIds.push(id);
      }
    }

    for (const gesture of this.gestures) gesture.fingerReleased(context, removedIds);
  }
}
