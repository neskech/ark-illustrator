import {
  type GetAttributesType,
  VertexAttributes,
  VertexAttributeType,
} from '~/drawingEditor/webgl/vertexAttributes';
import { VertexArrayObject } from '~/drawingEditor/webgl/vertexArray';
import { QuadilateralFactory } from '../../geometry/quadFactory';
import type Shader from '~/drawingEditor/webgl/shader';
import Buffer from '~/drawingEditor/webgl/buffer';
import { Float32Vector3 } from 'matrixgl';
import { type BrushPoint } from '~/drawingEditor/canvas/toolSystem/tools/brush';
import { type BrushSettings } from '~/drawingEditor/canvas/toolSystem/settings/brushSettings';
import { angle, displacement } from '~/drawingEditor/webgl/vector';
import { QuadTransform } from '../../geometry/transform';
import { QuadPositioner } from '../../geometry/positioner';
import { QuadRotator } from '../../geometry/rotator';
import Texture from '~/drawingEditor/webgl/texture';
import EventManager from '~/util/eventSystem/eventManager';
import type FrameBuffer from '~/drawingEditor/webgl/frameBuffer';
import { clearFramebuffer } from '../../util';
import CanvasRenderModule, { type CanvasRenderModuleArgs } from '../canvasRenderModule';

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
//! CONSTANTS
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

export const MAX_POINTS_PER_FRAME = 10000;

const NUM_VERTICES_QUAD = 6;
const VERTEX_SIZE_POS_COLOR_TEX_OPACITY = 8;
const MAX_SIZE_STROKE =
  MAX_POINTS_PER_FRAME * NUM_VERTICES_QUAD * VERTEX_SIZE_POS_COLOR_TEX_OPACITY;

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

type BrushModuleArgs = CanvasRenderModuleArgs;

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
//! MAIN CLASS
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

export default class BrushModule extends CanvasRenderModule {
  private vertexArray: VertexArrayObject<StrokeAttribsType>;
  private vertexBuffer: Buffer;
  private quadFactory: QuadilateralFactory<StrokeAttribsType>;
  private shader: Shader;

  constructor(args: BrushModuleArgs) {
    super(args);
    this.vertexArray = new VertexArrayObject(this.gl, strokeVertexAttributes);
    this.vertexBuffer = new Buffer(this.gl, {
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
    this.shader = this.assetManager.getShader('stroke');
    this.initBuffer();
  }

  private initBuffer() {
    this.setupEvents();

    this.vertexArray.bind(this.gl);
    this.vertexBuffer.bind(this.gl);

    this.vertexArray.applyAttributes(this.gl);
    this.vertexBuffer.allocateWithData(this.gl, new Float32Array(MAX_SIZE_STROKE));

    this.vertexArray.unBind(this.gl);
    this.vertexBuffer.unBind(this.gl);
  }

  private renderStroke(
    points: BrushPoint[],
    brushSettings: BrushSettings,
    framebuffer: FrameBuffer
  ) {
    framebuffer.bind(this.gl);
    this.vertexArray.bind(this.gl);
    this.vertexBuffer.bind(this.gl);
    this.shader.use(this.gl);

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

    this.shader.uploadFloat(this.gl, 'flow', brushSettings.flow);
    this.shader.uploadTexture(this.gl, 'tex', brushSettings.texture.unwrap(), 0);

    const bufSize = points.length * NUM_VERTICES_QUAD * VERTEX_SIZE_POS_COLOR_TEX_OPACITY;
    const buf = new Float32Array(bufSize);

    let i = 0;
    for (const [j, p] of points.enumerate()) {
      const opacity_ = brushSettings.getOpacityGivenPressure(p.pressure);
      const opacity = brushSettings.isEraser ? 1 - opacity_ : opacity_;
      const color = brushSettings.isEraser ? new Float32Vector3(1, 1, 1) : brushSettings.color;

      let ang = 0;

      if (points.length >= 2) {
        const after = j < points.length - 1 ? points[j + 1] : points[j - 1];
        ang = angle(displacement(p.position, after.position));
      }

      i = this.quadFactory.emplaceSquare({
        size: brushSettings.getSizeGivenPressure(p.pressure),
        transform: QuadTransform.builder()
          .position(QuadPositioner.center(p.position))
          .rotate(QuadRotator.center(ang + Math.PI / 2))
          .build(),
        buffer: buf,
        offset: i,
        attributes: QuadilateralFactory.attributesForAllFourSides({
          opacity,
          color: [color.x, color.y, color.z],
        }),
      });
    }

    this.vertexBuffer.addData(this.gl, buf);

    this.gl.drawArrays(this.gl.TRIANGLES, 0, NUM_VERTICES_QUAD * points.length);

    this.shader.stopUsing(this.gl);
    this.vertexArray.unBind(this.gl);
    this.vertexBuffer.unBind(this.gl);
    brushSettings.texture.unwrap().unBind(this.gl);
    framebuffer.unBind(this.gl);
  }

  private renderStrokeToOverlay(points: BrushPoint[], brushSettings: BrushSettings) {
    if (points.length == 0) return;

    this.overlayRenderer.renderCanvasToOverlay(
      this.canvasFramebuffer,
      this.canvasOverlayFramebuffer
    );
    this.renderStroke(points, brushSettings, this.canvasOverlayFramebuffer);
    this.isOverlayFramebufferEmpty(false);
  }

  private renderStrokeToCanvas(points: BrushPoint[], brushSettings: BrushSettings) {
    if (points.length == 0) return;
    this.renderStroke(points, brushSettings, this.canvasFramebuffer);
  }

  private clearOverlayFramebuffer() {
    clearFramebuffer(this.gl, this.canvasOverlayFramebuffer, 1, 1, 1, 1);
    this.isOverlayFramebufferEmpty(true);
  }

  private setupEvents() {
    EventManager.subscribe('brushStrokeContinued', ({ pointData, currentSettings }) => {
      //refresh so there aren't multiple strokes
      this.clearOverlayFramebuffer();
      this.renderStrokeToOverlay(pointData, currentSettings);
    });

    EventManager.subscribe('brushStrokEnd', ({ pointData, currentSettings }) => {
      this.renderStrokeToCanvas(pointData, currentSettings);
    });

    EventManager.subscribe('brushStrokCutoff', ({ pointData, currentSettings }) => {
      this.renderStrokeToCanvas(pointData, currentSettings);
      // the world module uses our overlay buffer. We just now rendered to this canvas, but our overlay buffer has been cleared
      // so we need to make sure the overlay buffer is the same as the canvas
      this.clearOverlayFramebuffer();
      this.overlayRenderer.renderCanvasToOverlay(
        this.canvasFramebuffer,
        this.canvasOverlayFramebuffer
      );
    });
  }
}
