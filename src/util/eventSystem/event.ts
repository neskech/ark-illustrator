/* eslint-disable @typescript-eslint/ban-types */
import { type Prettify } from '../general/utilTypes';
import type AppEventTypes from './eventTypes/appEvents';
import type BrushTypes from './eventTypes/brushEvents';
import type CanvasTypes from './eventTypes/canvasEvents';

type ArrayConcat<K extends unknown[], P extends unknown[]> = 
    K extends [infer Head, ...infer Rest] ?
        [Head, ...ArrayConcat<Rest, P>]  
    : K extends [] ?
        P
    : never


type MultiArrayConcat<K extends unknown[][]> = 
    K extends [infer Head1 extends unknown[], infer Head2 extends unknown[], ...infer Rest extends unknown[][]] ?
        ArrayConcat<ArrayConcat<Head1, Head2>, MultiArrayConcat<Rest>>
    : K extends [infer Head] ?
        Head 
    : K extends [] ?
        []
    : []

type MakeEventMap<Ts extends object[]> = 
    Ts extends [infer Head] ?
        Head
    : Ts extends [infer Head, ...infer Rest extends object[]] ?
        Head & MakeEventMap<Rest>
    : never

type AllEvents = MultiArrayConcat<[BrushTypes, CanvasTypes, AppEventTypes]>;
type EventMap = Prettify<MakeEventMap<AllEvents>>;

export default EventMap;
