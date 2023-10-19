import { requires } from '../../contracts';
import { Tool, type HandleEventArgs } from './tool';
import { type Float32Vector2 } from 'matrixgl';
import { Event } from '../../func/event';
import type Stabilizer from '../utils/stabilizing/stabilizer';
import BoxFilterStabilizer from '../utils/stabilizing/boxFilterStabilizer';
import { type BezierFunction, getLinearBezier } from '~/utils/misc/bezierFunction';
import { type GlobalToolSettings } from './settings';
import Texture from '~/utils/web/texture';
import { type GL } from '~/utils/web/glUtils';
import { type Option } from '~/utils/func/option';
import { Some } from '../../func/option';

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
//! CONSTANTS
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

const MIDDLE_MOUSE = 1

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
  minSize: number;
  maxSize: number;
  minOpacity: number;
  maxOpacity: number;
  flow: number;
  stabilization: number;
  spacing: 'auto' | number;
  pressureSizeSettings: BezierFunction;
  pressureOpacitySettings: BezierFunction;
  texture: Option<Texture>;
}

export function defaultBrushSettings(gl: GL): BrushSettings {
  const brushTexture = new Texture(gl, {
    wrapX: 'Repeat',
    wrapY: 'Repeat',
    magFilter: 'Linear',
    minFilter: 'Linear',
    format: 'RGBA',
  });
  brushTexture.allocateFromImageUrl(
    gl,
    'https://cdn.discordapp.com/attachments/627737740078743576/1163574991271493722/solid-circle-png-thumb16.png?ex=654012a8&is=652d9da8&hm=8ac2701699f2763a665a4c35b8603834684ad74ee7876243294352b7abe28e6c&',
    false
  );

  return {
    size: 0.08,
    opacity: 1.0,
    minSize: 0.3,
    maxSize: 1.0,
    minOpacity: 0.2,
    maxOpacity: 0.9,
    flow: 0.5,
    stabilization: 0.3,
    spacing: 0.0005,
    pressureSizeSettings: getLinearBezier(),
    pressureOpacitySettings: getLinearBezier(),
    texture: Some(brushTexture),
  };
}

export function getSizeGivenPressure(settings: Readonly<BrushSettings>, pressure: number): number {
  const min = settings.size * settings.minSize;
  const max = settings.size * settings.maxSize;
  const range = max - min;
  //const p = settings.pressureSizeSettings.sampleY(pressure)
  return range * pressure + min;
}

export function getOpacityGivenPressure(
  settings: Readonly<BrushSettings>,
  pressure: number
): number {
  const min = settings.opacity * settings.minOpacity;
  const max = settings.opacity * settings.maxOpacity;
  const range = max - min;
  //const p = settings.pressureOpacitySettings.sampleY(pressure)
  return range * pressure + min;
}

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
//! CLASS DEFINITION
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

export interface BrushPoint {
  position: Float32Vector2;
  pressure: number;
}

export const newPoint = (pos: Float32Vector2, pressure: number): BrushPoint => ({
  position: pos,
  pressure,
});

export class Brush extends Tool {
  private isPointerDown: boolean;
  private stabilizer: Stabilizer;
  onBrushStrokeEnd: Event<BrushPoint[]>;
  onBrushStrokeContinued: Event<BrushPoint[]>;
  onBrushStrokeEndRaw: Event<BrushPoint[]>;
  onBrushStrokeContinuedRaw: Event<BrushPoint[]>;
  onBrushStrokeCutoff: Event<BrushPoint[]>;

  constructor(settings: Readonly<GlobalToolSettings>) {
    super();
    this.isPointerDown = false;
    this.onBrushStrokeEnd = new Event();
    this.onBrushStrokeContinued = new Event();
    this.onBrushStrokeEndRaw = new Event();
    this.onBrushStrokeContinuedRaw = new Event();
    this.onBrushStrokeCutoff = new Event();
    this.stabilizer = new BoxFilterStabilizer(settings.brushSettings[0], this.onBrushStrokeCutoff);
  }

