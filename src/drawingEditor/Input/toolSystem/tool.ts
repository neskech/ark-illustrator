/* eslint-disable @typescript-eslint/no-unused-vars */
import type Camera from '~/drawingEditor/canvas/camera';
import { type AllToolSettings } from './settings';
import { type CircleTool } from './tools/circleTool';
import { type RectangleTool } from './tools/rectangleTool';
import { type HandTool } from './tools/handTool';
import { type FillTool } from './tools/fillTool';
import { type BrushTool } from './tools/brushTool/brushTool';
import { type CanvasState } from '~/drawingEditor/canvas/canvas';
import type ToolRenderers from '~/drawingEditor/renderer/toolRenderers/toolRendererList';
import { type RenderContext } from '~/drawingEditor/renderer/renderer';

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
//! TOOL MAP
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

export type ToolMap = {
  brush: BrushTool;
  fillBucket: FillTool;
  hand: HandTool;
  square: RectangleTool;
  circle: CircleTool;
};

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
//! TYPE DEFINITIONS
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

export type EventTypeName = keyof GlobalEventHandlersEventMap;
export type CanvasEvent = GlobalEventHandlersEventMap[EventTypeName];

export type ToolType = keyof ToolMap;

export type ToolContext = {
  canvasState: CanvasState;
  settings: AllToolSettings;
  eventType: EventTypeName;
};

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
//! MAIN TOOL CLASS
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

export abstract class Tool {
  abstract update(deltaTime: number): void;
  abstract acceptRenderer(renderers: ToolRenderers, renderContext: RenderContext): void;

  ////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////
  //! GENERIC EVENT HANDLER
  ////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////

  handleEvent(context: ToolContext, event: CanvasEvent) {
    return;
  }

  ////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////
  //! EVENT HANDLERS
  ////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////

