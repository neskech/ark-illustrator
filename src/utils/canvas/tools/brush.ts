import { Float32Vector3, type Float32Vector2 } from 'matrixgl';
import EventManager from '~/utils/event/eventManager';
import { type Option } from '~/utils/func/option';
import { getLinearBezier, type BezierFunction } from '~/utils/misc/bezierFunction';
import { type GL } from '~/utils/web/glUtils';
import Texture from '~/utils/web/texture';
import { requires } from '../../contracts';
import { Some } from '../../func/option';
import BoxFilterStabilizer from '../utils/stabilizing/boxFilterStabilizer';
import type Stabilizer from '../utils/stabilizing/stabilizer';
import { type GlobalToolSettings } from './settings';
import { Tool, type HandleEventArgs } from './tool';

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
//! CONSTANTS
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

const MIDDLE_MOUSE = 1;

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
  color: Float32Vector3;
  isEraser: boolean;
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
    flow: 0.02,
    stabilization: 0.5,
    spacing: 0.0005,
    pressureSizeSettings: getLinearBezier(),
    pressureOpacitySettings: getLinearBezier(),
    color: new Float32Vector3(0, 0, 0),
    isEraser: false,
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

export const newPoint = (
  pos: Float32Vector2,
  pressure: number
): BrushPoint => ({
  position: pos,
  pressure,
});

export class Brush extends Tool {
  private isPointerDown: boolean;
  private stabilizer: Stabilizer;

  constructor(settings: Readonly<GlobalToolSettings>) {
    super();
    this.isPointerDown = false;
    this.stabilizer = new BoxFilterStabilizer(settings.brushSettings[0]);
  }

  handleEvent(args: HandleEventArgs): boolean {
    const preset = args.presetNumber.expect('Brush needs preset number');
    requires(this.areValidBrushSettings(args.settings.brushSettings[preset]));

    if (!(args.event instanceof PointerEvent)) return false;

    const evType = args.eventString;
    const event = args.event;

    if (event.pointerType == 'touch') return false;
    if (event.pointerType == 'mouse' && event.button == MIDDLE_MOUSE) return false;

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

    const point = appState.canvasState.camera.mouseToWorld(event, appState.canvasState.canvas);
    const brushPoint = newPoint(point, event.pressure);
    if (this.isPointerDown) {
      this.stabilizer.addPoint(brushPoint, brushSettings);
      EventManager.invoke('brushStrokeContinued', {
        pointData: this.stabilizer.getProcessedCurve(brushSettings),
        currentSettings: brushSettings,
      });
      EventManager.invoke('brushStrokeContinuedRaw', {
        pointData: this.stabilizer.getRawCurve(brushSettings),
        currentSettings: brushSettings,
      });
    }

    return this.isPointerDown;
  }

  pointerUpHandler(args: HandleEventArgs, __: PointerEvent): boolean {
    const { settings, presetNumber } = args;
    const brushSettings = settings.brushSettings[presetNumber.unwrapOrDefault(0)];

    EventManager.invoke('brushStrokEnd', {
      pointData: this.stabilizer.getProcessedCurve(brushSettings),
      currentSettings: brushSettings,
    });
    EventManager.invoke('brushStrokEndRaw', {
      pointData: this.stabilizer.getRawCurve(brushSettings),
      currentSettings: brushSettings,
    });
    this.stabilizer.reset();

    this.isPointerDown = false;
    return true;
  }

  pointerDownHandler(args: HandleEventArgs, event: PointerEvent): boolean {
    const { appState, settings, presetNumber } = args;
    const brushSettings = settings.brushSettings[presetNumber.unwrapOrDefault(0)];

    const point = appState.canvasState.camera.mouseToWorld(event, appState.canvasState.canvas);
    const brushPoint = newPoint(point, event.pressure);

    if (!this.isPointerDown) {
      this.stabilizer.addPoint(brushPoint, brushSettings);
      EventManager.invoke('brushStrokeContinued', {
        pointData: this.stabilizer.getProcessedCurve(brushSettings),
        currentSettings: brushSettings,
      });
      EventManager.invoke('brushStrokeContinuedRaw', {
        pointData: this.stabilizer.getRawCurve(brushSettings),
        currentSettings: brushSettings,
      });
    }

    const dirty = !this.isPointerDown;
    this.isPointerDown = true;
    return dirty;
  }

  pointerLeaveHandler(args: HandleEventArgs): boolean {
    const { settings, presetNumber } = args;
    const brushSettings = settings.brushSettings[presetNumber.unwrapOrDefault(0)];

    EventManager.invoke('brushStrokEnd', {
      pointData: this.stabilizer.getProcessedCurve(brushSettings),
      currentSettings: brushSettings,
    });
    EventManager.invoke('brushStrokEndRaw', {
      pointData: this.stabilizer.getRawCurve(brushSettings),
      currentSettings: brushSettings,
    });
    this.stabilizer.reset();

    this.isPointerDown = false;
    return true;
  }

  areValidBrushSettings(b: BrushSettings): boolean {
    return 0 <= b.opacity && b.opacity <= 100 && 0 <= b.stabilization && b.stabilization <= 1;
  }
}

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
//! HELPERS
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
