import { zip } from '../func/arrayUtils';
import { Option } from '../func/option';
import { type GL, GLObject, glOpErr } from './glUtils';
import type Texture from './texture';
import fs from 'fs';
import { promisify } from 'util';
import { Result } from '../func/result';
import { type Float32Vector2, type Float32Vector3, type Float32Vector4, type Matrix2x2, type Matrix3x3, type Matrix4x4 } from 'matrixgl';
import { type Int32Vector2, type Int32Vector3, type Int32Vector4 } from './vector';

//TODO: make all err based code result based

export default class Shader {
  private vertexShaderId: GLObject<WebGLShader>;
  private fragmentShaderId: GLObject<WebGLShader>;
  private programId: GLObject<WebGLProgram>;
  private compiled: boolean;
  private linked: boolean;

  constructor(gl: GL) {
    const vId = Option.fromNull(
      glOpErr(gl, gl.createShader.bind(gl), gl.VERTEX_SHADER)
    );
    const vgId = vId.expect("Couldn't create vertex shader");
    this.vertexShaderId = new GLObject(vgId, 'vertex shader');

    const fId = Option.fromNull(
      glOpErr(gl, gl.createShader.bind(gl), gl.FRAGMENT_SHADER)
    );
    const fgId = fId.expect("Couldn't create fragment shader");
    this.fragmentShaderId = new GLObject(fgId, 'fragment shader');

    const pId = Option.fromNull(glOpErr(gl, gl.createProgram.bind(gl)));
    const pgId = pId.expect("Couldn't create shader program");
    this.programId = new GLObject(pgId, 'shader program');

    this.compiled = false;
    this.linked = false;
  }

  async compileFromFile(gl: GL, shaderName: string) {
    try {
      const open = promisify(fs.readFile);
      const vertContents = await open(
        `../../../public/shaders/${shaderName}.vertex`,
        'utf-8'
      );
      const fragContents = await open(
        `../../../public/shaders/${shaderName}.frag`,
        'utf-8'
      );

      this.compileFromSource(gl, vertContents, fragContents);
    } catch (err) {
      if (err instanceof Error) throw err;
      else throw new Error(`Failed to read ${shaderName} shaders`);
    }
  }

  compileFromFileSynchronous(gl: GL, shaderName: string) {
    try {
      const vertContents = fs.readFileSync(
        `../../../public/shaders/${shaderName}.vertex`,
        'utf-8'
      );

      const fragContents = fs.readFileSync(
        `../../../public/shaders/${shaderName}.frag`,
        'utf-8'
      );

      this.compileFromSource(gl, vertContents, fragContents);
    } catch (err) {
      if (err instanceof Error) throw err;
      else throw new Error(`Failed to read ${shaderName} shaders`);
    }
  }

  compileFromSource(gl: GL, vertexSource: string, fragmentSource: string) {
    if (this.compiled) throw new Error('Tried compiling shader twice');

    glOpErr(
      gl,
      gl.shaderSource.bind(gl),
      this.vertexShaderId.innerId(),
      vertexSource
    );
    glOpErr(
      gl,
      gl.shaderSource.bind(gl),
      this.fragmentShaderId.innerId(),
      fragmentSource
    );
    glOpErr(gl, gl.compileShader.bind(gl), this.vertexShaderId.innerId());
    glOpErr(gl, gl.compileShader.bind(gl), this.fragmentShaderId.innerId());

    //defer checking compilation status until linking time
    this.compiled = true;
  }

  link(gl: GL) {
    if (!this.compiled)
      throw new Error('tried linking shaders before compilation');

    if (this.linked) throw new Error('tried linking shader twice');

    glOpErr(
      gl,
      gl.attachShader.bind(gl),
      this.programId.innerId(),
      this.vertexShaderId.innerId()
    );
    glOpErr(
      gl,
      gl.attachShader.bind(gl),
      this.programId.innerId(),
      this.fragmentShaderId.innerId()
    );

    glOpErr(gl, gl.linkProgram.bind(gl), this.programId.innerId());

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const success = gl.getProgramParameter(
      this.programId.innerId(),
      gl.LINK_STATUS
    );
    if (!success) {
      const programInfo = gl.getProgramInfoLog(this.programId.innerId());
      const vertexInfo = gl.getShaderInfoLog(this.vertexShaderId.innerId());
      const fragmentInfo = gl.getShaderInfoLog(this.fragmentShaderId.innerId());
      throw new Error(`Failed to construct shader. Info logs --\n
                             Program Log: ${programInfo ?? ''}\n
                             Vertex Log: ${vertexInfo ?? ''}\n
                             Fragment Log: ${fragmentInfo ?? ''}`);
    }

    gl.detachShader(this.programId.innerId(), this.vertexShaderId.innerId());
    gl.detachShader(this.programId.innerId(), this.fragmentShaderId.innerId());
    gl.deleteShader(this.vertexShaderId.innerId());
    gl.deleteShader(this.fragmentShaderId.innerId());

    this.linked = true;
  }

  async construct(gl: GL, shaderName: string) {
    await this.compileFromFile(gl, shaderName);
    this.link(gl);
  }

  constructSynchronous(gl: GL, shaderName: string): Result<void, string> {
    const f = () => {
      Result.fromError<void, string>(() => {
        this.compileFromFileSynchronous(gl, shaderName);
      }).throwIfErr();

      this.link(gl);
    };

    return Result.fromError(f);
  }

  constructFromSource(
    gl: GL,
    vertexSource: string,
    fragmentSource: string
  ): Result<void, string> {
    this.compileFromSource(gl, vertexSource, fragmentSource);
    const res = Result.fromError<void, string>(() => this.link(gl));
    return res;
  }

