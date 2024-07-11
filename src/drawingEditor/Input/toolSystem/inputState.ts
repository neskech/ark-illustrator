import { assert, requires } from '~/util/general/contracts';
import { NoContextEventHandler } from './eventHandler';
import { unreachable } from '~/util/general/funUtils';
import { Vector2, Vector3 } from 'matrixgl_fork';

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
  client: Vector2;
  previousClient: Vector2;
  layer: Vector2;
  page: Vector2;
  offset: Vector2;
  screen: Vector2;
};

type PointerState = {
  isDown: boolean;
  hasMoved: boolean;
  client: Vector2;
  previousClient: Vector2;
  layer: Vector2;
  page: Vector2;
  offset: Vector2;
  screen: Vector2;
};

type ScrollWheelState = {
  delta: Vector3;
  client: Vector2;
  layer: Vector2;
  page: Vector2;
  offset: Vector2;
  screen: Vector2;
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

type PointerTypePlusAny = 'mouse' | 'pen' | 'touch' | 'any';
export type PointerType = 'mouse' | 'pen' | 'touch';
function pointerTypeToIndex(p: string): number {
  switch (p) {
    case 'mouse':
      return 0;
    case 'pen':
      return 1;
    case 'touch':
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
    this.mouseButtonState = new Array(NUM_MOUSE_BUTTONS).fill({
      isPressed: false,
      isAltPressed: false,
      isControlPressed: false,
    }) as MouseButtonState[];
    this.mousePositionState = {
      client: new Vector2(0, 0),
      previousClient: new Vector2(0, 0),
      layer: new Vector2(0, 0),
      page: new Vector2(0, 0),
      offset: new Vector2(0, 0),
      screen: new Vector2(0, 0),
    };
    this.pointerState = new Array(NUM_POINTER_TYPES).fill({
      isDown: false,
      client: new Vector2(0, 0),
      previousClient: new Vector2(0, 0),
      layer: new Vector2(0, 0),
      page: new Vector2(0, 0),
      offset: new Vector2(0, 0),
      screen: new Vector2(0, 0),
      hasMoved: false,
    }) as PointerState[];
    this.keyState = new Map();
    this.scrollWheelState = {
      delta: new Vector3(0, 0, 0),
      client: new Vector2(0, 0),
      layer: new Vector2(0, 0),
      page: new Vector2(0, 0),
      offset: new Vector2(0, 0),
      screen: new Vector2(0, 0),
    };
    this.mouseMoved = false;
  }

  public update() {
    this.mouseMoved = !this.getMousePositionClient().equals(this.mousePositionState.previousClient);

    for (const state of this.pointerState) {
      state.hasMoved = state.client.equals(state.previousClient);
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

  public getPointerPositionClient(pointerType: PointerType): Vector2 {
    const index = pointerTypeToIndex(pointerType);
    return this.pointerState[index].client;
  }

  public getPointerPositionLayer(pointerType: PointerType): Vector2 {
    const index = pointerTypeToIndex(pointerType);
    return this.pointerState[index].layer;
  }

  public getPointerPositionPage(pointerType: PointerType): Vector2 {
    const index = pointerTypeToIndex(pointerType);
    return this.pointerState[index].page;
  }

  public getPointerPositionOffset(pointerType: PointerType): Vector2 {
    const index = pointerTypeToIndex(pointerType);
    return this.pointerState[index].offset;
  }

  public getPointerPositionScreen(pointerType: PointerType): Vector2 {
    const index = pointerTypeToIndex(pointerType);
    return this.pointerState[index].screen;
  }

  public getMousePositionClient(): Vector2 {
    return this.mousePositionState.client;
  }

  public getMousePositionLayer(): Vector2 {
    return this.mousePositionState.layer;
  }

  public getMousePositionPage(): Vector2 {
    return this.mousePositionState.page;
  }

  public getMousePositionOffset(): Vector2 {
    return this.mousePositionState.offset;
  }

  public getMousePositionScreen(): Vector2 {
    return this.mousePositionState.screen;
  }

  public getMouseWheelScrollDelta(): Vector3 {
    return this.scrollWheelState.delta;
  }

  public getMouseWheelScrollClient(): Vector2 {
    return this.scrollWheelState.client;
  }

  public getMouseWheelScrollLayer(): Vector2 {
    return this.scrollWheelState.layer;
  }

  public getMouseWheelScrollPage(): Vector2 {
    return this.scrollWheelState.page;
  }

  public getMouseWheelScrollOffset(): Vector2 {
    return this.scrollWheelState.offset;
  }

  public getMouseWheelScrollScreen(): Vector2 {
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
    this.mousePositionState.client = new Vector2(event.clientX, event.clientY);
    this.mousePositionState.layer = new Vector2(event.layerX, event.layerY);
    this.mousePositionState.page = new Vector2(event.pageX, event.pageY);
    this.mousePositionState.offset = new Vector2(event.offsetX, event.offsetY);
    this.mousePositionState.screen = new Vector2(event.screenX, event.screenY);
  }

  protected pointerMove(event: PointerEvent): void {
    const index = pointerTypeToIndex(event.pointerType);
    const state = this.pointerState[index];
    state.previousClient = state.client;
    state.client = new Vector2(event.clientX, event.clientY);
    state.client = new Vector2(event.clientX, event.clientY);
    state.layer = new Vector2(event.layerX, event.layerY);
    state.page = new Vector2(event.pageX, event.pageY);
    state.offset = new Vector2(event.offsetX, event.offsetY);
    state.screen = new Vector2(event.screenX, event.screenY);
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

  protected pointerLeave(event: PointerEvent): void {
    const index = pointerTypeToIndex(event.pointerType);
    const state = this.pointerState[index];
    state.isDown = false;
  }

  protected pointerCancel(event: PointerEvent): void {
    const index = pointerTypeToIndex(event.pointerType);
    const state = this.pointerState[index];
    state.isDown = false;
  }

  protected pointerOut(event: PointerEvent): void {
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
    this.scrollWheelState.delta = new Vector3(event.deltaX, event.deltaY, event.deltaZ);
    this.scrollWheelState.client = new Vector2(event.clientX, event.clientY);
    this.scrollWheelState.layer = new Vector2(event.layerX, event.layerY);
    this.scrollWheelState.page = new Vector2(event.pageX, event.pageY);
    this.scrollWheelState.offset = new Vector2(event.offsetX, event.offsetY);
    this.scrollWheelState.screen = new Vector2(event.screenX, event.screenY);
  }
}
