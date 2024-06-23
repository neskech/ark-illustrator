import {
  type Float32Vector2,
  type Float32Vector3,
  type Float32Vector4,
  type Matrix2x2,
  type Matrix3x3,
  type Matrix4x4,
} from 'matrixgl';
import { Option } from '../general/option';
import { Err, Ok, Result, unit, type Unit } from '../general/result';
import { GLObject } from './glUtils';
import type Texture from './texture';
import { type Int32Vector2, type Int32Vector3, type Int32Vector4 } from './vector';
import { gl } from '../../drawingEditor/application';

export default class Shader {
  private vertexShaderId: GLObject<WebGLShader>;
  private fragmentShaderId: GLObject<WebGLShader>;
  private programId: GLObject<WebGLProgram>;
  private name: string;
  private compiled: boolean;
  private linked: boolean;

  constructor(name = 'unknown') {
    const vId = Option.fromNull(gl.createShader(gl.VERTEX_SHADER));
    const vgId = vId.expect("Couldn't create vertex shader");
    this.vertexShaderId = new GLObject(vgId, 'vertex shader');

    const fId = Option.fromNull(gl.createShader(gl.FRAGMENT_SHADER));
    const fgId = fId.expect("Couldn't create fragment shader");
    this.fragmentShaderId = new GLObject(fgId, 'fragment shader');

    const pId = Option.fromNull(gl.createProgram());
    const pgId = pId.expect("Couldn't create shader program");
    this.programId = new GLObject(pgId, 'shader program');

    this.compiled = false;
    this.linked = false;
    this.name = name;
  }

  async compileFromFile(shaderName: string): Promise<Result<Unit, string>> {
    try {
      this.name = shaderName;
      const vert = await Result.fromErrorAsync(fetch(`shaders/${shaderName}.vert`));
      if (vert.isErr()) return Err(vert.unwrapErr().message);
      const vertText = await Result.fromErrorAsync(vert.unwrap().text());
      if (vertText.isErr()) return Err(vertText.unwrapErr().message);

      const frag = await Result.fromErrorAsync(fetch(`shaders/${shaderName}.frag`));
      if (frag.isErr()) return Err(frag.unwrapErr().message);
      const fragText = await Result.fromErrorAsync(frag.unwrap().text());
      if (fragText.isErr()) return Err(fragText.unwrapErr().message);

      this.compileFromSource(vertText.unwrap(), fragText.unwrap());
      return Ok(unit);
    } catch (err) {
      if (err instanceof Error) return Err(err.message);
      else return Err(`Failed to read ${shaderName} shaders`);
    }
  }

  compileFromSource(vertexSource: string, fragmentSource: string) {
    if (this.compiled) throw new Error('Tried compiling shader twice');

    gl.shaderSource(this.vertexShaderId.innerId(), vertexSource);
    gl.shaderSource(this.fragmentShaderId.innerId(), fragmentSource);
    gl.compileShader(this.vertexShaderId.innerId());
    gl.compileShader(this.fragmentShaderId.innerId());

    //defer checking compilation status until linking time
    this.compiled = true;
  }

  link(): Result<Unit, string> {
    if (!this.compiled) throw new Error('tried linking shaders before compilation');

    if (this.linked) throw new Error('tried linking shader twice');

    gl.attachShader(this.programId.innerId(), this.vertexShaderId.innerId());
    gl.attachShader(this.programId.innerId(), this.fragmentShaderId.innerId());
    gl.linkProgram(this.programId.innerId());

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const success = gl.getProgramParameter(this.programId.innerId(), gl.LINK_STATUS);
    if (!success) {
      const programInfo = gl.getProgramInfoLog(this.programId.innerId());
      const vertexInfo = gl.getShaderInfoLog(this.vertexShaderId.innerId());
      const fragmentInfo = gl.getShaderInfoLog(this.fragmentShaderId.innerId());
      return Err(`Failed to construct '${this.name}' shader. Info logs --\n
                             Program Log: ${programInfo ?? ''}\n
                             Vertex Log: ${vertexInfo ?? ''}\n
                             Fragment Log: ${fragmentInfo ?? ''}`);
    }

    gl.detachShader(this.programId.innerId(), this.vertexShaderId.innerId());
    gl.detachShader(this.programId.innerId(), this.fragmentShaderId.innerId());
    gl.deleteShader(this.vertexShaderId.innerId());
    gl.deleteShader(this.fragmentShaderId.innerId());

    this.linked = true;

    return Ok(unit);
  }

  async construct(shaderName: string): Promise<Result<Unit, string>> {
    const result = await this.compileFromFile(shaderName);
    if (result.isErr()) return result;

    const result2 = this.link();
    if (result2.isErr()) return result2;

    return Ok(unit);
  }

  constructFromSource(vertexSource: string, fragmentSource: string): Result<Unit, string> {
    this.compileFromSource(vertexSource, fragmentSource);
    return this.link();
  }

  bind() {
    gl.useProgram(this.programId.innerId());
  }

  unBind() {
    gl.useProgram(null);
  }

