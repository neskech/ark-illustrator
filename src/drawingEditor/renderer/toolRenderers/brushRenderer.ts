import {
  type GetAttributesType,
  VertexAttributes,
  VertexAttributeType,
} from '~/util/webglWrapper/vertexAttributes';
import { VertexArrayObject } from '~/util/webglWrapper/vertexArray';
import type Shader from '~/util/webglWrapper/shader';
import Buffer from '~/util/webglWrapper/buffer';
import { Float32Vector3 } from 'matrixgl';
import { type BrushPoint } from '~/drawingEditor/Input/toolSystem/tools/brush';
import { type BrushSettings } from '~/drawingEditor/Input/toolSystem/settings/brushSettings';
import { angle, displacement } from '~/util/webglWrapper/vector';
import Texture from '~/util/webglWrapper/texture';
import EventManager from '~/util/eventSystem/eventManager';
import type FrameBuffer from '~/util/webglWrapper/frameBuffer';
import type OverlayRenderer from '../utilityRenderers.ts/overlayRenderer';
import type AssetManager from '../util/assetManager';
import { QuadilateralFactory } from '../geometry/quadFactory';
import { gl } from '~/drawingEditor/application';
import { QuadTransform } from '../geometry/transform';
import { QuadPositioner } from '../geometry/positioner';
import { QuadRotator } from '../geometry/rotator';
import { clearFramebuffer } from '../util/util';
import type UtilityRenderers from '../utilityRenderers.ts/utilityRenderers';

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

type BrushRendererArgs = {
  assetManager: AssetManager;
  canvasFramebuffer: FrameBuffer;
  canvasOverlayFramebuffer: FrameBuffer;
  utilityRenderers: UtilityRenderers;
};

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
//! MAIN CLASS
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

export default class BrushToolRenderer {
  private canvasFramebuffer: FrameBuffer;
  private canvasOverlayFramebuffer: FrameBuffer;
  private assetManager: AssetManager;
  private overlayRenderer: OverlayRenderer;
  private vertexArray: VertexArrayObject<StrokeAttribsType>;
  private vertexBuffer: Buffer;
  private quadFactory: QuadilateralFactory<StrokeAttribsType>;
  private shader: Shader;

  constructor(args: BrushRendererArgs) {
    this.canvasFramebuffer = args.canvasFramebuffer;
    this.canvasOverlayFramebuffer = args.canvasOverlayFramebuffer;
    this.assetManager = args.assetManager;
    this.overlayRenderer = args.utilityRenderers.getOverlayRenderer();

    this.vertexArray = new VertexArrayObject(strokeVertexAttributes);
    this.vertexBuffer = new Buffer({
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

  public renderBrushStrokeContinued(pointData: BrushPoint[], currentSettings: BrushSettings) {
    //refresh so there aren't multiple strokes
    this.clearOverlayFramebuffer();
    this.renderStrokeToOverlay(pointData, currentSettings);
  }

  public renderBrushStrokeFinished(pointData: BrushPoint[], currentSettings: BrushSettings) {
    this.renderStrokeToCanvas(pointData, currentSettings);
  }

  public renderBrushStrokeCutoff(pointData: BrushPoint[], currentSettings: BrushSettings) {
    this.renderStrokeToCanvas(pointData, currentSettings);
    // the world module uses our overlay buffer. We just now rendered to this canvas, but our overlay buffer has been cleared
    // so we need to make sure the overlay buffer is the same as the canvas
    this.clearOverlayFramebuffer();
    this.overlayRenderer.renderCanvasToOverlay(
      this.canvasFramebuffer,
      this.canvasOverlayFramebuffer
    );
  }

  private initBuffer() {
    this.setupEvents();

    this.vertexArray.bind();
    this.vertexBuffer.bind();

    this.vertexArray.applyAttributes();
    this.vertexBuffer.allocateWithData(new Float32Array(MAX_SIZE_STROKE));

    this.vertexArray.unBind();
    this.vertexBuffer.unBind();
  }

  private renderStroke(
    points: BrushPoint[],
    brushSettings: BrushSettings,
    framebuffer: FrameBuffer
  ) {
    framebuffer.bind();
    this.vertexArray.bind();
    this.vertexBuffer.bind();
    this.shader.bind();

    Texture.activateUnit(0);
    brushSettings.texture.unwrap().bind();

    if (brushSettings.isEraser) gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    else gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE);

    this.shader.uploadFloat('flow', brushSettings.flow);
    this.shader.uploadTexture('tex', brushSettings.texture.unwrap(), 0);

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

    this.vertexBuffer.addData(buf);

    gl.drawArrays(gl.TRIANGLES, 0, NUM_VERTICES_QUAD * points.length);

    this.shader.unBind();
    this.vertexArray.unBind();
    this.vertexBuffer.unBind();
    brushSettings.texture.unwrap().unBind();
    framebuffer.unBind();
  }

  private renderStrokeToOverlay(points: BrushPoint[], brushSettings: BrushSettings) {
    if (points.length == 0) return;

    this.overlayRenderer.renderCanvasToOverlay(
      this.canvasFramebuffer,
      this.canvasOverlayFramebuffer
    );
    this.renderStroke(points, brushSettings, this.canvasOverlayFramebuffer);
  }

  private renderStrokeToCanvas(points: BrushPoint[], brushSettings: BrushSettings) {
    if (points.length == 0) return;
    this.renderStroke(points, brushSettings, this.canvasFramebuffer);
  }

  private clearOverlayFramebuffer() {
    clearFramebuffer(this.canvasOverlayFramebuffer, 1, 1, 1, 1);
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
