import { Float32Vector2, Float32Vector3 } from 'matrixgl';
import {
  type BrushPoint,
  type BrushSettings,
  getOpacityGivenPressure,
  getSizeGivenPressure,
} from '../canvas/toolSystem/tools/brush';
import { add, angle, copy, displacement, normalize, scale, rotateAbout } from '../webgl/vector';
import { type GL } from '../webgl/glUtils';

type FourSizeArray = [Float32Vector2, Float32Vector2, Float32Vector2, Float32Vector2];
export function constructQuad(
  position: Float32Vector2,
  width: number,
  height: number
): FourSizeArray {
  return [
    //bottom left
    new Float32Vector2(position.x - width / 2, position.y - height / 2),
    //top left
    new Float32Vector2(position.x - width / 2, position.y + height / 2),
    //top right
    new Float32Vector2(position.x + width / 2, position.y + height / 2),
    //bottom right
    new Float32Vector2(position.x + width / 2, position.y - height / 2),
  ];
}

type SixSizeArrayF = [
  Float32Vector2,
  Float32Vector2,
  Float32Vector2,
  Float32Vector2,
  Float32Vector2,
  Float32Vector2
];
export function constructQuadSix(position: Float32Vector2, scale: number): SixSizeArrayF {
  const w = 0.5 * scale;
  const h = 0.5 * scale;
  return [
    //bottom left
    new Float32Vector2(position.x + w, position.y + h),
    //top left
    new Float32Vector2(position.x - w, position.y + h),
    //top right
    new Float32Vector2(position.x - w, position.y - h),
    //bottom right
    new Float32Vector2(position.x - w, position.y - h),

    new Float32Vector2(position.x + w, position.y - h),

    new Float32Vector2(position.x + w, position.y + h),
  ];
}

export function constructQuadSixWidthHeight(
  position: Float32Vector2,
  width: number,
  height: number
): Float32Vector2[] {
  return [
    //bottom left
    new Float32Vector2(position.x + width, position.y + height),
    //top left
    new Float32Vector2(position.x - width, position.y + height),
    //top right
    new Float32Vector2(position.x - width, position.y - height),
    //bottom right
    new Float32Vector2(position.x - width, position.y - height),
    //bottom right
    new Float32Vector2(position.x + width, position.y - height),
    //top right
    new Float32Vector2(position.x + width, position.y + height),
  ];
}

export function constructQuadSixWidthHeightTexture(
  position: Float32Vector2,
  width: number,
  height: number
): Float32Vector2[] {
  return [
    //bottom left
    new Float32Vector2(position.x + width, position.y + height),
    new Float32Vector2(1, 1),
    //top left
    new Float32Vector2(position.x - width, position.y + height),
    new Float32Vector2(0, 1),
    //top right
    new Float32Vector2(position.x - width, position.y - height),
    new Float32Vector2(0, 0),
    //bottom right
    new Float32Vector2(position.x - width, position.y - height),
    new Float32Vector2(0, 0),
    //bottom right
    new Float32Vector2(position.x + width, position.y - height),
    new Float32Vector2(1, 0),
    //top right
    new Float32Vector2(position.x + width, position.y + height),
    new Float32Vector2(1, 1),
  ];
}

export function constructQuadSixTex(position: Float32Vector2, scale: number): Float32Vector2[] {
  const w = 0.5 * scale;
  const h = 0.5 * scale;
  return [
    //top right
    new Float32Vector2(position.x + w, position.y + h),
    new Float32Vector2(1, 1),

    //top left
    new Float32Vector2(position.x - w, position.y + h),
    new Float32Vector2(0, 1),

    //bottom left
    new Float32Vector2(position.x - w, position.y - h),
    new Float32Vector2(0, 0),

    //bottom left
    new Float32Vector2(position.x - w, position.y - h),
    new Float32Vector2(0, 0),

    //bottom right
    new Float32Vector2(position.x + w, position.y - h),
    new Float32Vector2(1, 0),

    //top right
    new Float32Vector2(position.x + w, position.y + h),
    new Float32Vector2(1, 1),
  ];
}

