import { requires } from '~/utils/contracts';
import {
  type CanvasEventHandler,
  type EventDispatcher,
  type Tool,
} from './tool';
import { todo } from '~/utils/func/funUtils';
import { type FillSettings } from './settings';

////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////
//! TYPE DEFINITIONS

//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Fill extends Tool<FillSettings> {}

type Disptatch = EventDispatcher<FillSettings>;
type Handler = CanvasEventHandler<FillSettings>;

////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////

//! CONSTRUCTOR + CONCRETE FUNCTIONS

//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////

const dispatcher: Disptatch = function (this: Fill, event, handler, state) {

  console.info(
    `Event handler called for rotation tool with event of type ${event.type}`
  );

  event.preventDefault();
  handler(event, state);
};

const mouseMove: Handler = function (this: Fill, event, state) {
  todo();
};

const mouseDown: Handler = function (this: Fill, event, state) {
  todo();
};

const mouseUp: Handler = function (this: Fill, event, state) {
  todo();
};

export function createFill(): Fill {
  return {
    dispatchEvent: dispatcher,
    mousedown: mouseDown,
    mouseup: mouseUp,
    mousemove: mouseMove,
  };
}

////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////

//! HELPERS

//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////

function areValidFillSettings(f: FillSettings) {
  return 0 <= f.tolerance && f.tolerance <= 1;
}
