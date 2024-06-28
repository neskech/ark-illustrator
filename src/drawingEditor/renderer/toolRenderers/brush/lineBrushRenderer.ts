import { type LineBrushSettings } from '~/drawingEditor/Input/toolSystem/settings/brushSettings';
import {
  BrushImplementationRenderer,
  type BrushRendererContext,
} from './brushImplementationRenderer';
import type AssetManager from '../../util/assetManager';
import { type BrushPoint } from '~/drawingEditor/Input/toolSystem/tools/brushTool/brushTool';
import { clearFramebuffer } from '../../util/renderUtils';
import { QuadilateralFactory } from '../../geometry/quadFactory';
import { VertexArrayObject } from '~/util/webglWrapper/vertexArray';
import type Shader from '~/util/webglWrapper/shader';
import Buffer from '~/util/webglWrapper/buffer';
import {
  type GetAttributesType,
  VertexAttributes,
  VertexAttributeType,
} from '~/util/webglWrapper/vertexAttributes';
import type FrameBuffer from '~/util/webglWrapper/frameBuffer';
import { gl } from '~/drawingEditor/application';

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

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
//! MAIN CLASS
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
export default class LineBrushRenderer extends BrushImplementationRenderer {
  private vertexArray: VertexArrayObject<StrokeAttribsType>;
  private vertexBuffer: Buffer;
  private quadFactory: QuadilateralFactory<StrokeAttribsType>;
  private shader: Shader;
  private brushSettings: LineBrushSettings;

  constructor(assetManager: AssetManager, brushSettings: LineBrushSettings) {
    super('stamp');
    this.brushSettings = brushSettings;
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
    this.shader = assetManager.getShader('stroke');
    this.initBuffer();
  }

  renderBatchedStrokeContinued(context: BrushRendererContext): void {
    clearFramebuffer(context.overlayFramebuffer);
    this.renderStrokeToOverlay(context);
  }

  renderBatchedStrokeFinished(context: BrushRendererContext): void {
    clearFramebuffer(context.overlayFramebuffer);
    this.renderStrokeToCanvas(context);
  }

  renderBatchedStrokePartitioned(context: BrushRendererContext): void {
    clearFramebuffer(context.overlayFramebuffer);
    this.renderStrokeToCanvas(context);
  }

  renderIncrementalStroke(context: BrushRendererContext): void {
    this.renderStrokeToCanvas(context);
  }

  private initBuffer() {
    this.vertexArray.bind();
    this.vertexBuffer.bind();

    this.vertexArray.applyAttributes();
    this.vertexBuffer.allocateWithData(new Float32Array(MAX_SIZE_STROKE));

    this.vertexArray.unBind();
    this.vertexBuffer.unBind();
  }

  private renderStroke(points: BrushPoint[], framebuffer: FrameBuffer) {
    framebuffer.bind();
    this.vertexArray.bind();
    this.vertexBuffer.bind();
    this.shader.bind();

    if (this.brushSettings.isEraser) gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    else gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE);

    this.shader.uploadFloat('flow', this.brushSettings.flow);

    const bufSize = points.length * NUM_VERTICES_QUAD * VERTEX_SIZE_POS_COLOR_TEX_OPACITY;
    const buf = new Float32Array(bufSize);

    let j = 0;
    for (let i = 0; i < points.length - 1; i++) {
      const p = points[i];
      const opacity = this.brushSettings.getOpacityGivenPressure(points[i].pressure);
      const color = this.brushSettings.color;

      j = this.quadFactory.emplaceLine({
        start: points[i].position,
        end: points[i + 1].position,
        thickness: this.brushSettings.getSizeGivenPressure(p.pressure),
        buffer: buf,
        offset: j,
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
    framebuffer.unBind();
  }

  private renderStrokeToOverlay(context: BrushRendererContext) {
    if (context.pointData.length == 0) return;
    this.renderStroke(context.pointData, context.overlayFramebuffer);
  }

  private renderStrokeToCanvas(context: BrushRendererContext) {
    if (context.pointData.length == 0) return;
    this.renderStroke(context.pointData, context.layerManager.getCanvasFramebuffer());
  }
}
