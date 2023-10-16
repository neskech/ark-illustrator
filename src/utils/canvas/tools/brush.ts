import { requires } from '../../contracts';
import { Tool, type HandleEventArgs } from './tool';
import { type Float32Vector2 } from 'matrixgl';
import { Event } from '../../func/event';
import type Stabilizer from '../utils/stabilizing/stabilizer';
import BoxFilterStabilizer from '../utils/stabilizing/boxFilterStabilizer';
import { type BezierFunction, getLinearBezier } from '~/utils/misc/bezierFunction';
import BoxFilterStabilizer2 from '../utils/stabilizing/boxFilterStabillizer2';

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
//! BRUSH SETTINGS
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

export interface BrushSettings {
  size: number;
  opacity: number;
  stabilization: number;
  spacing: 'auto' | number;
  minSize: number,
  maxSize: number
  pressureSettings: BezierFunction;
}

export function defaultBrushSettings(): BrushSettings {
  return {
      size: 0.008,
      opacity: 1.0,
      stabilization: 0.5,
      spacing: 0.01,
      minSize: 0.05,
      maxSize: 1.0,
      pressureSettings: getLinearBezier()
  }
} 

export function getSizeGivenPressure(settings: Readonly<BrushSettings>, pressure: number): number {
  const min = settings.size * settings.minSize
  const max = settings.size * settings.maxSize
  const range = max - min
  return range * pressure + min
}

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
//! CLASS DEFINITION
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

export interface BrushPoint {
  position: Float32Vector2
  pressure: number
}

export const newPoint = (pos: Float32Vector2, pressure: number): BrushPoint => ({
  position: pos,
  pressure
})

export class Brush extends Tool {
  private isMouseDown: boolean;
  private stabilizer: Stabilizer
  onBrushStrokeEnd: Event<BrushPoint[]>
  onBrushStrokeContinued: Event<BrushPoint[]>
  onBrushStrokeEndRaw: Event<BrushPoint[]>
  onBrushStrokeContinuedRaw: Event<BrushPoint[]>

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
    const brushPoint = newPoint(point, brushSettings.pressureSettings.sampleY(event.pressure))
    if (this.isMouseDown) { 
      this.stabilizer.addPoint(brushPoint);
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
    const brushPoint = newPoint(point, brushSettings.pressureSettings.sampleY(event.pressure))
    if (!this.isMouseDown) {
       this.stabilizer.addPoint(brushPoint);
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

  subscribeToOnBrushStrokeEnd(f: (p: BrushPoint[]) => void) {
    this.onBrushStrokeEnd.subscribe(f)
  }

  subscribeToOnBrushStrokeContinued(f: (p: BrushPoint[]) => void) {
    this.onBrushStrokeContinued.subscribe(f)
  }

  subscribeToOnBrushStrokeEndRaw(f: (p: BrushPoint[]) => void) {
    this.onBrushStrokeEndRaw.subscribe(f)
  }

  subscribeToOnBrushStrokeContinuedRaw(f: (p: BrushPoint[]) => void) {
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