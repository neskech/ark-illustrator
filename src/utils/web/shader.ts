import { requires } from "../contracts";
import { zip } from "../func/arrayUtils";
import { Option } from "../func/option";
import { type GL, GLObject, glOpErr } from "./glUtils";
import type Texture from "./texture";
import * as fsPromise from 'fs/promises'; 
import { type Mat2x2, type Mat3x3, type Mat4x4, type Vec2F, type Vec2I, type Vec3F, type Vec3I, type Vec4F, type Vec4I, isVec2F, isVec3F, isVec4F, vec2F, isMat3x3, isMat4x4, isMat2x2 } from './vector';

export default class Shader {
    private vertexShaderId: GLObject<WebGLShader>
    private fragmentShaderId: GLObject<WebGLShader>
    private programId: GLObject<WebGLProgram>
    private compiled: boolean
    private linked: boolean

    constructor(gl: GL) {
        const vId = Option.fromNull(glOpErr(gl, gl.createShader.bind(this), gl.VERTEX_SHADER));
        const vgId = vId.expect("Couldn't create vertex buffer");
        this.vertexShaderId = new GLObject(vgId);

        const fId = Option.fromNull(glOpErr(gl, gl.createShader.bind(this), gl.FRAGMENT_SHADER));
        const fgId = fId.expect("Couldn't create vertex buffer");
        this.fragmentShaderId = new GLObject(fgId);

        const pId = Option.fromNull(glOpErr(gl, gl.createProgram.bind(this)));
        const pgId = pId.expect("Couldn't create vertex buffer");
        this.programId = new GLObject(pgId);

        this.compiled = false;
        this.linked = false;
    }

    async compileFromFile(gl: GL, shaderName: string) {

        try {
            const vertFile = await fsPromise.open(`../../../public/shaders/${shaderName}.vertex`, 'r');
            const vertContents = await vertFile.readFile({
                encoding: 'ascii'
            });


            const fragFile = await fsPromise.open(`../../../public/shaders/${shaderName}.frag`, 'r');
            const fragContents = await fragFile.readFile({
                encoding: 'ascii'
            });

            this.compileFromSource(gl, vertContents, fragContents);
        }
        catch (err) {
            console.error(`Failed to read ${shaderName} shaders`)
            throw err
        }
    
    }

    compileFromSource(gl: GL, vertexSource: string, fragmentSource: string) {
        if (this.compiled) 
            throw new Error('Tried compiling shader twice')

        glOpErr(gl, gl.shaderSource.bind(this), this.vertexShaderId.innerId(), vertexSource);
        glOpErr(gl, gl.shaderSource.bind(this), this.fragmentShaderId.innerId(), fragmentSource);
        glOpErr(gl, gl.compileShader.bind(this), this.vertexShaderId.innerId());
        glOpErr(gl, gl.compileShader.bind(this), this.fragmentShaderId.innerId());

        //defer checking compilation status until linking time
        this.compiled = true;
    }

    link(gl: GL) {
        if (!this.compiled)
            throw new Error('tried linking shaders before compilation')

        if (this.linked)
            throw new Error('tried linking shader twice')

        glOpErr(gl, gl.attachShader.bind(this), this.programId.innerId(), this.vertexShaderId.innerId());
        glOpErr(gl, gl.attachShader.bind(this), this.programId.innerId(), this.fragmentShaderId.innerId());

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const success = gl.getProgramParameter(this.programId.innerId(), gl.LINK_STATUS);
        if (!success) {
            const programInfo = gl.getProgramInfoLog(this.programId.innerId());
            const vertexInfo = gl.getProgramInfoLog(this.vertexShaderId.innerId());
            const fragmentInfo = gl.getProgramInfoLog(this.fragmentShaderId.innerId());
            throw new Error(`Failed to constrict shader. Info logs --\n
                             Program Log: ${programInfo ?? ''}\n
                             Vertex Log: ${vertexInfo ?? ''}\n
                             Fragment Log: ${fragmentInfo ?? ''}`)
        }

        this.linked = true;
    }

    async construct(gl: GL, shaderPath: string) {
        await this.compileFromFile(gl, shaderPath);
        this.link(gl);
    }

    static async parallelCompile(gl: GL, shaders: Shader[], sourceFiles: string[]) {
        for (const [shader, file] of zip(shaders, sourceFiles)) {
            await shader.compileFromFile(gl, file);
        }

        for (const shader of shaders) {
            shader.link(gl);
        }
    }

    destroy(gl: GL) {
        this.programId.destroy((pid) => {
            gl.deleteProgram(pid);
        })

        this.vertexShaderId.destroy((vid) => {
            gl.deleteShader(vid)
        })

        this.fragmentShaderId.destroy((fid) => {
            gl.deleteShader(fid)
        })
    }

    uploadFloat(gl: GL, location: string, val: number) {
        const loc = gl.getUniformLocation(this.programId.innerId(), location);
        gl.uniform1f(loc, val);
    }    