  handleEvent(args: HandleEventArgs): boolean {
    const preset = args.presetNumber.expect('Brush needs preset number');
    requires(this.areValidBrushSettings(args.settings.brushSettings[preset]));

    if (!(args.event instanceof PointerEvent)) return false;

    const evType = args.eventString;
    const event = args.event;

    if (event.pointerType == 'touch') return false;
    if (event.pointerType == 'mouse' && event.button == MIDDLE_MOUSE) return false

    switch (evType) {
      case 'pointerleave':
        return this.pointerLeaveHandler(args);
      case 'pointermove':
        return this.pointerMovedHandler(args, event);
      case 'pointerup':
        return this.pointerUpHandler(args, event);
      case 'pointerdown':
        return this.pointerDownHandler(args, event);
      default:
        return false;
    }
  }

  pointerMovedHandler(args: HandleEventArgs, event: PointerEvent): boolean {
    const { appState, settings, presetNumber } = args;
    const brushSettings = settings.brushSettings[presetNumber.unwrapOrDefault(0)];

    const point = appState.canvasState.camera.mouseToWorld(event, appState.canvasState);
    const brushPoint = newPoint(point, event.pressure);
    if (this.isPointerDown) {
      this.stabilizer.addPoint(brushPoint, brushSettings);
      this.onBrushStrokeContinued.invoke(this.stabilizer.getProcessedCurve(brushSettings));
      this.onBrushStrokeContinuedRaw.invoke(this.stabilizer.getRawCurve(brushSettings));
    }

    return this.isPointerDown;
  }

  pointerUpHandler(args: HandleEventArgs, __: PointerEvent): boolean {
    const { settings, presetNumber } = args;
    const brushSettings = settings.brushSettings[presetNumber.unwrapOrDefault(0)];

    this.onBrushStrokeEnd.invoke(this.stabilizer.getProcessedCurve(brushSettings));
    this.onBrushStrokeEndRaw.invoke(this.stabilizer.getRawCurve(brushSettings));
    this.stabilizer.reset();

    this.isPointerDown = false;
    return true;
  }

  pointerDownHandler(args: HandleEventArgs, event: PointerEvent): boolean {
    const { appState, settings, presetNumber } = args;
    const brushSettings = settings.brushSettings[presetNumber.unwrapOrDefault(0)];

    const point = appState.canvasState.camera.mouseToWorld(event, appState.canvasState);
    const brushPoint = newPoint(point, event.pressure);
    if (!this.isPointerDown) {
      this.stabilizer.addPoint(brushPoint, brushSettings);
      this.onBrushStrokeContinued.invoke(this.stabilizer.getProcessedCurve(brushSettings));
      this.onBrushStrokeContinuedRaw.invoke(this.stabilizer.getRawCurve(brushSettings));
    }

    const dirty = !this.isPointerDown
    this.isPointerDown = true;
    return dirty;
  }

  pointerLeaveHandler(args: HandleEventArgs): boolean {
    const { settings, presetNumber } = args;
    const brushSettings = settings.brushSettings[presetNumber.unwrapOrDefault(0)];

    this.onBrushStrokeEnd.invoke(this.stabilizer.getProcessedCurve(brushSettings));
    this.onBrushStrokeEndRaw.invoke(this.stabilizer.getRawCurve(brushSettings));
    this.stabilizer.reset();

    this.isPointerDown = false;
    return true;
  }

  areValidBrushSettings(b: BrushSettings): boolean {
    return 0 <= b.opacity && b.opacity <= 100 && 0 <= b.stabilization && b.stabilization <= 1;
  }

  subscribeToOnBrushStrokeEnd(f: (p: BrushPoint[]) => void, hasPriority = false) {
    this.onBrushStrokeEnd.subscribe(f, hasPriority);
  }

  subscribeToOnBrushStrokeContinued(f: (p: BrushPoint[]) => void, hasPriority = false) {
    this.onBrushStrokeContinued.subscribe(f, hasPriority);
  }

  subscribeToOnBrushStrokeEndRaw(f: (p: BrushPoint[]) => void, hasPriority = false) {
    this.onBrushStrokeEndRaw.subscribe(f, hasPriority);
  }

  subscribeToOnBrushStrokeContinuedRaw(f: (p: BrushPoint[]) => void, hasPriority = false) {
    this.onBrushStrokeContinuedRaw.subscribe(f, hasPriority);
  }

  subscribeToOnBrushStrokeCutoff(f: (p: BrushPoint[]) => void, hasPriority = false) {
    this.onBrushStrokeCutoff.subscribe(f, hasPriority);
  }
}

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
//! HELPERS
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