  callAppropiateEventFunction(context: ToolContext, event: CanvasEvent) {
    switch (context.eventType) {
      case 'abort': {
        this.abort(context, event as UIEvent);
        break;
      }

      case 'animationcancel': {
        this.animationCancel(context, event as AnimationEvent);
        break;
      }

      case 'animationend': {
        this.animationEnd(context, event as AnimationEvent);
        break;
      }

      case 'animationiteration': {
        this.animationIteration(context, event as AnimationEvent);
        break;
      }

      case 'animationstart': {
        this.animationStart(context, event as AnimationEvent);
        break;
      }

      case 'auxclick': {
        this.auxClick(context, event as MouseEvent);
        break;
      }

      case 'beforeinput': {
        this.beforeInput(context, event as InputEvent);
        break;
      }

      case 'beforetoggle': {
        this.beforeToggle(context, event as Event);
        break;
      }

      case 'blur': {
        this.blur(context, event as FocusEvent);
        break;
      }

      case 'cancel': {
        this.cancel(context, event as Event);
        break;
      }

      case 'canplay': {
        this.canplay(context, event as Event);
        break;
      }

      case 'canplaythrough': {
        this.canplayThrough(context, event as Event);
        break;
      }

      case 'change': {
        this.change(context, event as Event);
        break;
      }

      case 'click': {
        this.click(context, event as MouseEvent);
        break;
      }

      case 'close': {
        this.close(context, event as Event);
        break;
      }

      case 'compositionend': {
        this.compositionEnd(context, event as CompositionEvent);
        break;
      }

      case 'compositionstart': {
        this.compositionStart(context, event as CompositionEvent);
        break;
      }

      case 'compositionupdate': {
        this.compositionUpdate(context, event as CompositionEvent);
        break;
      }

      case 'contextmenu': {
        this.contextMenu(context, event as MouseEvent);
        break;
      }

      case 'copy': {
        this.copy(context, event as ClipboardEvent);
        break;
      }

      case 'cuechange': {
        this.cueChange(context, event as Event);
        break;
      }

      case 'cut': {
        this.cut(context, event as ClipboardEvent);
        break;
      }

      case 'dblclick': {
        this.dblClick(context, event as MouseEvent);
        break;
      }

      case 'drag': {
        this.drag(context, event as DragEvent);
        break;
      }

      case 'dragend': {
        this.dragEnd(context, event as DragEvent);
        break;
      }

      case 'dragenter': {
        this.dragEnter(context, event as DragEvent);
        break;
      }

      case 'dragleave': {
        this.dragLeave(context, event as DragEvent);
        break;
      }

      case 'dragover': {
        this.dragOver(context, event as DragEvent);
        break;
      }

      case 'dragstart': {
        this.dragStart(context, event as DragEvent);
        break;
      }

      case 'drop': {
        this.drop(context, event as DragEvent);
        break;
      }

      case 'durationchange': {
        this.durationChange(context, event as Event);
        break;
      }

      case 'emptied': {
        this.emptied(context, event as Event);
        break;
      }

      case 'ended': {
        this.ended(context, event as Event);
        break;
      }

      case 'error': {
        this.error(context, event as ErrorEvent);
        break;
      }

      case 'focus': {
        this.focus(context, event as FocusEvent);
        break;
      }

      case 'focusin': {
        this.focusIn(context, event as FocusEvent);
        break;
      }

      case 'focusout': {
        this.focusOut(context, event as FocusEvent);
        break;
      }

      case 'formdata': {
        this.formData(context, event as FormDataEvent);
        break;
      }

      case 'gotpointercapture': {
        this.gotPointerCapture(context, event as PointerEvent);
        break;
      }

      case 'input': {
        this.input(context, event as Event);
        break;
      }

      case 'invalid': {
        this.invalid(context, event as Event);
        break;
      }

      case 'keydown': {
        this.keyDown(context, event as KeyboardEvent);
        break;
      }

      case 'keypress': {
        this.keyPress(context, event as KeyboardEvent);
        break;
      }

      case 'keyup': {
        this.keyUp(context, event as KeyboardEvent);
        break;
      }

      case 'load': {
        this.load(context, event as Event);
        break;
      }

      case 'loadeddata': {
        this.loadedData(context, event as Event);
        break;
      }

      case 'loadedmetadata': {
        this.loadedMetadata(context, event as Event);
        break;
      }

      case 'loadstart': {
        this.loadStart(context, event as Event);
        break;
      }

      case 'lostpointercapture': {
        this.lostPointerCapture(context, event as PointerEvent);
        break;
      }

      case 'mousedown': {
        this.mouseDown(context, event as MouseEvent);
        break;
      }

      case 'mouseenter': {
        this.mouseEnter(context, event as MouseEvent);
        break;
      }

      case 'mouseleave': {
        this.mouseLeave(context, event as MouseEvent);
        break;
      }

      case 'mousemove': {
        this.mouseMove(context, event as MouseEvent);
        break;
      }

      case 'mouseout': {
        this.mouseOut(context, event as MouseEvent);
        break;
      }

      case 'mouseover': {
        this.mouseOver(context, event as MouseEvent);
        break;
      }

      case 'mouseup': {
        this.mouseUp(context, event as MouseEvent);
        break;
      }

      case 'paste': {
        this.paste(context, event as ClipboardEvent);
        break;
      }

      case 'pause': {
        this.pause(context, event as Event);
        break;
      }

      case 'play': {
        this.play(context, event as Event);
        break;
      }

      case 'playing': {
        this.playing(context, event as Event);
        break;
      }

      case 'pointercancel': {
        this.pointerCancel(context, event as PointerEvent);
        break;
      }

      case 'pointerdown': {
        this.pointerDown(context, event as PointerEvent);
        break;
      }

      case 'pointerenter': {
        this.pointerEnter(context, event as PointerEvent);
        break;
      }

      case 'pointerleave': {
        this.pointerLeave(context, event as PointerEvent);
        break;
      }

      case 'pointermove': {
        this.pointerMove(context, event as PointerEvent);
        break;
      }

      case 'pointerout': {
        this.pointerOut(context, event as PointerEvent);
        break;
      }

      case 'pointerover': {
        this.pointerOver(context, event as PointerEvent);
        break;
      }

      case 'pointerup': {
        this.pointerUp(context, event as PointerEvent);
        break;
      }

      case 'progress': {
        this.progress(context, event as ProgressEvent);
        break;
      }

      case 'ratechange': {
        this.rateChange(context, event as Event);
        break;
      }

      case 'reset': {
        this.reset(context, event as Event);
        break;
      }

      case 'resize': {
        this.resize(context, event as UIEvent);
        break;
      }

      case 'scroll': {
        this.scroll(context, event as Event);
        break;
      }

      case 'scrollend': {
        this.scrollEnd(context, event as Event);
        break;
      }

      case 'securitypolicyviolation': {
        this.securityPolicyViolation(context, event as SecurityPolicyViolationEvent);
        break;
      }

      case 'seeked': {
        this.seeked(context, event as Event);
        break;
      }

      case 'seeking': {
        this.seeking(context, event as Event);
        break;
      }

      case 'select': {
        this.select(context, event as Event);
        break;
      }

      case 'selectionchange': {
        this.selectionChange(context, event as Event);
        break;
      }

      case 'selectstart': {
        this.selectStart(context, event as Event);
        break;
      }

      case 'slotchange': {
        this.slotChange(context, event as Event);
        break;
      }

      case 'stalled': {
        this.stalled(context, event as Event);
        break;
      }

      case 'submit': {
        this.submit(context, event as SubmitEvent);
        break;
      }

      case 'suspend': {
        this.suspend(context, event as Event);
        break;
      }

      case 'timeupdate': {
        this.timeUpdate(context, event as Event);
        break;
      }

      case 'toggle': {
        this.toggle(context, event as Event);
        break;
      }

      case 'touchcancel': {
        this.touchCancel(context, event as TouchEvent);
        break;
      }

      case 'touchend': {
        this.touchEnd(context, event as TouchEvent);
        break;
      }

      case 'touchmove': {
        this.touchMove(context, event as TouchEvent);
        break;
      }

      case 'touchstart': {
        this.touchStart(context, event as TouchEvent);
        break;
      }

      case 'transitioncancel': {
        this.transitionCancel(context, event as TransitionEvent);
        break;
      }

      case 'transitionend': {
        this.transitionEnd(context, event as TransitionEvent);
        break;
      }

      case 'transitionrun': {
        this.transitionRun(context, event as TransitionEvent);
        break;
      }

      case 'transitionstart': {
        this.transitionStart(context, event as TransitionEvent);
        break;
      }

      case 'volumechange': {
        this.volumeChange(context, event as Event);
        break;
      }

      case 'waiting': {
        this.waiting(context, event as Event);
        break;
      }

      case 'webkitanimationend': {
        this.webkitAnimationEnd(context, event as Event);
        break;
      }

      case 'webkitanimationiteration': {
        this.webkitAnimationIteration(context, event as Event);
        break;
      }

      case 'webkitanimationstart': {
        this.webkitAnimationStart(context, event as Event);
        break;
      }

      case 'webkittransitionend': {
        this.webkitTransitionEnd(context, event as Event);
        break;
      }

      case 'wheel': {
        this.wheel(context, event as WheelEvent);
        break;
      }
    }
  }

