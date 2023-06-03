import { requires } from "~/utils/contracts";
import {
  type CanvasEventHandler,
  type EventDispatcher,
  type Tool,
} from "./tool";
import { todo } from "~/utils/func/funUtils";

////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////
//! TYPE DEFINITIONS

//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////

export interface FillSettings {
  tolerance: number;
}

export interface Fill extends Tool {
  settings: FillSettings;
}

////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////

//! CONSTRUCTOR + CONCRETE FUNCTIONS

//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////

const dispatcher: EventDispatcher = function (this: Fill, event, handler, state) {
  requires(isValidFill(this));

  console.info(
    `Event handler called for rotation tool with event of type ${event.type}`
  );

  event.preventDefault();
  handler(event, state);
};

const mouseMove: CanvasEventHandler = function (this: Fill, event, state, x, y) {
  todo();
};

const mouseDown: CanvasEventHandler = function (this: Fill, event, state, x, y) {
  todo();
};

const mouseUp: CanvasEventHandler = function (this: Fill, event, state, x, y) {
  todo();
};

export function createBrush(settings: FillSettings): Fill {
  return {
    settings,
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

function isValidFill(f: Fill) {
  return 0 <= f.settings.tolerance && f.settings.tolerance <= 1;
}