  destroy() {
    this.programId.destroy((pid) => {
      gl.deleteProgram(pid);
    });

    this.vertexShaderId.destroy((vid) => {
      gl.deleteShader(vid);
    });

    this.fragmentShaderId.destroy((fid) => {
      gl.deleteShader(fid);
    });
  }

  uploadFloat(location: string, val: number) {
    const loc = gl.getUniformLocation(this.programId.innerId(), location);
    gl.uniform1f(loc, val);
  }

  uploadFloatArray(location: string, vals: number[]) {
    const loc = gl.getUniformLocation(this.programId.innerId(), location);
    gl.uniform1fv(loc, vals);
  }

  uploadFloatVec2(location: string, val: Float32Vector2) {
    const loc = gl.getUniformLocation(this.programId.innerId(), location);
    gl.uniform2f(loc, val.x, val.y);
  }

  uploadFloatVec2Array(location: string, vals: Float32Vector2[]) {
    const loc = gl.getUniformLocation(this.programId.innerId(), location);
    gl.uniform2fv(
      loc,
      vals.flatMap((v) => [v.x, v.y])
    );
  }

  uploadFloatVec3(location: string, val: Float32Vector3) {
    const loc = gl.getUniformLocation(this.programId.innerId(), location);
    gl.uniform3f(loc, val.x, val.y, val.z);
  }

  uploadFloatVec3Array(location: string, vals: Float32Vector3[]) {
    ``;
    const loc = gl.getUniformLocation(this.programId.innerId(), location);
    gl.uniform3fv(
      loc,
      vals.flatMap((v) => [v.x, v.y, v.z])
    );
  }

  uploadFloatVec4(location: string, val: Float32Vector4) {
    const loc = gl.getUniformLocation(this.programId.innerId(), location);
    gl.uniform4f(loc, val.x, val.y, val.z, val.w);
  }

  uploadFloatVec4Array(location: string, vals: Float32Vector4[]) {
    const loc = gl.getUniformLocation(this.programId.innerId(), location);
    gl.uniform3fv(
      loc,
      vals.flatMap((v) => [v.x, v.y, v.z, v.w])
    );
  }

  uploadInt(location: string, val: number) {
    const loc = gl.getUniformLocation(this.programId.innerId(), location);
    gl.uniform1i(loc, val);
  }

  uploadIntArray(location: string, vals: number[]) {
    const loc = gl.getUniformLocation(this.programId.innerId(), location);
    gl.uniform1iv(loc, vals);
  }

  uploadIntVec2(location: string, val: Int32Vector2) {
    const loc = gl.getUniformLocation(this.programId.innerId(), location);
    gl.uniform2i(loc, val.x, val.y);
  }

  uploadIntVec2Array(location: string, vals: Int32Vector2[]) {
    const loc = gl.getUniformLocation(this.programId.innerId(), location);
    gl.uniform2iv(
      loc,
      vals.flatMap((v) => [v.x, v.y])
    );
  }

  uploadInttVec3(location: string, val: Int32Vector3) {
    const loc = gl.getUniformLocation(this.programId.innerId(), location);
    gl.uniform3i(loc, val.x, val.y, val.z);
  }

  uploadIntVec3Array(location: string, vals: Int32Vector3[]) {
    const loc = gl.getUniformLocation(this.programId.innerId(), location);
    gl.uniform3iv(
      loc,
      vals.flatMap((v) => [v.x, v.y, v.z])
    );
  }

  uploadIntVec4(location: string, val: Int32Vector4) {
    const loc = gl.getUniformLocation(this.programId.innerId(), location);
    gl.uniform4i(loc, val.x, val.y, val.z, val.w);
  }

  uploadIntVec4Array(location: string, vals: Int32Vector4[]) {
    const loc = gl.getUniformLocation(this.programId.innerId(), location);
    gl.uniform4iv(
      loc,
      vals.flatMap((v) => [v.x, v.y, v.z, v.w])
    );
  }

  uploadMatrix2x2(location: string, matrix: Matrix2x2) {
    const loc = gl.getUniformLocation(this.programId.innerId(), location);
    gl.uniformMatrix2fv(loc, false, matrix.values);
  }

  uploadMatrix3x3(location: string, matrix: Matrix3x3) {
    const loc = gl.getUniformLocation(this.programId.innerId(), location);
    gl.uniformMatrix3fv(loc, false, matrix.values);
  }

  uploadMatrix4x4(location: string, matrix: Matrix4x4) {
    const loc = gl.getUniformLocation(this.programId.innerId(), location);
    gl.uniformMatrix4fv(loc, false, matrix.values);
  }

  uploadTexture(location: string, texture: Texture, override: number | null = null) {
    const loc = gl.getUniformLocation(this.programId.innerId(), location);
    gl.uniform1i(loc, override ? override : (texture.getId().innerId() as number));
  }

  uploadTextureArray(location: string, textures: Texture[]) {
    const loc = gl.getUniformLocation(this.programId.innerId(), location);
    gl.uniform1iv(
      loc,
      textures.map((tex) => tex.getId().innerId() as number)
    );
  }
}
