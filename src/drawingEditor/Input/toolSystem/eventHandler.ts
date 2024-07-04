/* eslint-disable @typescript-eslint/no-unused-vars */
import { type CanvasEvent, type EventTypeName } from './tool';

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
//! TYPE DEFINITIONS
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

type BaseEventContext = {
  eventType: EventTypeName;
};

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
//! MAIN CLASS (1)
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

export class EventHandler<EventContext extends BaseEventContext> {
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
    if (context.eventType.includes('pointer'))
        alert('in HEREEEE WITH ' + context.eventType)
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
        alert("DOWN FUCKEWR 1") 
        alert("DOWN FUCKEWR " + (event as PointerEvent).pointerType)
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
        alert("MOVE FUCKEWR 1") 
        alert("MOVEEE FUCKEWR " + (event as PointerEvent).pointerType)
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
        alert("UIP FUCKEWR 1") 
        alert("UP FUCKEWR " + (event as PointerEvent).pointerType)
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

  protected abort(context: EventContext, event: UIEvent) {
    return;
  }

  protected animationCancel(context: EventContext, event: AnimationEvent) {
    return;
  }

  protected animationEnd(context: EventContext, event: AnimationEvent) {
    return;
  }

  protected animationIteration(context: EventContext, event: AnimationEvent) {
    return;
  }

  protected animationStart(context: EventContext, event: AnimationEvent) {
    return;
  }

  protected auxClick(context: EventContext, event: MouseEvent) {
    return;
  }

  protected beforeInput(context: EventContext, event: InputEvent) {
    return;
  }

  protected beforeToggle(context: EventContext, event: Event) {
    return;
  }

  protected blur(context: EventContext, event: FocusEvent) {
    return;
  }

  protected cancel(context: EventContext, event: Event) {
    return;
  }

  protected canplay(context: EventContext, event: Event) {
    return;
  }

  protected canplayThrough(context: EventContext, event: Event) {
    return;
  }

  protected change(context: EventContext, event: Event) {
    return;
  }

  protected click(context: EventContext, event: MouseEvent) {
    return;
  }

  protected close(context: EventContext, event: Event) {
    return;
  }

  protected compositionEnd(context: EventContext, event: CompositionEvent) {
    return;
  }

  protected compositionStart(context: EventContext, event: CompositionEvent) {
    return;
  }

  protected compositionUpdate(context: EventContext, event: CompositionEvent) {
    return;
  }

  protected contextMenu(context: EventContext, event: MouseEvent) {
    return;
  }

  protected copy(context: EventContext, event: ClipboardEvent) {
    return;
  }

  protected cueChange(context: EventContext, event: Event) {
    return;
  }

  protected cut(context: EventContext, event: ClipboardEvent) {
    return;
  }

  protected dblClick(context: EventContext, event: MouseEvent) {
    return;
  }

  protected drag(context: EventContext, event: DragEvent) {
    return;
  }

  protected dragEnd(context: EventContext, event: DragEvent) {
    return;
  }

  protected dragEnter(context: EventContext, event: DragEvent) {
    return;
  }

  protected dragLeave(context: EventContext, event: DragEvent) {
    return;
  }

  protected dragOver(context: EventContext, event: DragEvent) {
    return;
  }

  protected dragStart(context: EventContext, event: DragEvent) {
    return;
  }

  protected drop(context: EventContext, event: DragEvent) {
    return;
  }

  protected durationChange(context: EventContext, event: Event) {
    return;
  }

  protected emptied(context: EventContext, event: Event) {
    return;
  }

  protected ended(context: EventContext, event: Event) {
    return;
  }

  protected error(context: EventContext, event: ErrorEvent) {
    return;
  }

  protected focus(context: EventContext, event: FocusEvent) {
    return;
  }

  protected focusIn(context: EventContext, event: FocusEvent) {
    return;
  }

  protected focusOut(context: EventContext, event: FocusEvent) {
    return;
  }

  protected formData(context: EventContext, event: FormDataEvent) {
    return;
  }

  protected gotPointerCapture(context: EventContext, event: PointerEvent) {
    return;
  }

