import {
  type GetAttributesType,
  VertexAttributes,
  VertexAttributeType,
} from '~/drawingEditor/webgl/vertexAttributes';
import { VertexArrayObject } from '~/drawingEditor/webgl/vertexArray';
import { QuadilateralFactory } from '../geometry/quadFactory';
import type Shader from '~/drawingEditor/webgl/shader';
import Buffer from '~/drawingEditor/webgl/buffer';
import { Float32Vector2, Float32Vector3 } from 'matrixgl';
import { type BrushPoint } from '~/drawingEditor/canvas/toolSystem/tools/brush';
import { type BrushSettings } from '~/drawingEditor/canvas/toolSystem/settings/brushSettings';
import { angleBetween } from '~/drawingEditor/webgl/vector';
import { QuadTransform } from '../geometry/transform';
import { QuadPositioner } from '../geometry/positioner';
import { QuadRotator } from '../geometry/rotator';
import Texture from '~/drawingEditor/webgl/texture';
import EventManager from '~/util/eventSystem/eventManager';
import type FrameBuffer from '~/drawingEditor/webgl/frameBuffer';
import { clearScreen } from '../util';
import CanvasRenderModule, { type CanvasRenderModuleArgs } from './canvasRenderModule';

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
//! CONSTANTS
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

export const MAX_POINTS_PER_FRAME = 10000;

const SCREEN_ORIGIN = new Float32Vector2(0, 0);
const SCREEN_WIDTH = 1;
const SCREEN_HEIGHT = 1;

const NUM_VERTICES_QUAD = 6;

const VERTEX_SIZE_POS_ = 2;
const SIZE_FULL_SCREEN_QUAD = VERTEX_SIZE_POS_ * NUM_VERTICES_QUAD;

const SIZE_FLOAT = 4;
const VERTEX_SIZE_POS_COLOR_TEX_OPACITY = 8;
const MAX_SIZE_STROKE =
  MAX_POINTS_PER_FRAME * NUM_VERTICES_QUAD * VERTEX_SIZE_POS_COLOR_TEX_OPACITY * SIZE_FLOAT;

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
//! TYPE DEFINITIONS
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

const strokeVertexAttributes = new VertexAttributes({
  position: VertexAttributeType.floatList(2),
  color: VertexAttributeType.floatList(3),
  texCord: VertexAttributeType.floatList(2),
  opacity: VertexAttributeType.float(),
});
type StrokeAttribsType = GetAttributesType<typeof strokeVertexAttributes>;

const blitVertexAttributes = new VertexAttributes({
  position: VertexAttributeType.floatList(2),
});
type BlitAttribsType = GetAttributesType<typeof blitVertexAttributes>;

type BrushModuleArgs = CanvasRenderModuleArgs;

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
//! MAIN CLASS
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

export default class BrushModule extends CanvasRenderModule {
  strokeVertexArray: VertexArrayObject<StrokeAttribsType>;
  fullScreenBlitVertexArray: VertexArrayObject<BlitAttribsType>;

  strokeVertexBuffer: Buffer;
  fullScreenBlitVertexBuffer: Buffer;

  quadFactory: QuadilateralFactory<StrokeAttribsType>;

  strokeShader: Shader;
  fullScreenBlitShader: Shader;

  constructor(args: BrushModuleArgs) {
    super(args);

    this.strokeVertexArray = new VertexArrayObject(this.gl, strokeVertexAttributes);
    this.fullScreenBlitVertexArray = new VertexArrayObject(this.gl, blitVertexAttributes);

    this.strokeVertexBuffer = new Buffer(this.gl, {
      btype: 'VertexBuffer',
      usage: 'Static Draw',
    });
    this.fullScreenBlitVertexBuffer = new Buffer(this.gl, {
      btype: 'VertexBuffer',
      usage: 'Static Draw',
    });

    this.quadFactory = new QuadilateralFactory(strokeVertexAttributes, {
      bottomLeft: {
        texCord: [0, 0],
      },
      bottomRight: {
        texCord: [1, 0],
      },
      topLeft: {
        texCord: [0, 1],
      },
      topRight: {
        texCord: [1, 1],
      },
    });

    this.strokeShader = this.assetManager.getShader('stroke');
    this.fullScreenBlitShader = this.assetManager.getShader('blit');
    this.initBuffers();
  }

  private initBuffers() {
    this.setupEvents();

    this.strokeVertexArray.bind(this.gl);
    this.strokeVertexBuffer.bind(this.gl);

    this.strokeVertexArray.applyAttributes(this.gl);
    this.strokeVertexBuffer.allocateWithData(this.gl, new Float32Array(MAX_SIZE_STROKE));

    this.strokeVertexArray.unBind(this.gl);
    this.strokeVertexBuffer.unBind(this.gl);

    this.fullScreenBlitVertexArray.bind(this.gl);
    this.fullScreenBlitVertexBuffer.bind(this.gl);

    this.fullScreenBlitVertexArray.applyAttributes(this.gl);

    const quadBuffer = new Float32Array(SIZE_FULL_SCREEN_QUAD);

    this.quadFactory.emplaceRectangle({
      transform: QuadTransform.builder()
        .position(QuadPositioner.center(SCREEN_ORIGIN))
        .rotate(QuadRotator.identity())
        .build(),
      width: SCREEN_WIDTH,
      height: SCREEN_HEIGHT,
      attributes: {
        bottomLeft: {
          texCord: [0, 0],
        },
        bottomRight: {
          texCord: [1, 0],
        },
        topLeft: {
          texCord: [0, 1],
        },
        topRight: {
          texCord: [1, 1],
        },
      },
      buffer: quadBuffer,
      offset: 0,
    });

    this.fullScreenBlitVertexBuffer.allocateWithData(this.gl, quadBuffer);

    this.fullScreenBlitVertexArray.unBind(this.gl);
    this.fullScreenBlitVertexBuffer.unBind(this.gl);
  }

