/* eslint-disable @typescript-eslint/no-unused-vars */
import { type CanvasEvent, type EventTypeName } from './tool';

type BaseEventContext = {
  eventType: EventTypeName;
};

export default class EventHandler<EventContext extends BaseEventContext> {
  ////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////
  //! GENERIC EVENT HANDLER
  ////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////

  handleEvent(context: EventContext, event: CanvasEvent) {
    return;
  }

  ////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////
  //! EVENT HANDLERS
  ////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////

  callAppropiateEventFunction(context: EventContext, event: CanvasEvent) {
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

  abort(context: EventContext, event: UIEvent) {
    return;
  }

  animationCancel(context: EventContext, event: AnimationEvent) {
    return;
  }

  animationEnd(context: EventContext, event: AnimationEvent) {
    return;
  }

  animationIteration(context: EventContext, event: AnimationEvent) {
    return;
  }

  animationStart(context: EventContext, event: AnimationEvent) {
    return;
  }

  auxClick(context: EventContext, event: MouseEvent) {
    return;
  }

  beforeInput(context: EventContext, event: InputEvent) {
    return;
  }

  beforeToggle(context: EventContext, event: Event) {
    return;
  }

  blur(context: EventContext, event: FocusEvent) {
    return;
  }

  cancel(context: EventContext, event: Event) {
    return;
  }

  canplay(context: EventContext, event: Event) {
    return;
  }

  canplayThrough(context: EventContext, event: Event) {
    return;
  }

  change(context: EventContext, event: Event) {
    return;
  }

  click(context: EventContext, event: MouseEvent) {
    return;
  }

  close(context: EventContext, event: Event) {
    return;
  }

  compositionEnd(context: EventContext, event: CompositionEvent) {
    return;
  }

  compositionStart(context: EventContext, event: CompositionEvent) {
    return;
  }

  compositionUpdate(context: EventContext, event: CompositionEvent) {
    return;
  }

  contextMenu(context: EventContext, event: MouseEvent) {
    return;
  }

  copy(context: EventContext, event: ClipboardEvent) {
    return;
  }

  cueChange(context: EventContext, event: Event) {
    return;
  }

  cut(context: EventContext, event: ClipboardEvent) {
    return;
  }

  dblClick(context: EventContext, event: MouseEvent) {
    return;
  }

  drag(context: EventContext, event: DragEvent) {
    return;
  }

  dragEnd(context: EventContext, event: DragEvent) {
    return;
  }

  dragEnter(context: EventContext, event: DragEvent) {
    return;
  }

  dragLeave(context: EventContext, event: DragEvent) {
    return;
  }

  dragOver(context: EventContext, event: DragEvent) {
    return;
  }

  dragStart(context: EventContext, event: DragEvent) {
    return;
  }

  drop(context: EventContext, event: DragEvent) {
    return;
  }

  durationChange(context: EventContext, event: Event) {
    return;
  }

  emptied(context: EventContext, event: Event) {
    return;
  }

  ended(context: EventContext, event: Event) {
    return;
  }

  error(context: EventContext, event: ErrorEvent) {
    return;
  }

  focus(context: EventContext, event: FocusEvent) {
    return;
  }

  focusIn(context: EventContext, event: FocusEvent) {
    return;
  }

  focusOut(context: EventContext, event: FocusEvent) {
    return;
  }

  formData(context: EventContext, event: FormDataEvent) {
    return;
  }

  gotPointerCapture(context: EventContext, event: PointerEvent) {
    return;
  }

  input(context: EventContext, event: Event) {
    return;
  }

  invalid(context: EventContext, event: Event) {
    return;
  }

  keyDown(context: EventContext, event: KeyboardEvent) {
    return;
  }

  keyPress(context: EventContext, event: KeyboardEvent) {
    return;
  }

  keyUp(context: EventContext, event: KeyboardEvent) {
    return;
  }

  load(context: EventContext, event: Event) {
    return;
  }

  loadedData(context: EventContext, event: Event) {
    return;
  }

  loadedMetadata(context: EventContext, event: Event) {
    return;
  }

  loadStart(context: EventContext, event: Event) {
    return;
  }

  lostPointerCapture(context: EventContext, event: PointerEvent) {
    return;
  }

  mouseDown(context: EventContext, event: MouseEvent) {
    return;
  }

  mouseEnter(context: EventContext, event: MouseEvent) {
    return;
  }

  mouseLeave(context: EventContext, event: MouseEvent) {
    return;
  }

  mouseMove(context: EventContext, event: MouseEvent) {
    return;
  }

  mouseOut(context: EventContext, event: MouseEvent) {
    return;
  }

  mouseOver(context: EventContext, event: MouseEvent) {
    return;
  }

  mouseUp(context: EventContext, event: MouseEvent) {
    return;
  }

  paste(context: EventContext, event: ClipboardEvent) {
    return;
  }

  pause(context: EventContext, event: Event) {
    return;
  }

  play(context: EventContext, event: Event) {
    return;
  }

  playing(context: EventContext, event: Event) {
    return;
  }

  pointerCancel(context: EventContext, event: PointerEvent) {
    return;
  }

  pointerDown(context: EventContext, event: PointerEvent) {
    return;
  }

  pointerEnter(context: EventContext, event: PointerEvent) {
    return;
  }

  pointerLeave(context: EventContext, event: PointerEvent) {
    return;
  }

  pointerMove(context: EventContext, event: PointerEvent) {
    return;
  }

  pointerOut(context: EventContext, event: PointerEvent) {
    return;
  }

  pointerOver(context: EventContext, event: PointerEvent) {
    return;
  }

  pointerUp(context: EventContext, event: PointerEvent) {
    return;
  }

  progress(context: EventContext, event: ProgressEvent) {
    return;
  }

  rateChange(context: EventContext, event: Event) {
    return;
  }

  reset(context: EventContext, event: Event) {
    return;
  }

  resize(context: EventContext, event: UIEvent) {
    return;
  }

  scroll(context: EventContext, event: Event) {
    return;
  }

  scrollEnd(context: EventContext, event: Event) {
    return;
  }

  securityPolicyViolation(context: EventContext, event: SecurityPolicyViolationEvent) {
    return;
  }

  seeked(context: EventContext, event: Event) {
    return;
  }

  seeking(context: EventContext, event: Event) {
    return;
  }

  select(context: EventContext, event: Event) {
    return;
  }

  selectionChange(context: EventContext, event: Event) {
    return;
  }

  selectStart(context: EventContext, event: Event) {
    return;
  }

  slotChange(context: EventContext, event: Event) {
    return;
  }

  stalled(context: EventContext, event: Event) {
    return;
  }

  submit(context: EventContext, event: SubmitEvent) {
    return;
  }

  suspend(context: EventContext, event: Event) {
    return;
  }

  timeUpdate(context: EventContext, event: Event) {
    return;
  }

  toggle(context: EventContext, event: Event) {
    return;
  }

  touchCancel(context: EventContext, event: TouchEvent) {
    return;
  }

  touchEnd(context: EventContext, event: TouchEvent) {
    return;
  }

  touchMove(context: EventContext, event: TouchEvent) {
    return;
  }

  touchStart(context: EventContext, event: TouchEvent) {
    return;
  }

  transitionCancel(context: EventContext, event: TransitionEvent) {
    return;
  }

  transitionEnd(context: EventContext, event: TransitionEvent) {
    return;
  }

  transitionRun(context: EventContext, event: TransitionEvent) {
    return;
  }

  transitionStart(context: EventContext, event: TransitionEvent) {
    return;
  }

  volumeChange(context: EventContext, event: Event) {
    return;
  }

  waiting(context: EventContext, event: Event) {
    return;
  }

  webkitAnimationEnd(context: EventContext, event: Event) {
    return;
  }

  webkitAnimationIteration(context: EventContext, event: Event) {
    return;
  }

  webkitAnimationStart(context: EventContext, event: Event) {
    return;
  }

  webkitTransitionEnd(context: EventContext, event: Event) {
    return;
  }

  wheel(context: EventContext, event: WheelEvent) {
    return;
  }
}
