import { assert, requires } from '~/util/general/contracts';
import { NoContextEventHandler } from './eventHandler';
import { Float32Vector2, Float32Vector3 } from 'matrixgl';
import { unreachable } from '~/util/general/funUtils';
import { equals } from '~/util/webglWrapper/vector';

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
//! CONSTANTS
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

const NUM_MOUSE_BUTTONS = 5;

const NUM_POINTER_TYPES = 3;

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
//! TYPE DEFINTIONS & HELPERS
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

type KeyState = {
  isPressed: boolean;
};

type MouseButtonState = {
  isPressed: boolean;
};

type MousePositionState = {
  client: Float32Vector2;
  previousClient: Float32Vector2;
  layer: Float32Vector2;
  page: Float32Vector2;
  offset: Float32Vector2;
  screen: Float32Vector2;
};

type PointerState = {
  isDown: boolean;
  hasMoved: boolean;
  client: Float32Vector2;
  previousClient: Float32Vector2;
  layer: Float32Vector2;
  page: Float32Vector2;
  offset: Float32Vector2;
  screen: Float32Vector2;
};

type ScrollWheelState = {
  delta: Float32Vector3;
  client: Float32Vector2;
  layer: Float32Vector2;
  page: Float32Vector2;
  offset: Float32Vector2;
  screen: Float32Vector2;
};

export type MouseButtonType = 'left' | 'right' | 'middle' | 'four' | 'five';
function mouseButtonTypeToIndex(m: MouseButtonType): number {
  switch (m) {
    case 'left':
      return 0;
    case 'right':
      return 1;
    case 'middle':
      return 2;
    case 'four':
      return 3;
    case 'five':
      return 4;
    default:
      return unreachable();
  }
}

type PointerTypePlusAny = 'mouse' | 'pen' | 'finger' | 'any';
export type PointerType = 'mouse' | 'pen' | 'finger';
function pointerTypeToIndex(p: string): number {
  switch (p) {
    case 'mouse':
      return 0;
    case 'pen':
      return 1;
    case 'finger':
      return 2;
    default:
      return unreachable();
  }
}

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
//! MAIN CLASS
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

export default class InputState extends NoContextEventHandler {
  private mouseButtonState: MouseButtonState[];
  private mousePositionState: MousePositionState;
  private pointerState: PointerState[];
  private keyState: Map<string, KeyState>;
  private scrollWheelState: ScrollWheelState;
  private mouseMoved: boolean;

  constructor() {
    super();
    this.mouseButtonState = new Array(NUM_MOUSE_BUTTONS).fill(({
      isPressed: false,
      isAltPressed: false,
      isControlPressed: false,
    })) as MouseButtonState[];
    this.mousePositionState = {
      client: new Float32Vector2(0, 0),
      previousClient: new Float32Vector2(0, 0),
      layer: new Float32Vector2(0, 0),
      page: new Float32Vector2(0, 0),
      offset: new Float32Vector2(0, 0),
      screen: new Float32Vector2(0, 0),
    };
    this.pointerState = new Array(NUM_POINTER_TYPES).fill(({
      isDown: false,
      client: new Float32Vector2(0, 0),
      previousClient: new Float32Vector2(0, 0),
      layer: new Float32Vector2(0, 0),
      page: new Float32Vector2(0, 0),
      offset: new Float32Vector2(0, 0),
      screen: new Float32Vector2(0, 0),
      hasMoved: false,
    })) as PointerState[];
    this.keyState = new Map();
    this.scrollWheelState = {
      delta: new Float32Vector3(0, 0, 0),
      client: new Float32Vector2(0, 0),
      layer: new Float32Vector2(0, 0),
      page: new Float32Vector2(0, 0),
      offset: new Float32Vector2(0, 0),
      screen: new Float32Vector2(0, 0),
    };
    this.mouseMoved = false;
  }

  public update() {
    this.mouseMoved = !equals(
      this.getMousePositionClient(),
      this.mousePositionState.previousClient
    );

    for (const state of this.pointerState) {
      state.hasMoved = !equals(state.client, state.previousClient);
    }
  }

  public hasMouseMoved(): boolean {
    return this.mouseMoved;
  }

  public hasPointerMoved(pointerType: PointerTypePlusAny = 'any'): boolean {
    if (pointerType == 'any') return this.pointerState.some((s) => s.hasMoved);

    const index = pointerTypeToIndex(pointerType);
    return this.pointerState[index].hasMoved;
  }

  public isMouseButtonPressed(mouseButton: MouseButtonType): boolean {
    const index = mouseButtonTypeToIndex(mouseButton);
    return this.mouseButtonState[index].isPressed;
  }

  public isPointerDown(pointerType: PointerTypePlusAny): boolean {
    if (pointerType == 'any') return this.pointerState.some((s) => s.isDown);

    const index = pointerTypeToIndex(pointerType);
    return this.pointerState[index].isDown;
  }

  public isKeyPressed(key: string): boolean {
    requires(this.keyState.has(key), `${key} is not a real key`);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.keyState.get(key)!.isPressed;
  }

  public getPointerPositionClient(pointerType: PointerType): Float32Vector2 {
    const index = pointerTypeToIndex(pointerType);
    return this.pointerState[index].client;
  }