  static async parallelCompile(
    gl: GL,
    shaders: Shader[],
    sourceFiles: string[]
  ) {
    for (const [shader, file] of zip(shaders, sourceFiles)) {
      await shader.compileFromFile(gl, file);
    }

    for (const shader of shaders) {
      shader.link(gl);
    }
  }

  use(gl: GL) {
    glOpErr(gl, gl.useProgram.bind(gl), this.programId.innerId());
  }

  stopUsing(gl: GL) {
    glOpErr(gl, gl.useProgram.bind(gl), null);
  }

  destroy(gl: GL) {
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

  uploadFloat(gl: GL, location: string, val: number) {
    const loc = gl.getUniformLocation(this.programId.innerId(), location);
    gl.uniform1f(loc, val);
  }

  uploadFloatArray(gl: GL, location: string, vals: number[]) {
    const loc = gl.getUniformLocation(this.programId.innerId(), location);
    gl.uniform1fv(loc, vals);
  }

  uploadFloatVec2(gl: GL, location: string, val: Float32Vector2) {
    const loc = gl.getUniformLocation(this.programId.innerId(), location);
    gl.uniform2f(loc, val.x, val.y);
  }

  uploadFloatVec2Array(gl: GL, location: string, vals: Float32Vector2[]) {
    const loc = gl.getUniformLocation(this.programId.innerId(), location);
    gl.uniform2fv(
      loc,
      vals.flatMap((v) => [v.x, v.y])
    );
  }

  uploadFloatVec3(gl: GL, location: string, val: Float32Vector3) {
    const loc = gl.getUniformLocation(this.programId.innerId(), location);
    gl.uniform3f(loc, val.x, val.y, val.z);
  }

  uploadFloatVec3Array(gl: GL, location: string, vals: Float32Vector3[]) {
    ``;
    const loc = gl.getUniformLocation(this.programId.innerId(), location);
    gl.uniform3fv(
      loc,
      vals.flatMap((v) => [v.x, v.y, v.z])
    );
  }

  uploadFloatVec4(gl: GL, location: string, val: Float32Vector4) {
    const loc = gl.getUniformLocation(this.programId.innerId(), location);
    gl.uniform4f(loc, val.x, val.y, val.z, val.w);
  }

  uploadFloatVec4Array(gl: GL, location: string, vals: Float32Vector4[]) {
    const loc = gl.getUniformLocation(this.programId.innerId(), location);
    gl.uniform3fv(
      loc,
      vals.flatMap((v) => [v.x, v.y, v.z, v.w])
    );
  }

  uploadInt(gl: GL, location: string, val: number) {
    const loc = gl.getUniformLocation(this.programId.innerId(), location);
    gl.uniform1i(loc, val);
  }

  uploadIntArray(gl: GL, location: string, vals: number[]) {
    const loc = gl.getUniformLocation(this.programId.innerId(), location);
    gl.uniform1iv(loc, vals);
  }

  uploadIntVec2(gl: GL, location: string, val: Int32Vector2) {
    const loc = gl.getUniformLocation(this.programId.innerId(), location);
    gl.uniform2i(loc, val.x, val.y);
  }

  uploadIntVec2Array(gl: GL, location: string, vals: Int32Vector2[]) {
    const loc = gl.getUniformLocation(this.programId.innerId(), location);
    gl.uniform2iv(
      loc,
      vals.flatMap((v) => [v.x, v.y])
    );
  }

  uploadInttVec3(gl: GL, location: string, val: Int32Vector3) {
    const loc = gl.getUniformLocation(this.programId.innerId(), location);
    gl.uniform3i(loc, val.x, val.y, val.z);
  }

  uploadIntVec3Array(gl: GL, location: string, vals: Int32Vector3[]) {
    const loc = gl.getUniformLocation(this.programId.innerId(), location);
    gl.uniform3iv(
      loc,
      vals.flatMap((v) => [v.x, v.y, v.z])
    );
  }

  uploadIntVec4(gl: GL, location: string, val: Int32Vector4) {
    const loc = gl.getUniformLocation(this.programId.innerId(), location);
    gl.uniform4i(loc, val.x, val.y, val.z, val.w);
  }

  uploadIntVec4Array(gl: GL, location: string, vals: Int32Vector4[]) {
    const loc = gl.getUniformLocation(this.programId.innerId(), location);
    gl.uniform4iv(
      loc,
      vals.flatMap((v) => [v.x, v.y, v.z, v.w])
    );
  }

  uploadMatrix2x2(gl: GL, location: string, matrix: Matrix2x2) {
    const loc = gl.getUniformLocation(this.programId.innerId(), location);
    gl.uniformMatrix2fv(loc, false, matrix.values);
  }

  uploadMatrix3x3(gl: GL, location: string, matrix: Matrix3x3) {
    const loc = gl.getUniformLocation(this.programId.innerId(), location);
    gl.uniformMatrix3fv(loc, false, matrix.values);
  }

  uploadMatrix4x4(gl: GL, location: string, matrix: Matrix4x4) {
    const loc = gl.getUniformLocation(this.programId.innerId(), location);
    gl.uniformMatrix4fv(loc, false, matrix.values);
  }

  uploadTexture(gl: GL, location: string, texture: Texture) {
    const loc = gl.getUniformLocation(this.programId.innerId(), location);
    gl.uniform1i(loc, texture.getId().innerId() as number);
  }

  uploadTextureArray(gl: GL, location: string, textures: Texture[]) {
    const loc = gl.getUniformLocation(this.programId.innerId(), location);
    gl.uniform1iv(
      loc,
      textures.map((tex) => tex.getId().innerId() as number)
    );
  }
}
