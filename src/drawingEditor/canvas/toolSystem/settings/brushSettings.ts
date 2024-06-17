import { Float32Vector3 } from 'matrixgl';
import BezierFunction from '~/util/general/bezierFunction';
import { type GL } from '~/drawingEditor/webgl/glUtils';
import Texture from '~/drawingEditor/webgl/texture';
import { type Option, Some } from '~/util/general/option';
import EventManager from '~/util/eventSystem/eventManager';

const DEFAULT_TEXTURE =
  'https://cdn.discordapp.com/attachments/960353053842735144/1250664441037717606/file_1.png?ex=667060c6&is=666f0f46&hm=3a2da93c057ccfe37acab8b7430ef820acab6bad27c0e82f56ec68c82da58966&';
interface BrushSettings_ {
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

export class BrushSettings {
  public size: number;
  public opacity: number;
  public minSize: number;
  public maxSize: number;
  public minOpacity: number;
  public maxOpacity: number;
  public flow: number;
  public stabilization: number;
  public spacing: 'auto' | number;
  public pressureSizeSettings: BezierFunction;
  public pressureOpacitySettings: BezierFunction;
  public color: Float32Vector3;
  public isEraser: boolean;
  public texture: Option<Texture>;

  constructor(settings: BrushSettings_) {
    this.size = settings.size;
    this.opacity = settings.opacity;
    this.minSize = settings.minSize;
    this.maxSize = settings.maxSize;
    this.minOpacity = settings.minOpacity;
    this.maxOpacity = settings.maxOpacity;
    this.flow = settings.flow;
    this.stabilization = settings.stabilization;
    this.spacing = settings.spacing;
    this.pressureSizeSettings = settings.pressureSizeSettings;
    this.pressureOpacitySettings = settings.pressureOpacitySettings;
    this.color = settings.color;
    this.isEraser = settings.isEraser;
    this.texture = settings.texture;
    this.setupEvents()
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

  private setupEvents() {
    EventManager.subscribe('colorChanged', (color) => {
      this.color = color;
    });
  }

  static default(gl: GL): BrushSettings {
    const brushTexture = new Texture(gl, {
      wrapX: 'Repeat',
      wrapY: 'Repeat',
      magFilter: 'Linear',
      minFilter: 'Linear',
      format: 'RGBA',
    });
    brushTexture.allocateFromImageUrl(gl, DEFAULT_TEXTURE, false);

    return new BrushSettings({
      size: 0.08,
      opacity: 1.0,
      minSize: 0.3,
      maxSize: 1.0,
      minOpacity: 0.2,
      maxOpacity: 0.9,
      flow: 0.02,
      stabilization: 0.25,
      spacing: 0.0001,
      pressureSizeSettings: BezierFunction.getLinearBezier(),
      pressureOpacitySettings: BezierFunction.getLinearBezier(),
      color: new Float32Vector3(0, 0, 0),
      isEraser: false,
      texture: Some(brushTexture),
    });
  }
}