  ////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////
  //! EVENT HANDLERS
  ////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////

  abort(context: ToolContext, event: UIEvent) {
    return;
  }

  animationCancel(context: ToolContext, event: AnimationEvent) {
    return;
  }

  animationEnd(context: ToolContext, event: AnimationEvent) {
    return;
  }

  animationIteration(context: ToolContext, event: AnimationEvent) {
    return;
  }

  animationStart(context: ToolContext, event: AnimationEvent) {
    return;
  }

  auxClick(context: ToolContext, event: MouseEvent) {
    return;
  }

  beforeInput(context: ToolContext, event: InputEvent) {
    return;
  }

  beforeToggle(context: ToolContext, event: Event) {
    return;
  }

  blur(context: ToolContext, event: FocusEvent) {
    return;
  }

  cancel(context: ToolContext, event: Event) {
    return;
  }

  canplay(context: ToolContext, event: Event) {
    return;
  }

  canplayThrough(context: ToolContext, event: Event) {
    return;
  }

  change(context: ToolContext, event: Event) {
    return;
  }

  click(context: ToolContext, event: MouseEvent) {
    return;
  }

  close(context: ToolContext, event: Event) {
    return;
  }

  compositionEnd(context: ToolContext, event: CompositionEvent) {
    return;
  }

  compositionStart(context: ToolContext, event: CompositionEvent) {
    return;
  }

  compositionUpdate(context: ToolContext, event: CompositionEvent) {
    return;
  }

  contextMenu(context: ToolContext, event: MouseEvent) {
    return;
  }

  copy(context: ToolContext, event: ClipboardEvent) {
    return;
  }

  cueChange(context: ToolContext, event: Event) {
    return;
  }

  cut(context: ToolContext, event: ClipboardEvent) {
    return;
  }

  dblClick(context: ToolContext, event: MouseEvent) {
    return;
  }

  drag(context: ToolContext, event: DragEvent) {
    return;
  }

  dragEnd(context: ToolContext, event: DragEvent) {
    return;
  }

  dragEnter(context: ToolContext, event: DragEvent) {
    return;
  }

  dragLeave(context: ToolContext, event: DragEvent) {
    return;
  }

  dragOver(context: ToolContext, event: DragEvent) {
    return;
  }

  dragStart(context: ToolContext, event: DragEvent) {
    return;
  }

  drop(context: ToolContext, event: DragEvent) {
    return;
  }

  durationChange(context: ToolContext, event: Event) {
    return;
  }

  emptied(context: ToolContext, event: Event) {
    return;
  }

  ended(context: ToolContext, event: Event) {
    return;
  }

  error(context: ToolContext, event: ErrorEvent) {
    return;
  }

  focus(context: ToolContext, event: FocusEvent) {
    return;
  }

  focusIn(context: ToolContext, event: FocusEvent) {
    return;
  }

  focusOut(context: ToolContext, event: FocusEvent) {
    return;
  }

  formData(context: ToolContext, event: FormDataEvent) {
    return;
  }

  gotPointerCapture(context: ToolContext, event: PointerEvent) {
    return;
  }

  input(context: ToolContext, event: Event) {
    return;
  }

