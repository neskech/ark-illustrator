import { Float32Vector3 } from 'matrixgl';
import BezierFunction from '~/util/general/bezierFunction';
import type Texture from '~/util/webglWrapper/texture';
import { TextureCreator } from '~/util/webglWrapper/texture';
import { type Option, Some } from '~/util/general/option';
import EventManager from '~/util/eventSystem/eventManager';

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
//! BASE BRUSH SETTINGS
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

type BaseBrushSettingsArgs = {
  size: number;
  opacity: number;
  minSize: number;
  maxSize: number;
  minOpacity: number;
  maxOpacity: number;
  isEraser: boolean;
  pressureSizeSettings: BezierFunction;
  pressureOpacitySettings: BezierFunction;
};
export abstract class BaseBrushSettings {
  public size: number;
  public opacity: number;
  public minSize: number;
  public maxSize: number;
  public minOpacity: number;
  public maxOpacity: number;
  public isEraser: boolean;
  public pressureSizeSettings: BezierFunction;
  public pressureOpacitySettings: BezierFunction;

  constructor(args: BaseBrushSettingsArgs) {
    this.size = args.size;
    this.opacity = args.opacity;
    this.minSize = args.minSize;
    this.maxSize = args.maxSize;
    this.minOpacity = args.minOpacity;
    this.maxOpacity = args.maxOpacity;
    this.isEraser = args.isEraser;
    this.pressureSizeSettings = args.pressureOpacitySettings;
    this.pressureOpacitySettings = args.pressureOpacitySettings;
  }

  getSizeGivenPressure(pressure: number): number {
    const min = this.size * this.minSize;
    const max = this.size * this.maxSize;
    const range = max - min;
    //const p = settings.pressureSizeSettings.sampleY(pressure)
    return range * pressure + min;
  }

  getOpacityGivenPressure(pressure: number): number {
    const min = this.opacity * this.minOpacity;
    const max = this.opacity * this.maxOpacity;
    const range = max - min;
    //const p = settings.pressureOpacitySettings.sampleY(pressure)
    return range * pressure + min;
  }
}

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
//! STAMP BRUSH SETTINGS
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

const DEFAULT_TEXTURE =
  'https://cdn.discordapp.com/attachments/760962934217244702/1255650605792366612/mmorgan_240612_17778.jpg?ex=66808a41&is=667f38c1&hm=d7f8a1e1fb789240258e022ccc9b9f5f3267fd6ac22643dc54a5afbd6ce8a44f&';
interface StampBrushSettingsArgs extends BaseBrushSettingsArgs {
  flow: number;
  stabilization: number;
  color: Float32Vector3;
  texture: Option<Texture>;
}

export class StampBrushSettings extends BaseBrushSettings {
  public flow: number;
  public stabilization: number;
  public color: Float32Vector3;
  public texture: Option<Texture>;

  constructor(args: StampBrushSettingsArgs) {
    super(args);
    this.flow = args.flow;
    this.stabilization = args.stabilization;
    this.color = args.color;
    this.texture = args.texture;
    this.setupEvents();
  }

  private setupEvents() {
    EventManager.subscribe('colorChanged', (color) => {
      this.color = color;
    });
  }

  static async default(): Promise<StampBrushSettings> {
    const brushTexture = await TextureCreator.allocateFromImageUrlAsync({
      url: DEFAULT_TEXTURE,
      texureOptions: {
        wrapX: 'Repeat',
        wrapY: 'Repeat',
        magFilter: 'Linear',
        minFilter: 'Linear',
        format: 'RGBA',
      },
    });

    return new StampBrushSettings({
      size: 0.08,
      opacity: 1.0,
      minSize: 0.3,
      maxSize: 1.0,
      minOpacity: 0.2,
      maxOpacity: 0.9,
      flow: 0.02,
      stabilization: 0.25,
      pressureSizeSettings: BezierFunction.getLinearBezier(),
      pressureOpacitySettings: BezierFunction.getLinearBezier(),
      color: new Float32Vector3(0, 0, 0),
      isEraser: false,
      texture: Some(brushTexture.unwrap()),
    });
  }
}

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
//! LINE BRUSH SETTINGS
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

interface LineBrushSettingsArgs extends BaseBrushSettingsArgs {
  flow: number;
  diff: number;
  color: Float32Vector3;
}

export class LineBrushSettings extends BaseBrushSettings {
  public flow: number;
  public color: Float32Vector3;
  public diff: number;

  constructor(args: LineBrushSettingsArgs) {
    super(args);
    this.flow = args.flow;
    this.color = args.color;
    this.diff = args.diff;
    this.setupEvents();
  }

  private setupEvents() {
    EventManager.subscribe('colorChanged', (color) => {
      this.color = color;
    });
  }

  static default(): LineBrushSettings {
    return new LineBrushSettings({
      size: 0.08,
      opacity: 1.0,
      minSize: 0.3,
      maxSize: 1.0,
      minOpacity: 0.2,
      maxOpacity: 0.9,
      flow: 0.02,
      pressureSizeSettings: BezierFunction.getLinearBezier(),
      pressureOpacitySettings: BezierFunction.getLinearBezier(),
      color: new Float32Vector3(0, 0, 0),
      isEraser: false,
      diff: 0.5,
    });
  }
}