    uploadFloatArray(gl: GL, location: string, vals: number[]) {
        const loc = gl.getUniformLocation(this.programId.innerId(), location);
        gl.uniform1fv(loc, vals);
    }

    uploadFloatVec2(gl: GL, location: string, val: Vec2F) {
        requires(() => isVec2F(val));
        const loc = gl.getUniformLocation(this.programId.innerId(), location);
        gl.uniform2f(loc, val.x, val.y);
    }

    uploadFloatVec2Array(gl: GL, location: string, vals: Vec2F[]) {
        requires(() => vals.every((v) => isVec2F(v)));
        const loc = gl.getUniformLocation(this.programId.innerId(), location);
        gl.uniform2fv(loc, vals.flatMap(v => [v.x, v.y]));
    }

    uploadFloatVec3(gl: GL, location: string, val: Vec3F) {
        requires(() => isVec3F(val));
        const loc = gl.getUniformLocation(this.programId.innerId(), location);
        gl.uniform3f(loc, val.x, val.y, val.z);
    }

    uploadFloatVec3Array(gl: GL, location: string, vals: Vec3F[]) {
        requires(() => vals.every((v) => isVec3F(v)));
        const loc = gl.getUniformLocation(this.programId.innerId(), location);
        gl.uniform3fv(loc, vals.flatMap(v => [v.x, v.y, v.z]));
    }

    uploadFloatVec4(gl: GL, location: string, val: Vec4F) {
        requires(() => isVec4F(val));
        const loc = gl.getUniformLocation(this.programId.innerId(), location);
        gl.uniform4f(loc, val.x, val.y, val.z, val.w);
    }

    uploadFloatVec4Array(gl: GL, location: string, vals: Vec4F[]) {
        requires(() => vals.every((v) => isVec4F(v)));
        const loc = gl.getUniformLocation(this.programId.innerId(), location);
        gl.uniform3fv(loc, vals.flatMap(v => [v.x, v.y, v.z, v.w]));
    }


    uploadInt(gl: GL, location: string, val: number) {
        const loc = gl.getUniformLocation(this.programId.innerId(), location);
        gl.uniform1i(loc, val);
    }

    uploadIntArray(gl: GL, location: string, vals: number[]) {
        const loc = gl.getUniformLocation(this.programId.innerId(), location);
        gl.uniform1iv(loc, vals);
    }

    uploadIntVec2(gl: GL, location: string, val: Vec2I) {
        const loc = gl.getUniformLocation(this.programId.innerId(), location);
        gl.uniform2i(loc, val.x, val.y);
    }

    uploadIntVec2Array(gl: GL, location: string, vals: Vec2I[]) {
        const loc = gl.getUniformLocation(this.programId.innerId(), location);
        gl.uniform2iv(loc, vals.flatMap(v => [v.x, v.y]));
    }

    uploadInttVec3(gl: GL, location: string, val: Vec3I) {
        const loc = gl.getUniformLocation(this.programId.innerId(), location);
        gl.uniform3i(loc, val.x, val.y, val.z);
    }

    uploadIntVec3Array(gl: GL, location: string, vals: Vec3I[]) {
        const loc = gl.getUniformLocation(this.programId.innerId(), location);
        gl.uniform3iv(loc, vals.flatMap(v => [v.x, v.y, v.z]));
    }

    uploadIntVec4(gl: GL, location: string, val: Vec4I) {
        const loc = gl.getUniformLocation(this.programId.innerId(), location);
        gl.uniform4i(loc, val.x, val.y, val.z, val.w);
    }

    uploadIntVec4Array(gl: GL, location: string, vals: Vec4I[]) {
        const loc = gl.getUniformLocation(this.programId.innerId(), location);
        gl.uniform4iv(loc, vals.flatMap(v => [v.x, v.y, v.z, v.w]));
    }

    uploadMatrix2x2(gl: GL, location: string, matrix: Mat2x2) {
        requires(() => isMat2x2(matrix))
        const loc = gl.getUniformLocation(this.programId.innerId(), location);
        gl.uniformMatrix2fv(loc, false, matrix.data);
    }

    uploadMatrix3x3(gl: GL, location: string, matrix: Mat3x3) {
        requires(() => isMat3x3(matrix))
        const loc = gl.getUniformLocation(this.programId.innerId(), location);
        gl.uniformMatrix3fv(loc, false, matrix.data);
    }

    uploadMatrix4x4(gl: GL, location: string, matrix: Mat4x4) {
        requires(() => isMat4x4(matrix))
        const loc = gl.getUniformLocation(this.programId.innerId(), location);
        gl.uniformMatrix4fv(loc, false, matrix.data);
    }

    uploadTexture(gl: GL, location: string, texture: Texture) {
        const loc = gl.getUniformLocation(this.programId.innerId(), location);
        gl.uniform1i(loc, texture.getId().innerId() as number);
    }

    uploadTextureArray(gl: GL, location: string, textures: Texture[]) {
        const loc = gl.getUniformLocation(this.programId.innerId(), location);
        gl.uniform1iv(loc, textures.map(tex => tex.getId().innerId() as number));
    }

}