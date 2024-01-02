import { Float32Vector3 } from 'matrixgl';
import BezierFunction from '~/application/drawingEditor/misc/bezierFunction';
import { type GL } from '~/application/drawingEditor/webgl/glUtils';
import Texture from '~/application/drawingEditor/webgl/texture';
import { type Option, Some } from '~/application/general/option';

export interface BrushSettings {
  size: number;
  opacity: number;
  minSize: number;
  maxSize: number;
  minOpacity: number;
  maxOpacity: number;
  flow: number;
  stabilization: number;
  spacing: 'auto' | number;
  pressureSizeSettings: BezierFunction;
  pressureOpacitySettings: BezierFunction;
  color: Float32Vector3;
  isEraser: boolean;
  texture: Option<Texture>;
}

export function defaultBrushSettings(gl: GL): BrushSettings {
  const brushTexture = new Texture(gl, {
    wrapX: 'Repeat',
    wrapY: 'Repeat',
    magFilter: 'Linear',
    minFilter: 'Linear',
    format: 'RGBA',
  });
  brushTexture.allocateFromImageUrl(
    gl,
    'https://cdn.discordapp.com/attachments/627737740078743576/1163574991271493722/solid-circle-png-thumb16.png?ex=654012a8&is=652d9da8&hm=8ac2701699f2763a665a4c35b8603834684ad74ee7876243294352b7abe28e6c&',
    false
  );

  return {
    size: 0.08,
    opacity: 1.0,
    minSize: 0.3,
    maxSize: 1.0,
    minOpacity: 0.2,
    maxOpacity: 0.9,
    flow: 0.02,
    stabilization: 0.25,
    spacing: 0.0005,
    pressureSizeSettings: BezierFunction.getLinearBezier(),
    pressureOpacitySettings: BezierFunction.getLinearBezier(),
    color: new Float32Vector3(0, 0, 0),
    isEraser: false,
    texture: Some(brushTexture),
  };
}

export function getSizeGivenPressure(settings: Readonly<BrushSettings>, pressure: number): number {
  const min = settings.size * settings.minSize;
  const max = settings.size * settings.maxSize;
  const range = max - min;
  //const p = settings.pressureSizeSettings.sampleY(pressure)
  return range * pressure + min;
}

export function getOpacityGivenPressure(
  settings: Readonly<BrushSettings>,
  pressure: number
): number {
  const min = settings.opacity * settings.minOpacity;
  const max = settings.opacity * settings.maxOpacity;
  const range = max - min;
  //const p = settings.pressureOpacitySettings.sampleY(pressure)
  return range * pressure + min;
}
