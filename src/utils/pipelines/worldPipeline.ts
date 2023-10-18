import { type GL } from '../web/glUtils';
import { bindAll, unBindAll } from '../web/renderPipeline';
import { VertexArrayObject } from '../web/vertexArray';
import Buffer from '~/utils/web/buffer';
import Shader from '../web/shader';
import { type AppState } from '../mainRoutine';
import type Texture from '../web/texture';
import { clearScreen, constructQuadSixWidthHeightTexture } from './util';
import { Float32Vector2 } from 'matrixgl';

const CANVAS_ORIGIN = new Float32Vector2(0, 0);

const SIZE_VERTEX = 4;
const NUM_VERTEX_QUAD = 6;

function initShader(gl: GL, shader: Shader) {
  const fragmentSource = `precision highp float;
                          varying highp vec2 vTextureCoord;
                          
                          uniform sampler2D canvas;          
                          
                          void main() {
                            gl_FragColor = texture2D(canvas, vTextureCoord);
                           // gl_FragColor.a = 1.0 - gl_FragColor.a;
                          }\n`;

  const vertexSource = `attribute vec2 a_position;
                      attribute vec2 aTextureCoord;

                      uniform mat4 model;
                      uniform mat4 view;
                      uniform mat4 projection;

                      varying highp vec2 vTextureCoord;

                      void main() {
                        gl_Position = projection * view * vec4(a_position, 0, 1);
                        vTextureCoord = aTextureCoord;     
                      }\n`;

  shader.constructFromSource(gl, vertexSource, fragmentSource).match(
    (_) => console.log('debug shader compilation success!'),
    (e) => {
      throw new Error(`Could not compile stroke preview shader...\n\n${e}`);
    }
  );
}

function initShader2(gl: GL, shader: Shader) {
  const fragmentSource = `precision highp float;
                          varying highp vec2 vTextureCoord;
                          
                          uniform sampler2D canvas;          
                          
                          void main() {
                            gl_FragColor = texture2D(canvas, vTextureCoord);
                            float alpha = sqrt(gl_FragColor.a);
                            gl_FragColor.a /= alpha;
                            // gl_FragColor.r = (gl_FragColor.r + alpha - 1.0) / alpha;
                            // gl_FragColor.g = (gl_FragColor.g + alpha - 1.0) / alpha;
                            // gl_FragColor.b = (gl_FragColor.b + alpha - 1.0) / alpha;
                            // gl_FragColor.a *= alpha;
                          }\n`;

  const vertexSource = `attribute vec2 a_position;
                      attribute vec2 aTextureCoord;

                      uniform mat4 model;
                      uniform mat4 view;
                      uniform mat4 projection;

                      varying highp vec2 vTextureCoord;

                      void main() {
                        gl_Position = projection * view * vec4(a_position, 0, 1);
                        vTextureCoord = aTextureCoord;     
                      }\n`;

  shader.constructFromSource(gl, vertexSource, fragmentSource).match(
    (_) => console.log('debug shader compilation success!'),
    (e) => {
      throw new Error(`Could not compile stroke preview shader...\n\n${e}`);
    }
  );
}


export class WorldPipeline {
  name: string;
  vertexArray: VertexArrayObject;
  vertexBuffer: Buffer;
  shader: Shader;
  shader2: Shader;
  rot = 0;

  public constructor(gl: GL, _: Readonly<AppState>) {
    this.name = 'World Pipeline';
    this.vertexArray = new VertexArrayObject(gl);
    this.vertexBuffer = new Buffer(gl, {
      btype: 'VertexBuffer',
      usage: 'Static Draw',
    });
    this.shader = new Shader(gl);
    this.shader2 = new Shader(gl);
  }

  init(gl: GL, appState: Readonly<AppState>) {
    initShader(gl, this.shader);
    initShader2(gl, this.shader2);

    bindAll(gl, this);

    this.vertexArray
      .builder()
      .addAttribute(2, 'float', 'position')
      .addAttribute(2, 'float', 'texCord')
      .build(gl);

    const w = appState.canvasState.canvas.width;
    const h = appState.canvasState.canvas.height;
    const aspectRatio = w / h;

    const quadVerts = constructQuadSixWidthHeightTexture(CANVAS_ORIGIN, aspectRatio / 2, 0.5);
    const quadBuffer = new Float32Array(quadVerts.length * SIZE_VERTEX);

    let i = 0;
    for (const vert of quadVerts) {
      quadBuffer[i++] = vert.x;
      quadBuffer[i++] = vert.y;
    }

    this.vertexBuffer.allocateWithData(gl, quadBuffer);

    unBindAll(gl, this);
  }

  render(
    gl: GL,
    canvasTexture: Texture,
    strokePreviewTexture: Texture,
    appState: Readonly<AppState>
  ) {
    bindAll(gl, this);

    clearScreen(gl, 0, 0, 0, 1)

    //gl.blendFunc(gl.SRC_ALPHA, gl.DST_ALPHA);
    gl.blendFunc(gl.ONE, gl.ZERO); 
    
    this.shader.use(gl)
    this.shader.uploadMatrix4x4(gl, 'model', appState.canvasState.camera.getTransformMatrix());
    this.shader.uploadMatrix4x4(gl, 'view', appState.canvasState.camera.getViewMatrix());
    this.shader.uploadMatrix4x4(
      gl,
      'projection',
      appState.canvasState.camera.getProjectionMatrix()
    );

    canvasTexture.bind(gl);
    this.shader.uploadTexture(gl, 'canvas', canvasTexture);
    gl.drawArrays(gl.TRIANGLES, 0, NUM_VERTEX_QUAD);
    canvasTexture.unBind(gl);
    this.shader.stopUsing(gl)
    
    this.shader2.use(gl)
    this.shader2.uploadMatrix4x4(gl, 'model', appState.canvasState.camera.getTransformMatrix());
    this.shader2.uploadMatrix4x4(gl, 'view', appState.canvasState.camera.getViewMatrix());
    this.shader2.uploadMatrix4x4(
      gl,
      'projection',
      appState.canvasState.camera.getProjectionMatrix()
    );

    strokePreviewTexture.bind(gl);
    this.shader2.uploadTexture(gl, 'canvas', strokePreviewTexture);
    gl.blendFunc( gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.drawArrays(gl.TRIANGLES, 0, NUM_VERTEX_QUAD);
    strokePreviewTexture.unBind(gl);
    this.shader2.stopUsing(gl)

    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); 
  
    unBindAll(gl, this);
  }
}