export function constructQuadSixPressureNormal(
  start: BrushPoint,
  end: BrushPoint,
  settings: Readonly<BrushSettings>,
  prevNormal: Float32Vector2 | null,
  s: number
): [Float32Vector2, Float32Vector2[]] {
  const sizeTop = getSizeGivenPressure(settings, end.pressure);
  const sizeBottom = getSizeGivenPressure(settings, start.pressure);

  const disp = displacement(start.position, end.position);
  const normal = normalize(new Float32Vector2(disp.y, -disp.x));

  const normalBottom = prevNormal ?? scale(copy(normal), sizeBottom);
  const normalTop = scale(normal, sizeTop);

  return [
    normalTop,
    [
      //top right
      add(copy(end.position), scale(copy(normalTop), -1)),
      new Float32Vector2(1 * s, 1 * s),

      //top left
      add(copy(end.position), normalTop),
      new Float32Vector2(0, 1 * s),

      //bottom left
      add(copy(start.position), normalBottom),
      new Float32Vector2(0, 0),

      //bottom left
      add(copy(start.position), normalBottom),
      new Float32Vector2(0, 0),

      //bottom right
      add(copy(start.position), scale(copy(normalBottom), -1)),
      new Float32Vector2(1 * s, 0),

      //top right
      add(copy(end.position), scale(copy(normalTop), -1)),
      new Float32Vector2(1 * s, 1 * s),
    ],
  ];
}

export function constructQuadSixPressureNormalUV(
  start: BrushPoint,
  end: BrushPoint,
  settings: Readonly<BrushSettings>,
  prevNormal: Float32Vector2 | null,
  uvStart: number,
  uvEnd: number
): [Float32Vector2, Float32Vector2[]] {
  const sizeTop = getSizeGivenPressure(settings, end.pressure);
  const sizeBottom = getSizeGivenPressure(settings, start.pressure);

  const disp = displacement(start.position, end.position);
  const normal = normalize(new Float32Vector2(disp.y, -disp.x));

  const normalBottom = prevNormal ?? scale(copy(normal), sizeBottom);
  const normalTop = scale(normal, sizeTop);

  return [
    normalTop,
    [
      //top right
      add(copy(end.position), scale(copy(normalTop), -1)),
      new Float32Vector2(1, uvEnd),

      //top left
      add(copy(end.position), normalTop),
      new Float32Vector2(0, uvEnd),

      //bottom left
      add(copy(start.position), normalBottom),
      new Float32Vector2(0, uvStart),

      //bottom left
      add(copy(start.position), normalBottom),
      new Float32Vector2(0, uvStart),

      //bottom right
      add(copy(start.position), scale(copy(normalBottom), -1)),
      new Float32Vector2(1, uvStart),

      //top right
      add(copy(end.position), scale(copy(normalTop), -1)),
      new Float32Vector2(1, uvEnd),
    ],
  ];
}

export function constructLinesSixPressureNormal(
  start: BrushPoint,
  end: BrushPoint,
  settings: Readonly<BrushSettings>,
  prevNormal: Float32Vector2 | null
): [Float32Vector2, Float32Vector2[]] {
  const sizeTop = getSizeGivenPressure(settings, end.pressure);
  const sizeBottom = getSizeGivenPressure(settings, start.pressure);

  const disp = displacement(start.position, end.position);
  const normal = normalize(new Float32Vector2(disp.y, -disp.x));

  const normalBottom = prevNormal ?? scale(copy(normal), sizeBottom);
  const normalTop = scale(normal, sizeTop);

  return [
    normalTop,
    [
      //top left
      add(copy(end.position), normalTop),
      new Float32Vector2(0, 1),

      //top right
      add(copy(end.position), scale(copy(normalTop), -1)),
      new Float32Vector2(1, 1),

      //bottom left
      add(copy(start.position), normalBottom),
      new Float32Vector2(0, 0),

      //bottom right
      add(copy(start.position), scale(copy(normalBottom), -1)),
      new Float32Vector2(1, 0),

      //bottom left
      add(copy(start.position), normalBottom),
      new Float32Vector2(0, 0),

      //top left
      add(copy(end.position), normalTop),
      new Float32Vector2(0, 1),

      //bottom right
      add(copy(start.position), scale(copy(normalBottom), -1)),
      new Float32Vector2(1, 0),

      //top right
      add(copy(end.position), scale(copy(normalTop), -1)),
      new Float32Vector2(1, 1),
    ],
  ];
}

