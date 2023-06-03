import { requires } from "~/utils/contracts";
import { CanvasEventHandler, EventDispatcher, type Tool } from "./tool";
import { todo } from "~/utils/func/funUtils";
import { Unit, unit } from "~/utils/func/result";


////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////
            //! TYPE DEFINITIONS

//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////

const HAND_SENSITIVITY = 1.0;

export interface Hand extends Tool {
    empty: Unit //gets rid of linter error
}

////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////

            //! CONSTRUCTOR + CONCRETE FUNCTIONS

//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////

const dispatcher: EventDispatcher = function(event, handler, state) {
    requires(isValidHand());

    console.info(`Event handler called for hand tool with event of type ${event.type}`);

    event.preventDefault();
    handler(event, state);
}

const mouseMove: CanvasEventHandler = function(event, state, x, y) {
    todo();
}

const mouseDown: CanvasEventHandler = function(event, state, x, y) {
    todo();
}

const mouseUp: CanvasEventHandler = function(event, state, x, y) {
    todo();
}

export function createBrush(): Hand {
    return {
        empty: unit,
        dispatchEvent: dispatcher,
        mousedown: mouseDown,
        mouseup: mouseUp,
        mousemove: mouseMove,
    }
}

////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////

            //! HELPERS

//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////

function isValidHand() {
    return 0 <= HAND_SENSITIVITY && HAND_SENSITIVITY <= 1;
}