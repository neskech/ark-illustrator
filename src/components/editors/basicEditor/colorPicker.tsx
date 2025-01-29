import { useState, useEffect, useRef } from 'react';
import { None, Some } from '../../../util/general/option';
import { assert } from '~/util/general/contracts';
import EventManager from '~/util/eventSystem/eventManager';
import { Vector3 } from 'matrixgl_fork';

const ColorPicker: React.FC = () => {
  const [hue, setHue] = useState(0);
  const [saturation, setSaturation] = useState(100);
  const [value, setValue] = useState(100);
  const [red, setRed] = useState(Some(255));
  const [green, setGreen] = useState(Some(0));
  const [blue, setBlue] = useState(Some(0));
  const [hex, setHex] = useState(Some('#FF0000'));
  const [isDraggingSatVal, setDraggingSatVal] = useState(false);
  const [isDraggingHue, setDraggingHue] = useState(false);

  const satValRef = useRef<HTMLDivElement>(null);
  const hueRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handlerPointerUp = () => {
      setDraggingSatVal(false);
      setDraggingHue(false);
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (satValRef.current && isDraggingSatVal) {
        const rect = satValRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));

        const s = x * 100;
        const v = (1 - y) * 100;
        setSaturation(s);
        setValue(v);

        const rgb = hsvToRgb(hue, s, v);
        setRed(Some(rgb.r));
        setGreen(Some(rgb.g));
        setBlue(Some(rgb.b));
        setHex(Some(rgbToHex(rgb.r, rgb.g, rgb.b)));
        EventManager.invoke('colorChanged', new Vector3(rgb.r / 255, rgb.g / 255, rgb.b / 255));
      }

      if (hueRef.current && isDraggingHue) {
        const rect = hueRef.current.getBoundingClientRect();
        const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
        const h = y * 360;

        setHue(h);

        const rgb = hsvToRgb(h, saturation, value);
        setRed(Some(rgb.r));
        setGreen(Some(rgb.g));
        setBlue(Some(rgb.b));
        setHex(Some(rgbToHex(rgb.r, rgb.g, rgb.b)));
        EventManager.invoke('colorChanged', new Vector3(rgb.r / 255, rgb.g / 255, rgb.b / 255));
      }
    };

    document.addEventListener('pointerup', handlerPointerUp);
    document.addEventListener('pointermove', handlePointerMove);
    return () => {
      document.removeEventListener('pointerup', handlerPointerUp);
      document.removeEventListener('pointermove', handlePointerMove);
    };
  }, [isDraggingSatVal, isDraggingHue, red, green, blue, hue, saturation, value, hex]);

  useEffect(() => {
    const rgb = hsvToRgb(hue, saturation, value);
    setRed(Some(rgb.r));
    setGreen(Some(rgb.g));
    setBlue(Some(rgb.b));
    setHex(Some(rgbToHex(rgb.r, rgb.g, rgb.b)));
    EventManager.invoke('colorChanged', new Vector3(rgb.r / 255, rgb.g / 255, rgb.b / 255));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRgbChange = (color: 'r' | 'g' | 'b', val: number) => {
    let value = Some(val);
    if (Number.isNaN(val)) value = None();

    value.map((n) => Math.max(0, Math.min(255, n)));

    if (color === 'r') setRed(value);
    if (color === 'g') setGreen(value);
    if (color === 'b') setBlue(value);

    const rgb = {
      r: red.unwrapOrDefault(0),
      g: green.unwrapOrDefault(0),
      b: blue.unwrapOrDefault(0),
    };
    rgb[color] = value.unwrapOrDefault(0);

    const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);

    setHue(hsv.h);
    setSaturation(hsv.s);
    setValue(hsv.v);
    setHex(Some(rgbToHex(rgb.r, rgb.g, rgb.b)));

    EventManager.invoke('colorChanged', new Vector3(rgb.r / 255, rgb.g / 255, rgb.b / 255));
  };

  const handleHexChange = (value: string) => {
    if (!/^#[0-9A-F]*$/i.test(value)) {
      return;
    } else if (value.length > 7) return;
    else if (value.length == 0) {
      setHex(None());
      return;
    }

    setHex(Some(value));
    const remainingLength = 7 - value.length;
    assert(remainingLength >= 0);
    value += '0'.repeat(remainingLength);

    const rgb = hexToRgb(value);
    if (!rgb) return;
    setRed(Some(rgb.r));
    setGreen(Some(rgb.g));
    setBlue(Some(rgb.b));

    const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
    setHue(hsv.h);
    setSaturation(hsv.s);
    setValue(hsv.v);

    EventManager.invoke('colorChanged', new Vector3(rgb.r / 255, rgb.g / 255, rgb.b / 255));
  };

  return (
    <div className="mb-2 mr-1 mt-7 w-full bg-neutral-800 p-3 font-mono text-sm text-neutral-200">
      <div className="mb-4 flex items-center space-x-4">
        <div className="flex-1">
          <div
            ref={satValRef}
            className="relative h-48 w-full cursor-crosshair"
            style={{
              backgroundColor: `hsl(${hue}, 100%, 50%)`,
              backgroundImage:
                'linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, transparent)',
            }}
            onPointerDown={() => setDraggingSatVal(true)}
          >
            <div
              className="absolute h-3 w-3 rounded-full border-2 border-white"
              style={{
                top: `${100 - value}%`,
                right: `${100 - saturation}%`,
                transform: 'translate(50%, -50%)',
                transition: 'none',
              }}
            />
          </div>
        </div>
        <div className="w-6">
          <div
            ref={hueRef}
            className="relative h-48 w-full cursor-pointer"
            style={{
              backgroundImage:
                'linear-gradient(to bottom, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)',
            }}
            onPointerDown={() => setDraggingHue(true)}
          >
            <div
              className="absolute h-1 w-full bg-white"
              style={{
                top: `${(hue / 360) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>
      <div
        className="mb-3 h-5 w-full border-[1px] border-light-200"
        style={{
          backgroundColor: `rgb(${red.unwrapOrDefault(0)}, ${green.unwrapOrDefault(
            0
          )}, ${blue.unwrapOrDefault(0)})`,
        }}
      ></div>
      <div className="mb-4 flex space-x-2">
        {['R', 'G', 'B'].map((color, index) => (
          <div key={color} className="flex-1">
            <div className="m-0 mb-1 text-center">{color}</div>
            <input
              type="number"
              value={[red, green, blue][index].map(String).unwrapOrDefault('')}
              onChange={(e) =>
                handleRgbChange(
                  color.toLowerCase() as 'r' | 'g' | 'b',
                  Number.parseInt(e.target.value)
                )
              }
              className="w-full rounded bg-neutral-700 p-1 text-center !outline-none focus:border-transparent focus:ring-0"
              min={0}
              max={255}
            />
          </div>
        ))}
      </div>
      <div className="flex-col items-center justify-center gap-2">
        <div className="flex space-x-2">
          <div className="w-12 rounded bg-neutral-700 p-1 text-center">#</div>
          <input
            type="text"
            value={hex.map((s) => s.slice(1)).unwrapOrDefault('')}
            onChange={(e) => handleHexChange(`#${e.target.value}`)}
            className="flex-1 rounded bg-neutral-700 p-1 text-center uppercase !outline-none focus:border-transparent focus:ring-0"
            maxLength={6}
          />
        </div>
      </div>
    </div>
  );
};

export default ColorPicker;

// Utility functions for color conversions
function hsvToRgb(h: number, s: number, v: number) {
  s /= 100;
  v /= 100;
  const i = Math.floor(h / 60);
  const f = h / 60 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);
  let r, g, b;
  if (i === 0) [r, g, b] = [v, t, p];
  else if (i === 1) [r, g, b] = [q, v, p];
  else if (i === 2) [r, g, b] = [p, v, t];
  else if (i === 3) [r, g, b] = [p, q, v];
  else if (i === 4) [r, g, b] = [t, p, v];
  else [r, g, b] = [v, p, q];
  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
}

function rgbToHsv(r: number, g: number, b: number) {
  r /= 255;
  g /= 255;
  b /= 255;
  const maxc = Math.max(r, g, b);
  const minc = Math.min(r, g, b);
  if (minc == maxc) return { h: 0.0, s: 0.0, v: maxc * 100 };

  const s = maxc == 0 ? 0 : (maxc - minc) / maxc;
  const R = (maxc - r) / (maxc - minc);
  const G = (maxc - g) / (maxc - minc);
  const B = (maxc - b) / (maxc - minc);

  let h;
  if (r == maxc) h = (60 * (G - B) + 360) % 360;
  else if (g == maxc) h = (60 * (B - R) + 120) % 360;
  else h = (60 * (R - G) + 240) % 360;

  return { h: h, s: s * 100, v: maxc * 100 };
}

function rgbToHex(r: number, g: number, b: number) {
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
}

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: Number.parseInt(result[1], 16),
        g: Number.parseInt(result[2], 16),
        b: Number.parseInt(result[3], 16),
      }
    : null;
}