  invalid(context: ToolContext, event: Event) {
    return;
  }

  keyDown(context: ToolContext, event: KeyboardEvent) {
    return;
  }

  keyPress(context: ToolContext, event: KeyboardEvent) {
    return;
  }

  keyUp(context: ToolContext, event: KeyboardEvent) {
    return;
  }

  load(context: ToolContext, event: Event) {
    return;
  }

  loadedData(context: ToolContext, event: Event) {
    return;
  }

  loadedMetadata(context: ToolContext, event: Event) {
    return;
  }

  loadStart(context: ToolContext, event: Event) {
    return;
  }

  lostPointerCapture(context: ToolContext, event: PointerEvent) {
    return;
  }

  mouseDown(context: ToolContext, event: MouseEvent) {
    return;
  }

  mouseEnter(context: ToolContext, event: MouseEvent) {
    return;
  }

  mouseLeave(context: ToolContext, event: MouseEvent) {
    return;
  }

  mouseMove(context: ToolContext, event: MouseEvent) {
    return;
  }

  mouseOut(context: ToolContext, event: MouseEvent) {
    return;
  }

  mouseOver(context: ToolContext, event: MouseEvent) {
    return;
  }

  mouseUp(context: ToolContext, event: MouseEvent) {
    return;
  }

  paste(context: ToolContext, event: ClipboardEvent) {
    return;
  }

  pause(context: ToolContext, event: Event) {
    return;
  }

  play(context: ToolContext, event: Event) {
    return;
  }

  playing(context: ToolContext, event: Event) {
    return;
  }

  pointerCancel(context: ToolContext, event: PointerEvent) {
    return;
  }

  pointerDown(context: ToolContext, event: PointerEvent) {
    return;
  }

  pointerEnter(context: ToolContext, event: PointerEvent) {
    return;
  }

  pointerLeave(context: ToolContext, event: PointerEvent) {
    return;
  }

  pointerMove(context: ToolContext, event: PointerEvent) {
    return;
  }

  pointerOut(context: ToolContext, event: PointerEvent) {
    return;
  }

  pointerOver(context: ToolContext, event: PointerEvent) {
    return;
  }

  pointerUp(context: ToolContext, event: PointerEvent) {
    return;
  }

  progress(context: ToolContext, event: ProgressEvent) {
    return;
  }

  rateChange(context: ToolContext, event: Event) {
    return;
  }

  reset(context: ToolContext, event: Event) {
    return;
  }

  resize(context: ToolContext, event: UIEvent) {
    return;
  }

  scroll(context: ToolContext, event: Event) {
    return;
  }

  scrollEnd(context: ToolContext, event: Event) {
    return;
  }

  securityPolicyViolation(context: ToolContext, event: SecurityPolicyViolationEvent) {
    return;
  }

  seeked(context: ToolContext, event: Event) {
    return;
  }

  seeking(context: ToolContext, event: Event) {
    return;
  }

  select(context: ToolContext, event: Event) {
    return;
  }

  selectionChange(context: ToolContext, event: Event) {
    return;
  }

  selectStart(context: ToolContext, event: Event) {
    return;
  }

  slotChange(context: ToolContext, event: Event) {
    return;
  }

  stalled(context: ToolContext, event: Event) {
    return;
  }

  submit(context: ToolContext, event: SubmitEvent) {
    return;
  }

  suspend(context: ToolContext, event: Event) {
    return;
  }

  timeUpdate(context: ToolContext, event: Event) {
    return;
  }

  toggle(context: ToolContext, event: Event) {
    return;
  }

  touchCancel(context: ToolContext, event: TouchEvent) {
    return;
  }

  touchEnd(context: ToolContext, event: TouchEvent) {
    return;
  }

  touchMove(context: ToolContext, event: TouchEvent) {
    return;
  }

  touchStart(context: ToolContext, event: TouchEvent) {
    return;
  }

  transitionCancel(context: ToolContext, event: TransitionEvent) {
    return;
  }

  transitionEnd(context: ToolContext, event: TransitionEvent) {
    return;
  }

  transitionRun(context: ToolContext, event: TransitionEvent) {
    return;
  }

  transitionStart(context: ToolContext, event: TransitionEvent) {
    return;
  }

  volumeChange(context: ToolContext, event: Event) {
    return;
  }

  waiting(context: ToolContext, event: Event) {
    return;
  }

  webkitAnimationEnd(context: ToolContext, event: Event) {
    return;
  }

  webkitAnimationIteration(context: ToolContext, event: Event) {
    return;
  }

  webkitAnimationStart(context: ToolContext, event: Event) {
    return;
  }

  webkitTransitionEnd(context: ToolContext, event: Event) {
    return;
  }

  wheel(context: ToolContext, event: WheelEvent) {
    return;
  }
}
