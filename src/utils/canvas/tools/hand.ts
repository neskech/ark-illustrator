import { requires } from "~/utils/contracts";
import { CanvasEventHandler, EventDispatcher, type Tool } from "./tool";
import { todo } from "~/utils/func/funUtils";
import { Unit, unit } from "~/utils/func/result";


////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////
            //! TYPE DEFINITIONS + CONSTANTS

//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////

const HAND_SENSITIVITY = 1.0;

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Hand extends Tool<Unit> {}

type Dispatch = EventDispatcher<Unit>
type Handler = CanvasEventHandler<Unit>

////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////

            //! CONSTRUCTOR + CONCRETE FUNCTIONS

//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////

const dispatcher: Dispatch = function(event, handler, state) {
    requires(isValidHand());

    console.info(`Event handler called for hand tool with event of type ${event.type}`);

    event.preventDefault();
    handler(event, state);
}

const mouseMove: Handler = function(event, state, x, y) {
    todo();
}

const mouseDown: Handler = function(event, state, x, y) {
    todo();
}

const mouseUp: Handler = function(event, state, x, y) {
    todo();
}

export function createBrush(): Hand {
    return {
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