import { type Float32Vector2 } from 'matrixgl';
import EventManager from '~/util/eventSystem/eventManager';
import { requires } from '../../../../../util/general/contracts';
import BoxFilterStabilizer from './stabilizing/boxFilterStabilizer';
import type Stabilizer from './stabilizing/stabilizer';
import { type AllToolSettings } from '../../settings';
import { type BrushSettings } from '../../settings/brushSettings';
import { Tool, type HandleEventArgs } from '../../tool';

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

export class BrushTool extends Tool {
  private isPointerDown: boolean;
  private stabilizer: Stabilizer;

  constructor(settings: Readonly<AllToolSettings>) {
    super();
    this.isPointerDown = false;
    this.stabilizer = new BoxFilterStabilizer(settings.brushSettings.getCurrentPreset());
  }

  handleEvent(args: HandleEventArgs) {
    requires(this.areValidBrushSettings(args.settings.brushSettings.getCurrentPreset()));

    if (!(args.event instanceof PointerEvent)) return;

    const evType = args.eventString;
    const event = args.event;

    if (event.pointerType == 'touch') return;
    if (event.pointerType == 'mouse' && event.button == MIDDLE_MOUSE) return;

    switch (evType) {
      case 'pointermove':
        this.pointerMovedHandler(args, event);
        return;
      case 'pointerup':
        this.pointerUpHandler(args, event);
        return;
      case 'pointerdown':
        this.pointerDownHandler(args, event);
        return;
      case 'pointerleave':
        this.pointerLeaveHandler(args);
        return;
    }
  }

  update(_: number): void {
    return;
  }

  private pointerMovedHandler(args: HandleEventArgs, event: PointerEvent) {
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
  }

  private pointerUpHandler(args: HandleEventArgs, __: PointerEvent) {
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
  }

  pointerDownHandler(args: HandleEventArgs, event: PointerEvent) {
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

    this.isPointerDown = true;
  }

  private pointerLeaveHandler(args: HandleEventArgs) {
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
  }

  private areValidBrushSettings(b: BrushSettings): boolean {
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