  private renderCanvasTextureToOverlay() {
    this.gl.blendFunc(this.gl.ONE, this.gl.ZERO);

    const canvasTexture = this.canvasFramebuffer.getTextureAttachment();

    this.fullScreenBlitVertexArray.bind(this.gl);
    this.fullScreenBlitVertexBuffer.bind(this.gl);
    this.fullScreenBlitShader.use(this.gl);

    this.gl.activeTexture(this.gl.TEXTURE0);
    canvasTexture.bind(this.gl);
    this.fullScreenBlitShader.uploadTexture(this.gl, 'canvas', canvasTexture, 0);

    this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);

    canvasTexture.unBind(this.gl);
    this.fullScreenBlitShader.stopUsing(this.gl);
    this.fullScreenBlitVertexArray.unBind(this.gl);
    this.fullScreenBlitVertexBuffer.unBind(this.gl);
  }

  private renderStroke(
    points: BrushPoint[],
    brushSettings: BrushSettings,
    framebuffer: FrameBuffer
  ) {
    framebuffer.bind(this.gl);
    this.strokeVertexArray.bind(this.gl);
    this.strokeVertexBuffer.bind(this.gl);
    this.strokeShader.use(this.gl);

    Texture.activateUnit(this.gl, 0);
    brushSettings.texture.unwrap().bind(this.gl);

    if (brushSettings.isEraser) this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE);
    else
      this.gl.blendFuncSeparate(
        this.gl.SRC_ALPHA,
        this.gl.ONE_MINUS_SRC_ALPHA,
        this.gl.ONE,
        this.gl.ONE
      );

    this.strokeShader.uploadFloat(this.gl, 'flow', brushSettings.flow);
    this.strokeShader.uploadTexture(this.gl, 'tex', brushSettings.texture.unwrap(), 0);

    const bufSize = points.length * NUM_VERTICES_QUAD * VERTEX_SIZE_POS_COLOR_TEX_OPACITY;
    const buf = new Float32Array(bufSize);

    let i = 0;
    for (const [j, p] of points.enumerate()) {
      const opacity_ = brushSettings.getOpacityGivenPressure(p.pressure);
      const opacity = brushSettings.isEraser ? 1 - opacity_ : opacity_;
      const color = brushSettings.isEraser ? new Float32Vector3(1, 1, 1) : brushSettings.color;

      let angle = 0;

      if (points.length >= 2) {
        const after = j < points.length - 1 ? points[j + 1] : points[j - 1];
        angle = angleBetween(p.position, after.position);
      }

      const data = this.quadFactory.makeSquare({
        size: brushSettings.getSizeGivenPressure(p.pressure),
        transform: QuadTransform.builder()
          .position(QuadPositioner.center(p.position))
          .rotate(QuadRotator.center(angle + Math.PI / 2))
          .build(),
        attributes: QuadilateralFactory.attributesForAllFourSides({
          opacity,
          color: [color.x, color.y, color.z],
        }),
      });
      for (const num of data) buf[i++] = num;
    }

    this.strokeVertexBuffer.addData(this.gl, buf);

    this.strokeShader.stopUsing(this.gl);
    this.strokeVertexArray.unBind(this.gl);
    this.strokeVertexBuffer.unBind(this.gl);
    brushSettings.texture.unwrap().unBind(this.gl);
    framebuffer.unBind(this.gl);
  }

  renderStrokeToOverlay(points: BrushPoint[], brushSettings: BrushSettings) {
    if (points.length == 0) return;

    this.renderCanvasTextureToOverlay();
    this.renderStroke(points, brushSettings, this.canvasOverlayFramebuffer);
    this.isOverlayFramebufferIsEmpty(false)
  }

  renderStrokeToCanvas(points: BrushPoint[], brushSettings: BrushSettings) {
    if (points.length == 0) return;

    this.renderStroke(points, brushSettings, this.canvasFramebuffer);
  }

  clearOverlayFramebuffer() {
    this.canvasOverlayFramebuffer.bind(this.gl);
    clearScreen(this.gl, 0, 0, 0, 0);
    this.canvasOverlayFramebuffer.unBind(this.gl);
    this.isOverlayFramebufferIsEmpty(true);
  }

  setupEvents() {
    EventManager.subscribe('brushStrokeContinued', ({ pointData, currentSettings }) => {
      //refresh so there aren't multiple strokes
      this.clearOverlayFramebuffer();
      this.renderStrokeToOverlay(pointData, currentSettings);
    });

    EventManager.subscribe('brushStrokEnd', ({ pointData, currentSettings }) => {
      //TODO: This part is sus
      this.renderStrokeToCanvas(pointData, currentSettings);
      // the world module uses our overlay buffer. We just now rendered to this canvas, but our overlay buffer has been cleared
      // so we need to make sure the overlay buffer is the same as the canvas
      this.clearOverlayFramebuffer();
      this.renderCanvasTextureToOverlay();
    });
  }
}
