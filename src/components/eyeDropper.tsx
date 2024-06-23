import { Float32Vector2, Float32Vector3 } from 'matrixgl';
import { useEffect, useState } from 'react';
import EventManager from '~/util/eventSystem/eventManager';
import { rgbaToHsl, hslToHex } from '~/util/general/color';
import type FrameBuffer from '~/util/webglWrapper/frameBuffer';
import { type GL } from '~/util/webglWrapper/glUtils';
import { Int32Vector3 } from '~/util/webglWrapper/vector';
import { mouseToNormalized } from '../drawingEditor/canvas/camera';
import { type EyeDropperArgs } from '~/util/eventSystem/eventTypes/canvasEvents';

interface RenderObjects {
  canvasFramebuffer: FrameBuffer;
  canvas: HTMLCanvasElement;
  gl: GL;
}
let renderObjects: RenderObjects | null;
let toggle: ((obj: EyeDropperArgs) => void) | null;
let pointerMove: ((e: MouseEvent) => void) | null;
let pointerUp: (() => void) | null;

function EyeDropper() {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState<Float32Vector2>(new Float32Vector2(0, 0));
  const [color, setColor] = useState<Int32Vector3>(new Int32Vector3(0, 0, 0));

  useEffect(() => {
    removeEvents();

    toggle = (obj: EyeDropperArgs) => {
      setIsVisible((v) => !v);
      renderObjects = {
        canvasFramebuffer: obj.canvasFramebuffer,
        canvas: obj.canvas,
        gl: obj.gl,
      };
      obj.originPosition.map((p) => setPosition(p));
    };
    EventManager.subscribe('toggleEyeDropper', toggle);

    pointerMove = (e: MouseEvent) => {
      setPosition(new Float32Vector2(e.clientX, e.clientY));
    };
    document.addEventListener('pointermove', pointerMove);

    pointerUp = () => {
      if (!isVisible) return;
      setIsVisible(false);
      EventManager.invoke('colorChanged', new Float32Vector3(color.x, color.y, color.z));
    };
    document.addEventListener('pointerup', pointerUp);
    document.addEventListener('pointercancel', pointerUp);

    return removeEvents;
  }, [isVisible, color]);

  useEffect(() => {
    if (!renderObjects || !isVisible) return;

    const norm = mouseToNormalized(position, renderObjects.canvas);

    if (norm.x < 0 || norm.x > 1 || norm.y < 0 || norm.y > 1) return;

    const unorm = new Float32Vector2(
      norm.x * renderObjects.canvasFramebuffer.getWidth(),
      norm.y * renderObjects.canvasFramebuffer.getHeight()
    );

    const pixels = new Uint8Array(4);
    renderObjects.canvasFramebuffer.readPixelsTo(renderObjects.gl, pixels, {
      lowerLeftX: Math.floor(unorm.x),
      lowerLeftY: Math.floor(unorm.y),
      width: 1,
      height: 1,
      format: 'RGBA',
    });

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    setColor(new Int32Vector3(pixels.at(0)!, pixels.at(1)!, pixels.at(2)!));
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

function getHslhex(color: Int32Vector3): string {
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
