import { requires } from '../../contracts';
import { Tool, type HandleEventArgs } from './tool';
import { type BrushSettings } from './settings';
import { type Float32Vector2 } from 'matrixgl';
import { Event } from '../../func/event';
import type Stabilizer from '../utils/stabilizing/stabilizer';
import BoxFilterStabilizer from '../utils/stabilizing/boxFilterStabilizer';

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
//! CLASS DEFINITION
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

export type Point = Float32Vector2

export class Brush extends Tool {
  private isMouseDown: boolean;
  private stabilizer: Stabilizer
  onBrushStrokeEnd: Event<Float32Vector2[]>
  onBrushStrokeContinued: Event<Float32Vector2[]>
  onBrushStrokeEndRaw: Event<Float32Vector2[]>
  onBrushStrokeContinuedRaw: Event<Float32Vector2[]>

  constructor() {
    super();
    this.isMouseDown = false;
    this.stabilizer = new BoxFilterStabilizer()
    this.onBrushStrokeEnd = new Event()
    this.onBrushStrokeContinued = new Event()
    this.onBrushStrokeEndRaw = new Event()
    this.onBrushStrokeContinuedRaw = new Event()
  }

  handleEvent(args: HandleEventArgs): boolean {
    const preset = args.presetNumber.expect('Brush needs preset number');
    requires(this.areValidBrushSettings(args.settings.brushSettings[preset]));

    if (!(args.event instanceof PointerEvent))
      return false

    const evType = args.eventString;
    const event = args.event;

    if (event.pointerType == 'touch')
      return false

    switch (evType) {
      case 'pointerleave':
        return this.mouseLeaveHandler(args);
      case 'pointermove':
        return this.mouseMovedHandler(args, event);
      case 'pointerup':
        return this.mouseUpHandler(args, event);
      case 'pointerdown':
        return this.mouseDownHandler(args, event);
      default:
        return false;
    }
  }

  mouseMovedHandler(args: HandleEventArgs, event: PointerEvent): boolean {
    const { canvasState, settings, presetNumber } = args;
    const brushSettings = settings.brushSettings[presetNumber.unwrapOrDefault(0)]

    const point = canvasState.camera.mouseToWorld(event, canvasState);
    if (this.isMouseDown) { 
      this.stabilizer.addPoint(point);
      this.onBrushStrokeContinued.invoke(this.stabilizer.getProcessedCurve(brushSettings))
      this.onBrushStrokeContinuedRaw.invoke(this.stabilizer.getRawCurve(brushSettings))
    }

    return this.isMouseDown;
  }

  mouseUpHandler(args: HandleEventArgs, __: PointerEvent): boolean {
    const { settings, presetNumber } = args;
    const brushSettings = settings.brushSettings[presetNumber.unwrapOrDefault(0)]

    this.onBrushStrokeEnd.invoke(this.stabilizer.getProcessedCurve(brushSettings))
    this.onBrushStrokeEndRaw.invoke(this.stabilizer.getRawCurve(brushSettings))
    this.stabilizer.reset()

    this.isMouseDown = false;
    return false;
  }

  mouseDownHandler(args: HandleEventArgs, event: PointerEvent): boolean {
    const { canvasState, settings, presetNumber } = args;
    const brushSettings = settings.brushSettings[presetNumber.unwrapOrDefault(0)]

    const point = canvasState.camera.mouseToWorld(event, canvasState);
    if (!this.isMouseDown) {
       this.stabilizer.addPoint(point);
       this.onBrushStrokeContinued.invoke(this.stabilizer.getProcessedCurve(brushSettings))
       this.onBrushStrokeContinuedRaw.invoke(this.stabilizer.getRawCurve(brushSettings))
    }


    this.isMouseDown = true;

    return !this.isMouseDown;
  }

  mouseLeaveHandler(args: HandleEventArgs): boolean {
    const { settings, presetNumber } = args;
    const brushSettings = settings.brushSettings[presetNumber.unwrapOrDefault(0)]
    
    this.onBrushStrokeEnd.invoke(this.stabilizer.getProcessedCurve(brushSettings))
    this.onBrushStrokeEndRaw.invoke(this.stabilizer.getRawCurve(brushSettings))
    this.stabilizer.reset()

    this.isMouseDown = false;
    return false;
  }

  areValidBrushSettings(b: BrushSettings): boolean {
    return 0 <= b.opacity && b.opacity <= 100 && 0 <= b.stabilization && b.stabilization <= 1;
  }

  subscribeToOnBrushStrokeEnd(f: (p: Float32Vector2[]) => void) {
    this.onBrushStrokeEnd.subscribe(f)
  }

  subscribeToOnBrushStrokeContinued(f: (p: Float32Vector2[]) => void) {
    this.onBrushStrokeContinued.subscribe(f)
  }

  subscribeToOnBrushStrokeEndRaw(f: (p: Float32Vector2[]) => void) {
    this.onBrushStrokeEndRaw.subscribe(f)
  }

  subscribeToOnBrushStrokeContinuedRaw(f: (p: Float32Vector2[]) => void) {
    this.onBrushStrokeContinuedRaw.subscribe(f)
  }
}

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
//! HELPERS
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////