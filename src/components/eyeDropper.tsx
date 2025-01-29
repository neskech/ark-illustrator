import { useEffect, useState } from 'react';
import EventManager from '~/util/eventSystem/eventManager';
import { rgbaToHsl, hslToHex } from '~/util/general/color';
import type FrameBuffer from '~/util/webglWrapper/frameBuffer';
import Camera from '../drawingEditor/renderer/camera';
import { type EyeDropperArgs } from '~/util/eventSystem/eventTypes/canvasEvents';
import { Vector2, Vector3 } from 'matrixgl_fork';

interface RenderObjects {
  canvasFramebuffer: FrameBuffer;
  canvas: HTMLCanvasElement;
}
let renderObjects: RenderObjects | null;
let toggle: ((obj: EyeDropperArgs) => void) | null;
let pointerMove: ((e: MouseEvent) => void) | null;
let pointerUp: (() => void) | null;

function EyeDropper() {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState<Vector2>(new Vector2(0, 0));
  const [color, setColor] = useState<Vector3>(new Vector3(0, 0, 0));

  useEffect(() => {
    removeEvents();

    toggle = (obj: EyeDropperArgs) => {
      setIsVisible((v) => !v);
      renderObjects = {
        canvasFramebuffer: obj.canvasFramebuffer,
        canvas: obj.canvas,
      };
      obj.originPosition.map((p) => setPosition(p));
    };
    EventManager.subscribe('toggleEyeDropper', toggle);
    pointerMove = (e: MouseEvent) => {
      setPosition(new Vector2(e.clientX, e.clientY));
    };
    document.addEventListener('pointermove', pointerMove);

    pointerUp = () => {
      if (!isVisible) return;
      setIsVisible(false);
      EventManager.invoke('colorChanged', new Vector3(color.x / 255, color.y / 255, color.z / 255));
    };
    document.addEventListener('pointerup', pointerUp);
    document.addEventListener('pointercancel', pointerUp);

    return removeEvents;
  }, [isVisible, color]);

  useEffect(() => {
    if (!renderObjects || !isVisible) return;

    const norm = Camera.mouseToNormalized(position, renderObjects.canvas);

    if (norm.x < 0 || norm.x > 1 || norm.y < 0 || norm.y > 1) return;

    const unorm = new Vector2(
      norm.x * renderObjects.canvasFramebuffer.getWidth(),
      norm.y * renderObjects.canvasFramebuffer.getHeight()
    );

    const pixels = new Uint8Array(4);
    renderObjects.canvasFramebuffer.readPixelsTo({
      pixelBuffer: pixels,
      lowerLeftX: Math.floor(unorm.x),
      lowerLeftY: Math.floor(unorm.y),
      width: 1,
      height: 1,
      format: 'RGBA',
    });

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const c = new Vector3(pixels.at(0)!, pixels.at(1)!, pixels.at(2)!).floor();
    setColor(c);
    EventManager.invoke('colorChanged', new Vector3(c.x / 255, c.y / 255, c.z / 255));
  }, [position, isVisible]);

  return (
    <div
      className="absolute z-50 h-[60px] w-[60px] rounded-full border-4 border-black"
      style={{
        top: `${position.y - 60}px`,
        left: `${position.x - 30}px`,
        background: getHslhex(color),
        display: isVisible ? 'block' : 'none',
      }}
    ></div>
  );
}

function getHslhex(color: Vector3): string {
  color = color.floor();
  const hsl = rgbaToHsl(color.x, color.y, color.z);
  hsl.x = Math.floor(hsl.x * 360);
  hsl.y = Math.floor(hsl.y * 100);
  hsl.z = Math.floor(hsl.z * 100);
  return hslToHex(hsl.x, hsl.y, hsl.z);
}

function removeEvents() {
  if (toggle) EventManager.unSubscribe('toggleEyeDropper', toggle);
  if (pointerMove) document.removeEventListener('pointermove', pointerMove);
  if (pointerUp) {
    document.removeEventListener('pointerup', pointerUp);
    document.removeEventListener('pointercancel', pointerUp);
  }
}

export default EyeDropper;
