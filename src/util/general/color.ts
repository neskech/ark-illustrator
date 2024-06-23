import { Float32Vector4, Float32Vector3 } from 'matrixgl';
import { Int32Vector3 } from '../webglWrapper/vector';
import { requires } from './contracts';

export function hslToHex(h: number, s: number, l: number) {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0'); // convert to Hex and prefix "0" if needed
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

export function hslToRGB(h: number, s: number, l: number): Int32Vector3 {
  let r, g, b;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hueToRgb(p, q, h + 1 / 3);
    g = hueToRgb(p, q, h);
    b = hueToRgb(p, q, h - 1 / 3);
  }

  return new Int32Vector3(Math.round(r * 255), Math.round(g * 255), Math.round(b * 255));
}

export function hslToRGBUnormalizedFloat(h: number, s: number, l: number): Float32Vector3 {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return new Float32Vector3(255 * f(0), 255 * f(8), 255 * f(4));
}

export function hslToRGBNormalized(h: number, s: number, l: number): Float32Vector3 {
  const unorm = hslToRGBUnormalizedFloat(h, s, l);
  return rgbToNormalized(unorm);
}

export function hslAlphaToRGBA(h: number, s: number, l: number, alpha: number): Float32Vector4 {
  requires(0 <= alpha && alpha <= 1);
  const unorm = hslToRGBUnormalizedFloat(h, s, l);
  const norm = rgbToNormalized(unorm);
  return new Float32Vector4(norm.x, norm.y, norm.z, alpha);
}

export function rgbToNormalized(rgb: Int32Vector3 | Float32Vector3): Float32Vector3 {
  return new Float32Vector3(rgb.x / 255, rgb.y / 255, rgb.z / 255);
}

function hueToRgb(p: number, q: number, t: number): number {
  if (t < 0) t += 1;
  if (t > 1) t -= 1;
  if (t < 1 / 6) return p + (q - p) * 6 * t;
  if (t < 1 / 2) return q;
  if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
  return p;
}

export function rgbaToHsl(r: number, g: number, b: number): Float32Vector3 {
  r = r / 255;
  g = g / 255;
  b = b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = (max + min) / 2;
  let s = (max + min) / 2;
  const l = (max + min) / 2;

  if (max == min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }

    h /= 6;
  }

  return new Float32Vector3(h, s, l);
}