  protected input(context: EventContext, event: Event) {
    return;
  }

  protected invalid(context: EventContext, event: Event) {
    return;
  }

  protected keyDown(context: EventContext, event: KeyboardEvent) {
    return;
  }

  protected keyPress(context: EventContext, event: KeyboardEvent) {
    return;
  }

  protected keyUp(context: EventContext, event: KeyboardEvent) {
    return;
  }

  protected load(context: EventContext, event: Event) {
    return;
  }

  protected loadedData(context: EventContext, event: Event) {
    return;
  }

  protected loadedMetadata(context: EventContext, event: Event) {
    return;
  }

  protected loadStart(context: EventContext, event: Event) {
    return;
  }

  protected lostPointerCapture(context: EventContext, event: PointerEvent) {
    return;
  }

  protected mouseDown(context: EventContext, event: MouseEvent) {
    return;
  }

  protected mouseEnter(context: EventContext, event: MouseEvent) {
    return;
  }

  protected mouseLeave(context: EventContext, event: MouseEvent) {
    return;
  }

  protected mouseMove(context: EventContext, event: MouseEvent) {
    return;
  }

  protected mouseOut(context: EventContext, event: MouseEvent) {
    return;
  }

  protected mouseOver(context: EventContext, event: MouseEvent) {
    return;
  }

  protected mouseUp(context: EventContext, event: MouseEvent) {
    return;
  }

  protected paste(context: EventContext, event: ClipboardEvent) {
    return;
  }

  protected pause(context: EventContext, event: Event) {
    return;
  }

  protected play(context: EventContext, event: Event) {
    return;
  }

  protected playing(context: EventContext, event: Event) {
    return;
  }

  protected pointerCancel(context: EventContext, event: PointerEvent) {
    return;
  }

  protected pointerDown(context: EventContext, event: PointerEvent) {
    return;
  }

  protected pointerEnter(context: EventContext, event: PointerEvent) {
    return;
  }

  protected pointerLeave(context: EventContext, event: PointerEvent) {
    return;
  }

  protected pointerMove(context: EventContext, event: PointerEvent) {
    return;
  }

  protected pointerOut(context: EventContext, event: PointerEvent) {
    return;
  }

  protected pointerOver(context: EventContext, event: PointerEvent) {
    return;
  }

  protected pointerUp(context: EventContext, event: PointerEvent) {
    return;
  }

  protected progress(context: EventContext, event: ProgressEvent) {
    return;
  }

  protected rateChange(context: EventContext, event: Event) {
    return;
  }

  protected reset(context: EventContext, event: Event) {
    return;
  }

  protected resize(context: EventContext, event: UIEvent) {
    return;
  }

  protected scroll(context: EventContext, event: Event) {
    return;
  }

  protected scrollEnd(context: EventContext, event: Event) {
    return;
  }

  protected securityPolicyViolation(context: EventContext, event: SecurityPolicyViolationEvent) {
    return;
  }

  protected seeked(context: EventContext, event: Event) {
    return;
  }

  protected seeking(context: EventContext, event: Event) {
    return;
  }

  protected select(context: EventContext, event: Event) {
    return;
  }

  protected selectionChange(context: EventContext, event: Event) {
    return;
  }

  protected selectStart(context: EventContext, event: Event) {
    return;
  }

  protected slotChange(context: EventContext, event: Event) {
    return;
  }

  protected stalled(context: EventContext, event: Event) {
    return;
  }

  protected submit(context: EventContext, event: SubmitEvent) {
    return;
  }

  protected suspend(context: EventContext, event: Event) {
    return;
  }

  protected timeUpdate(context: EventContext, event: Event) {
    return;
  }

  protected toggle(context: EventContext, event: Event) {
    return;
  }

  protected touchCancel(context: EventContext, event: TouchEvent) {
    return;
  }

  protected touchEnd(context: EventContext, event: TouchEvent) {
    return;
  }

  protected touchMove(context: EventContext, event: TouchEvent) {
    return;
  }

  protected touchStart(context: EventContext, event: TouchEvent) {
    return;
  }

  protected transitionCancel(context: EventContext, event: TransitionEvent) {
    return;
  }