  public getPointerPositionLayer(pointerType: PointerType): Float32Vector2 {
    const index = pointerTypeToIndex(pointerType);
    return this.pointerState[index].layer;
  }

  public getPointerPositionPage(pointerType: PointerType): Float32Vector2 {
    const index = pointerTypeToIndex(pointerType);
    return this.pointerState[index].page;
  }

  public getPointerPositionOffset(pointerType: PointerType): Float32Vector2 {
    const index = pointerTypeToIndex(pointerType);
    return this.pointerState[index].offset;
  }

  public getPointerPositionScreen(pointerType: PointerType): Float32Vector2 {
    const index = pointerTypeToIndex(pointerType);
    return this.pointerState[index].screen;
  }

  public getMousePositionClient(): Float32Vector2 {
    return this.mousePositionState.client;
  }

  public getMousePositionLayer(): Float32Vector2 {
    return this.mousePositionState.layer;
  }

  public getMousePositionPage(): Float32Vector2 {
    return this.mousePositionState.page;
  }

  public getMousePositionOffset(): Float32Vector2 {
    return this.mousePositionState.offset;
  }

  public getMousePositionScreen(): Float32Vector2 {
    return this.mousePositionState.screen;
  }

  public getMouseWheelScrollDelta(): Float32Vector3 {
    return this.scrollWheelState.delta;
  }

  public getMouseWheelScrollClient(): Float32Vector2 {
    return this.scrollWheelState.client;
  }

  public getMouseWheelScrollLayer(): Float32Vector2 {
    return this.scrollWheelState.layer;
  }

  public getMouseWheelScrollPage(): Float32Vector2 {
    return this.scrollWheelState.page;
  }

  public getMouseWheelScrollOffset(): Float32Vector2 {
    return this.scrollWheelState.offset;
  }

  public getMouseWheelScrollScreen(): Float32Vector2 {
    return this.scrollWheelState.screen;
  }

  public mouseButtonToString(mouseButton: number): MouseButtonType {
    switch (mouseButton) {
      case 0:
        return 'left';
      case 1:
        return 'middle';
      case 2:
        return 'right';
      case 3:
        return 'four';
      case 4:
        return 'five';
      default:
        return unreachable();
    }
  }

  protected mouseUp(event: MouseEvent): void {
    assert(0 <= event.button && event.button < NUM_MOUSE_BUTTONS);
    const state = this.mouseButtonState[event.button];
    state.isPressed = false;
  }

  protected mouseDown(event: MouseEvent): void {
    assert(0 <= event.button && event.button < NUM_MOUSE_BUTTONS);
    const state = this.mouseButtonState[event.button];
    state.isPressed = true;
  }

  protected mouseMove(event: MouseEvent): void {
    this.mousePositionState.previousClient = this.mousePositionState.client;
    this.mousePositionState.client = new Float32Vector2(event.clientX, event.clientY);
    this.mousePositionState.layer = new Float32Vector2(event.layerX, event.layerY);
    this.mousePositionState.page = new Float32Vector2(event.pageX, event.pageY);
    this.mousePositionState.offset = new Float32Vector2(event.offsetX, event.offsetY);
    this.mousePositionState.screen = new Float32Vector2(event.screenX, event.screenY);
  }

  protected pointerMove(event: PointerEvent): void {
    const index = pointerTypeToIndex(event.pointerType);
    const state = this.pointerState[index];
    state.previousClient = state.client;
    state.client = new Float32Vector2(event.clientX, event.clientY);
    state.client = new Float32Vector2(event.clientX, event.clientY);
    state.layer = new Float32Vector2(event.layerX, event.layerY);
    state.page = new Float32Vector2(event.pageX, event.pageY);
    state.offset = new Float32Vector2(event.offsetX, event.offsetY);
    state.screen = new Float32Vector2(event.screenX, event.screenY);
  }

  protected pointerDown(event: PointerEvent): void {
    const index = pointerTypeToIndex(event.pointerType);
    const state = this.pointerState[index];
    state.isDown = true;
  }

  protected pointerUp(event: PointerEvent): void {
    const index = pointerTypeToIndex(event.pointerType);
    const state = this.pointerState[index];
    state.isDown = false;
  }

  protected keyDown(event: KeyboardEvent): void {
    if (!this.keyState.has(event.key))
      this.keyState.set(event.key, {
        isPressed: false,
      });

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const state = this.keyState.get(event.key)!;
    state.isPressed = true;
  }

  protected keyUp(event: KeyboardEvent): void {
    if (!this.keyState.has(event.key))
      this.keyState.set(event.key, {
        isPressed: false,
      });

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const state = this.keyState.get(event.key)!;
    state.isPressed = false;
  }

  protected wheel(event: WheelEvent): void {
    this.scrollWheelState.delta = new Float32Vector3(event.deltaX, event.deltaY, event.deltaZ);
    this.scrollWheelState.client = new Float32Vector2(event.clientX, event.clientY);
    this.scrollWheelState.layer = new Float32Vector2(event.layerX, event.layerY);
    this.scrollWheelState.page = new Float32Vector2(event.pageX, event.pageY);
    this.scrollWheelState.offset = new Float32Vector2(event.offsetX, event.offsetY);
    this.scrollWheelState.screen = new Float32Vector2(event.screenX, event.screenY);
  }
}
