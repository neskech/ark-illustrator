import { requires } from "~/utils/contracts";
import { type CanvasEventHandler, type EventDispatcher, type Tool } from "./tool";
import { todo } from "~/utils/func/funUtils";
import { vec2F, type Vec2F } from "~/utils/web/vector";


////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////
            //! TYPE DEFINITIONS

//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////

const ROTATION_SENSITIVITY = 1.0;

export interface Rotation extends Tool {
    centerOfRotation: Vec2F
}

////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////

            //! CONSTRUCTOR + CONCRETE FUNCTIONS

//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////

const dispatcher: EventDispatcher = function(event, handler, state) {
    requires(isValidRotator());

    console.info(`Event handler called for rotation tool with event of type ${event.type}`);

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

export function createBrush(): Rotation {
    return {
        centerOfRotation: vec2F(0, 0),
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

function isValidRotator() {
    return 0 <= ROTATION_SENSITIVITY && ROTATION_SENSITIVITY <= 1;
}