  protected transitionEnd(context: EventContext, event: TransitionEvent) {
    return;
  }

  protected transitionRun(context: EventContext, event: TransitionEvent) {
    return;
  }

  protected transitionStart(context: EventContext, event: TransitionEvent) {
    return;
  }

  protected volumeChange(context: EventContext, event: Event) {
    return;
  }

  protected waiting(context: EventContext, event: Event) {
    return;
  }

  protected webkitAnimationEnd(context: EventContext, event: Event) {
    return;
  }

  protected webkitAnimationIteration(context: EventContext, event: Event) {
    return;
  }

  protected webkitAnimationStart(context: EventContext, event: Event) {
    return;
  }

  protected webkitTransitionEnd(context: EventContext, event: Event) {
    return;
  }

  protected wheel(context: EventContext, event: WheelEvent) {
    return;
  }
}

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
//! MAIN CLASS (1)
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

export class NoContextEventHandler {
  ////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////
  //! GENERIC EVENT HANDLER
  ////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////

  handleEvent(event: CanvasEvent) {
    return;
  }

  ////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////
  //! EVENT HANDLERS
  ////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////

  callAppropiateEventFunction(eventType: EventTypeName, event: CanvasEvent) {
    switch (eventType) {
      case 'abort': {
        this.abort(event as UIEvent);
        break;
      }

      case 'animationcancel': {
        this.animationCancel(event as AnimationEvent);
        break;
      }

      case 'animationend': {
        this.animationEnd(event as AnimationEvent);
        break;
      }

      case 'animationiteration': {
        this.animationIteration(event as AnimationEvent);
        break;
      }

      case 'animationstart': {
        this.animationStart(event as AnimationEvent);
        break;
      }

      case 'auxclick': {
        this.auxClick(event as MouseEvent);
        break;
      }

      case 'beforeinput': {
        this.beforeInput(event as InputEvent);
        break;
      }

      case 'beforetoggle': {
        this.beforeToggle(event as Event);
        break;
      }

      case 'blur': {
        this.blur(event as FocusEvent);
        break;
      }

      case 'cancel': {
        this.cancel(event as Event);
        break;
      }

      case 'canplay': {
        this.canplay(event as Event);
        break;
      }

      case 'canplaythrough': {
        this.canplayThrough(event as Event);
        break;
      }

      case 'change': {
        this.change(event as Event);
        break;
      }

      case 'click': {
        this.click(event as MouseEvent);
        break;
      }

      case 'close': {
        this.close(event as Event);
        break;
      }

      case 'compositionend': {
        this.compositionEnd(event as CompositionEvent);
        break;
      }

      case 'compositionstart': {
        this.compositionStart(event as CompositionEvent);
        break;
      }

      case 'compositionupdate': {
        this.compositionUpdate(event as CompositionEvent);
        break;
      }

      case 'contextmenu': {
        this.contextMenu(event as MouseEvent);
        break;
      }

      case 'copy': {
        this.copy(event as ClipboardEvent);
        break;
      }

      case 'cuechange': {
        this.cueChange(event as Event);
        break;
      }

      case 'cut': {
        this.cut(event as ClipboardEvent);
        break;
      }

      case 'dblclick': {
        this.dblClick(event as MouseEvent);
        break;
      }

      case 'drag': {
        this.drag(event as DragEvent);
        break;
      }

      case 'dragend': {
        this.dragEnd(event as DragEvent);
        break;
      }

      case 'dragenter': {
        this.dragEnter(event as DragEvent);
        break;
      }

      case 'dragleave': {
        this.dragLeave(event as DragEvent);
        break;
      }

      case 'dragover': {
        this.dragOver(event as DragEvent);
        break;
      }

      case 'dragstart': {
        this.dragStart(event as DragEvent);
        break;
      }

      case 'drop': {
        this.drop(event as DragEvent);
        break;
      }

      case 'durationchange': {
        this.durationChange(event as Event);
        break;
      }

      case 'emptied': {
        this.emptied(event as Event);
        break;
      }

      case 'ended': {
        this.ended(event as Event);
        break;
      }

      case 'error': {
        this.error(event as ErrorEvent);
        break;
      }

      case 'focus': {
        this.focus(event as FocusEvent);
        break;
      }

      case 'focusin': {
        this.focusIn(event as FocusEvent);
        break;
      }

      case 'focusout': {
        this.focusOut(event as FocusEvent);
        break;
      }

      case 'formdata': {
        this.formData(event as FormDataEvent);
        break;
      }

      case 'gotpointercapture': {
        this.gotPointerCapture(event as PointerEvent);
        break;
      }

      case 'input': {
        this.input(event as Event);
        break;
      }

      case 'invalid': {
        this.invalid(event as Event);
        break;
      }

      case 'keydown': {
        this.keyDown(event as KeyboardEvent);
        break;
      }

      case 'keypress': {
        this.keyPress(event as KeyboardEvent);
        break;
      }

      case 'keyup': {
        this.keyUp(event as KeyboardEvent);
        break;
      }

      case 'load': {
        this.load(event as Event);
        break;
      }

      case 'loadeddata': {
        this.loadedData(event as Event);
        break;
      }

      case 'loadedmetadata': {
        this.loadedMetadata(event as Event);
        break;
      }

      case 'loadstart': {
        this.loadStart(event as Event);
        break;
      }

      case 'lostpointercapture': {
        this.lostPointerCapture(event as PointerEvent);
        break;
      }

      case 'mousedown': {
        this.mouseDown(event as MouseEvent);
        break;
      }

      case 'mouseenter': {
        this.mouseEnter(event as MouseEvent);
        break;
      }

      case 'mouseleave': {
        this.mouseLeave(event as MouseEvent);
        break;
      }

      case 'mousemove': {
        this.mouseMove(event as MouseEvent);
        break;
      }

      case 'mouseout': {
        this.mouseOut(event as MouseEvent);
        break;
      }

      case 'mouseover': {
        this.mouseOver(event as MouseEvent);
        break;
      }

      case 'mouseup': {
        this.mouseUp(event as MouseEvent);
        break;
      }

      case 'paste': {
        this.paste(event as ClipboardEvent);
        break;
      }

      case 'pause': {
        this.pause(event as Event);
        break;
      }

      case 'play': {
        this.play(event as Event);
        break;
      }

      case 'playing': {
        this.playing(event as Event);
        break;
      }

      case 'pointercancel': {
        this.pointerCancel(event as PointerEvent);
        break;
      }

      case 'pointerdown': {
        this.pointerDown(event as PointerEvent);
        break;
      }

      case 'pointerenter': {
        this.pointerEnter(event as PointerEvent);
        break;
      }

      case 'pointerleave': {
        this.pointerLeave(event as PointerEvent);
        break;
      }

      case 'pointermove': {
        this.pointerMove(event as PointerEvent);
        break;
      }

      case 'pointerout': {
        this.pointerOut(event as PointerEvent);
        break;
      }

      case 'pointerover': {
        this.pointerOver(event as PointerEvent);
        break;
      }

      case 'pointerup': {
        this.pointerUp(event as PointerEvent);
        break;
      }

      case 'progress': {
        this.progress(event as ProgressEvent);
        break;
      }

      case 'ratechange': {
        this.rateChange(event as Event);
        break;
      }

      case 'reset': {
        this.reset(event as Event);
        break;
      }

      case 'resize': {
        this.resize(event as UIEvent);
        break;
      }

      case 'scroll': {
        this.scroll(event as Event);
        break;
      }

      case 'scrollend': {
        this.scrollEnd(event as Event);
        break;
      }

      case 'securitypolicyviolation': {
        this.securityPolicyViolation(event as SecurityPolicyViolationEvent);
        break;
      }

      case 'seeked': {
        this.seeked(event as Event);
        break;
      }

      case 'seeking': {
        this.seeking(event as Event);
        break;
      }

      case 'select': {
        this.select(event as Event);
        break;
      }

      case 'selectionchange': {
        this.selectionChange(event as Event);
        break;
      }

      case 'selectstart': {
        this.selectStart(event as Event);
        break;
      }

      case 'slotchange': {
        this.slotChange(event as Event);
        break;
      }

      case 'stalled': {
        this.stalled(event as Event);
        break;
      }

      case 'submit': {
        this.submit(event as SubmitEvent);
        break;
      }

      case 'suspend': {
        this.suspend(event as Event);
        break;
      }

      case 'timeupdate': {
        this.timeUpdate(event as Event);
        break;
      }

      case 'toggle': {
        this.toggle(event as Event);
        break;
      }

      case 'touchcancel': {
        this.touchCancel(event as TouchEvent);
        break;
      }

      case 'touchend': {
        this.touchEnd(event as TouchEvent);
        break;
      }

      case 'touchmove': {
        this.touchMove(event as TouchEvent);
        break;
      }

      case 'touchstart': {
        this.touchStart(event as TouchEvent);
        break;
      }

      case 'transitioncancel': {
        this.transitionCancel(event as TransitionEvent);
        break;
      }

      case 'transitionend': {
        this.transitionEnd(event as TransitionEvent);
        break;
      }

      case 'transitionrun': {
        this.transitionRun(event as TransitionEvent);
        break;
      }

      case 'transitionstart': {
        this.transitionStart(event as TransitionEvent);
        break;
      }

      case 'volumechange': {
        this.volumeChange(event as Event);
        break;
      }

      case 'waiting': {
        this.waiting(event as Event);
        break;
      }

      case 'webkitanimationend': {
        this.webkitAnimationEnd(event as Event);
        break;
      }

      case 'webkitanimationiteration': {
        this.webkitAnimationIteration(event as Event);
        break;
      }

      case 'webkitanimationstart': {
        this.webkitAnimationStart(event as Event);
        break;
      }

      case 'webkittransitionend': {
        this.webkitTransitionEnd(event as Event);
        break;
      }

      case 'wheel': {
        this.wheel(event as WheelEvent);
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

  protected abort(event: UIEvent) {
    return;
  }

  protected animationCancel(event: AnimationEvent) {
    return;
  }

  protected animationEnd(event: AnimationEvent) {
    return;
  }

  protected animationIteration(event: AnimationEvent) {
    return;
  }

  protected animationStart(event: AnimationEvent) {
    return;
  }

  protected auxClick(event: MouseEvent) {
    return;
  }

  protected beforeInput(event: InputEvent) {
    return;
  }

  protected beforeToggle(event: Event) {
    return;
  }

  protected blur(event: FocusEvent) {
    return;
  }

  protected cancel(event: Event) {
    return;
  }

  protected canplay(event: Event) {
    return;
  }

  protected canplayThrough(event: Event) {
    return;
  }

  protected change(event: Event) {
    return;
  }

  protected click(event: MouseEvent) {
    return;
  }

  protected close(event: Event) {
    return;
  }

  protected compositionEnd(event: CompositionEvent) {
    return;
  }

  protected compositionStart(event: CompositionEvent) {
    return;
  }

  protected compositionUpdate(event: CompositionEvent) {
    return;
  }

  protected contextMenu(event: MouseEvent) {
    return;
  }

  protected copy(event: ClipboardEvent) {
    return;
  }

  protected cueChange(event: Event) {
    return;
  }

  protected cut(event: ClipboardEvent) {
    return;
  }

  protected dblClick(event: MouseEvent) {
    return;
  }

  protected drag(event: DragEvent) {
    return;
  }

  protected dragEnd(event: DragEvent) {
    return;
  }

  protected dragEnter(event: DragEvent) {
    return;
  }

  protected dragLeave(event: DragEvent) {
    return;
  }

  protected dragOver(event: DragEvent) {
    return;
  }

  protected dragStart(event: DragEvent) {
    return;
  }

  protected drop(event: DragEvent) {
    return;
  }

  protected durationChange(event: Event) {
    return;
  }

  protected emptied(event: Event) {
    return;
  }

  protected ended(event: Event) {
    return;
  }

  protected error(event: ErrorEvent) {
    return;
  }

  protected focus(event: FocusEvent) {
    return;
  }

  protected focusIn(event: FocusEvent) {
    return;
  }

  protected focusOut(event: FocusEvent) {
    return;
  }

  protected formData(event: FormDataEvent) {
    return;
  }

  protected gotPointerCapture(event: PointerEvent) {
    return;
  }

  protected input(event: Event) {
    return;
  }

  protected invalid(event: Event) {
    return;
  }

  protected keyDown(event: KeyboardEvent) {
    return;
  }

  protected keyPress(event: KeyboardEvent) {
    return;
  }

  protected keyUp(event: KeyboardEvent) {
    return;
  }

  protected load(event: Event) {
    return;
  }

  protected loadedData(event: Event) {
    return;
  }

  protected loadedMetadata(event: Event) {
    return;
  }

  protected loadStart(event: Event) {
    return;
  }

  protected lostPointerCapture(event: PointerEvent) {
    return;
  }

  protected mouseDown(event: MouseEvent) {
    return;
  }

  protected mouseEnter(event: MouseEvent) {
    return;
  }

  protected mouseLeave(event: MouseEvent) {
    return;
  }

  protected mouseMove(event: MouseEvent) {
    return;
  }

  protected mouseOut(event: MouseEvent) {
    return;
  }

  protected mouseOver(event: MouseEvent) {
    return;
  }

  protected mouseUp(event: MouseEvent) {
    return;
  }

  protected paste(event: ClipboardEvent) {
    return;
  }

  protected pause(event: Event) {
    return;
  }

  protected play(event: Event) {
    return;
  }

  protected playing(event: Event) {
    return;
  }

  protected pointerCancel(event: PointerEvent) {
    return;
  }

  protected pointerDown(event: PointerEvent) {
    return;
  }

  protected pointerEnter(event: PointerEvent) {
    return;
  }

  protected pointerLeave(event: PointerEvent) {
    return;
  }

  protected pointerMove(event: PointerEvent) {
    return;
  }

  protected pointerOut(event: PointerEvent) {
    return;
  }

  protected pointerOver(event: PointerEvent) {
    return;
  }

  protected pointerUp(event: PointerEvent) {
    return;
  }

  protected progress(event: ProgressEvent) {
    return;
  }

  protected rateChange(event: Event) {
    return;
  }

  protected reset(event: Event) {
    return;
  }

  protected resize(event: UIEvent) {
    return;
  }

  protected scroll(event: Event) {
    return;
  }

  protected scrollEnd(event: Event) {
    return;
  }

  protected securityPolicyViolation(event: SecurityPolicyViolationEvent) {
    return;
  }

  protected seeked(event: Event) {
    return;
  }

  protected seeking(event: Event) {
    return;
  }

  protected select(event: Event) {
    return;
  }

  protected selectionChange(event: Event) {
    return;
  }

  protected selectStart(event: Event) {
    return;
  }

  protected slotChange(event: Event) {
    return;
  }

  protected stalled(event: Event) {
    return;
  }

  protected submit(event: SubmitEvent) {
    return;
  }

  protected suspend(event: Event) {
    return;
  }

  protected timeUpdate(event: Event) {
    return;
  }

  protected toggle(event: Event) {
    return;
  }

  protected touchCancel(event: TouchEvent) {
    return;
  }

  protected touchEnd(event: TouchEvent) {
    return;
  }

  protected touchMove(event: TouchEvent) {
    return;
  }

  protected touchStart(event: TouchEvent) {
    return;
  }

  protected transitionCancel(event: TransitionEvent) {
    return;
  }

  protected transitionEnd(event: TransitionEvent) {
    return;
  }

  protected transitionRun(event: TransitionEvent) {
    return;
  }

  protected transitionStart(event: TransitionEvent) {
    return;
  }

  protected volumeChange(event: Event) {
    return;
  }

  protected waiting(event: Event) {
    return;
  }

  protected webkitAnimationEnd(event: Event) {
    return;
  }

  protected webkitAnimationIteration(event: Event) {
    return;
  }

  protected webkitAnimationStart(event: Event) {
    return;
  }

  protected webkitTransitionEnd(event: Event) {
    return;
  }

  protected wheel(event: WheelEvent) {
    return;
  }
}
