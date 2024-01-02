import { type Float32Vector2 } from 'matrixgl';
import EventManager from '~/application/eventSystem/eventManager';
import { requires } from '../../../../general/contracts';
import BoxFilterStabilizer from '../../utils/stabilizing/boxFilterStabilizer';
import type Stabilizer from '../../utils/stabilizing/stabilizer';
import { type GlobalToolSettings } from '../settings';
import { type BrushSettings } from '../settings/brushSettings';
import { Tool, type HandleEventArgs } from '../tool';

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

  constructor(settings: Readonly<GlobalToolSettings>) {
    super();
    this.isPointerDown = false;
    this.stabilizer = new BoxFilterStabilizer(settings.brushSettings.getCurrentPreset());
  }

  handleEvent(args: HandleEventArgs): boolean {
    requires(this.areValidBrushSettings(args.settings.brushSettings.getCurrentPreset()));

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
    const { appState, settings } = args;
    const brushSettings = settings.brushSettings.getCurrentPreset();

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
    const { settings } = args;
    const brushSettings = settings.brushSettings.getCurrentPreset();

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
    const { appState, settings } = args;
    const brushSettings = settings.brushSettings.getCurrentPreset();

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
    const { settings } = args;
    const brushSettings = settings.brushSettings.getCurrentPreset()

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
