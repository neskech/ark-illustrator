import { requires } from "~/utils/contracts";
import { type CanvasEventHandler, type EventDispatcher, type Tool } from "./tool";
import { todo } from "~/utils/func/funUtils";
import { vec2F, type Vec2F } from "~/utils/web/vector";
import { Unit } from "~/utils/func/result";


////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////
            //! TYPE DEFINITIONS

//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////

const ROTATION_SENSITIVITY = 1.0;

export interface Rotation extends Tool<Unit> {
    centerOfRotation: Vec2F
}

type Disptatch = EventDispatcher<Unit>;
type Handler = CanvasEventHandler<Unit>;

////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////

            //! CONSTRUCTOR + CONCRETE FUNCTIONS

//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////

const dispatcher: Disptatch = function(event, handler, state) {
    requires(isValidRotator());

    console.info(`Event handler called for rotation tool with event of type ${event.type}`);

    event.preventDefault();
    handler(event, state);
}

const mouseMove: Handler = function(event, state) {
    todo();
}

const mouseDown: Handler = function(event, state) {
    todo();
}

const mouseUp: Handler = function(event, state) {
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