type SixSizeArray = [number, number, number, number, number, number];
export function constructQuadIndices(offset: number): SixSizeArray {
  return [
    //lower triangle -- bottom right -> top left -> bottom left
    3 + offset,
    1 + offset,
    0 + offset,
    //upper triangle -- bottom right -> top right -> top left
    3 + offset,
    2 + offset,
    1 + offset,
  ];
}

export function emplaceQuads(
  buffer: Float32Array,
  curve: BrushPoint[],
  settings: Readonly<BrushSettings>
) {
  let i = 0;

  for (const p of curve) {
    const size = getSizeGivenPressure(settings, p.pressure);
    const opacity = getOpacityGivenPressure(settings, p.pressure);
    const quadVerts = constructQuadSixTex(p.position, size);
    const color = settings.isEraser ? new Float32Vector3(1, 1, 1) : settings.color;

    for (let k = 0; k < quadVerts.length; k += 2) {
      const pos = quadVerts[k];
      const tex = quadVerts[k + 1];

      buffer[i++] = pos.x;
      buffer[i++] = pos.y;
      buffer[i++] = color.x;
      buffer[i++] = color.y;
      buffer[i++] = color.z;
      buffer[i++] = tex.x;
      buffer[i++] = tex.y;
      buffer[i++] = settings.isEraser ? 1 - opacity : opacity;
    }
  }
}

export function emplaceQuadsAngled(
  buffer: Float32Array,
  curve: BrushPoint[],
  settings: Readonly<BrushSettings>
) {
  let i = 0;

  let ang = 0;
  for (let a = 0; a < curve.length; a++) {
    const p = curve[a];
    const p2 = a < curve.length - 1 ? curve[a + 1] : null;
    ang = p2 != null ? angle(displacement(p.position, p2.position)) : ang;

    const size = getSizeGivenPressure(settings, p.pressure);
    const opacity = getOpacityGivenPressure(settings, p.pressure);
    const quadVerts = constructQuadSixTex(p.position, size);

    const centroid = new Float32Vector2(p.position.x + size / 2, p.position.y + size / 2);

    for (let k = 0; k < quadVerts.length; k += 2) {
      const pos = rotateAbout(quadVerts[k], centroid, ang);
      const tex = quadVerts[k + 1];

      buffer[i++] = pos.x;
      buffer[i++] = pos.y;
      buffer[i++] = tex.x;
      buffer[i++] = tex.y;
      buffer[i++] = opacity;
    }
  }
}

export function emplaceQuadsStretched(
  buffer: Float32Array,
  curve: BrushPoint[],
  settings: Readonly<BrushSettings>
) {
  let i = 0;

  const uvLength = 30;

  let prevNormal = null;
  for (let a = 0; a < curve.length - 1; a++) {
    const p = curve[a];
    const p2 = curve[a + 1];

    const uvLow = a / uvLength - Math.floor(a / uvLength);
    const uvHigh = (a + 1) / uvLength - Math.floor((a + 1) / uvLength);

    const opacity = getOpacityGivenPressure(settings, p.pressure);
    const [pNorm, quadVerts] = constructQuadSixPressureNormalUV(
      p,
      p2,
      settings,
      prevNormal,
      uvLow,
      uvHigh
    );
    prevNormal = pNorm;

    for (let k = 0; k < quadVerts.length; k += 2) {
      const pos = quadVerts[k];
      const tex = quadVerts[k + 1];

      buffer[i++] = pos.x;
      buffer[i++] = pos.y;
      buffer[i++] = tex.x;
      buffer[i++] = tex.y;
      buffer[i++] = opacity;
    }
  }
}

export function clearScreen(gl: GL, r = 1, g = 1, b = 1, a = 1) {
  gl.clearColor(r, g, b, a);
  gl.clear(gl.COLOR_BUFFER_BIT);
}
