import { requires } from '~/utils/contracts';
import {
  type CanvasEventHandler,
  type EventDispatcher,
  type Tool,
} from './tool';
import { todo } from '~/utils/func/funUtils';
import { type Unit, unit } from '~/utils/func/result';

////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////
//! TYPE DEFINITIONS

//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////

const ROTATION_SENSITIVITY = 1.0;

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Zoom extends Tool<Unit> {}

type Disptatch = EventDispatcher<Unit>;
type Handler = CanvasEventHandler<Unit>;

////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////

//! CONSTRUCTOR + CONCRETE FUNCTIONS

//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////

const dispatcher: Disptatch = function (event, handler, state) {
  requires(isValidRotator());

  console.info(
    `Event handler called for rotation tool with event of type ${event.type}`
  );

  event.preventDefault();
  handler(event, state);
};

const mouseMove: Handler = function (event, state) {
  todo();
};

const mouseDown: Handler = function (event, state) {
  todo();
};

const mouseUp: Handler = function (event, state) {
  todo();
};

export function createBrush(): Zoom {
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

function isValidRotator() {
  return 0 <= ROTATION_SENSITIVITY && ROTATION_SENSITIVITY <= 1;
}
