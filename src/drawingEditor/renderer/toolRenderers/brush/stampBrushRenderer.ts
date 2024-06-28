import { type StampBrushSettings } from '~/drawingEditor/Input/toolSystem/settings/brushSettings';
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
import Texture from '~/util/webglWrapper/texture';
import { gl } from '~/drawingEditor/application';
import { Float32Vector3 } from 'matrixgl';
import { angle, displacement } from '~/util/webglWrapper/vector';
import { QuadTransform } from '../../geometry/transform';
import { QuadPositioner } from '../../geometry/positioner';
import { QuadRotator } from '../../geometry/rotator';

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
export default class StampBrushRenderer extends BrushImplementationRenderer {
  private vertexArray: VertexArrayObject<StrokeAttribsType>;
  private vertexBuffer: Buffer;
  private quadFactory: QuadilateralFactory<StrokeAttribsType>;
  private shader: Shader;
  private brushSettings: StampBrushSettings;

  constructor(assetManager: AssetManager, brushSettings: StampBrushSettings) {
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

    Texture.activateUnit(0);
    this.brushSettings.texture.unwrap().bind();

    if (this.brushSettings.isEraser) gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    else gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE);

    this.shader.uploadFloat('flow', this.brushSettings.flow);
    this.shader.uploadTexture('tex', this.brushSettings.texture.unwrap(), 0);

    const bufSize = points.length * NUM_VERTICES_QUAD * VERTEX_SIZE_POS_COLOR_TEX_OPACITY;
    const buf = new Float32Array(bufSize);

    let i = 0;
    for (const [j, p] of points.enumerate()) {
      const opacity_ = this.brushSettings.getOpacityGivenPressure(p.pressure);
      const opacity = this.brushSettings.isEraser ? 1 - opacity_ : opacity_;
      const color = this.brushSettings.isEraser
        ? new Float32Vector3(1, 1, 1)
        : this.brushSettings.color;

      let ang = 0;

      if (points.length >= 2) {
        const after = j < points.length - 1 ? points[j + 1] : points[j - 1];
        ang = angle(displacement(p.position, after.position));
      }

      i = this.quadFactory.emplaceSquare({
        size: this.brushSettings.getSizeGivenPressure(p.pressure),
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
    this.brushSettings.texture.unwrap().unBind();
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
