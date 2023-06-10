import { Float32Vector2 } from 'matrixgl';
import { type GL } from '../web/glUtils';
import type RenderPipeline from '../web/renderPipeline';
import getDebugPipeline from './debugPipeline';
import getDrawPipeline from './drawPipeline';

export interface PipelineMap {
    debugPipeline: RenderPipeline,
    drawPipeline: RenderPipeline
}

export default function getPipelineMap(gl: GL): PipelineMap {
    return {
        debugPipeline: getDebugPipeline(gl),
        drawPipeline: getDrawPipeline(gl),
    }
}

export function destroyPipelines(gl: GL, map: PipelineMap): void {
    map.debugPipeline.destroy(gl);
}


type FourSizeArray = [Float32Vector2, Float32Vector2, Float32Vector2, Float32Vector2]
export function constructQuad(position: Float32Vector2, width: number, height: number): FourSizeArray{
    return [
        //bottom left
        new Float32Vector2(position.x - width / 2, position.y - height / 2),
        //top left
        new Float32Vector2(position.x - width / 2, position.y + height / 2),
        //top right
        new Float32Vector2(position.x + width / 2, position.y + height / 2),
        //bottom right
        new Float32Vector2(position.x + width / 2, position.y - height / 2)
    ]
} 

type SixSizeArrayF = [Float32Vector2, Float32Vector2, Float32Vector2, Float32Vector2, Float32Vector2, Float32Vector2]
export function constructQuadSix(position: Float32Vector2, scale: number): SixSizeArrayF {
    const w = 0.5 * scale;
    const h = 0.5 * scale;
    return [
        //bottom left
        new Float32Vector2(position.x + w, position.y + h),
        //top left
        new Float32Vector2(position.x - w, position.y + h),
        //top right
        new Float32Vector2(position.x - w, position.y - h),
        //bottom right
        new Float32Vector2(position.x - w, position.y - h),

        new Float32Vector2(position.x + w, position.y - h),

        new Float32Vector2(position.x + w, position.y + h),
    ]
} 

export function constructQuadSixTex(position: Float32Vector2, scale: number): Float32Vector2[] {
    const w = 0.5 * scale;
    const h = 0.5 * scale;
    return [
        //top right
        new Float32Vector2(position.x + w, position.y + h),
        new Float32Vector2(1, 1),

        //top left
        new Float32Vector2(position.x - w, position.y + h),
        new Float32Vector2(0, 1),

        //bottom left
        new Float32Vector2(position.x - w, position.y - h),
        new Float32Vector2(0, 0),

        //bottom left
        new Float32Vector2(position.x - w, position.y - h),
        new Float32Vector2(0, 0),

        //bottom right
        new Float32Vector2(position.x + w, position.y - h),
        new Float32Vector2(1, 0),

        //top right
        new Float32Vector2(position.x + w, position.y + h),
        new Float32Vector2(1, 1),
    ]
} 


type SixSizeArray = [number, number, number, number, number, number]
export function constructQuadIndices(offset: number): SixSizeArray {
    return [
        //lower triangle -- bottom right -> top left -> bottom left
        3 + offset, 
        1 + offset,
        0 + offset,
        //upper triangle -- bottom right -> top right -> top left
        3 + offset,
        2 + offset,
        1 + offset
    ]
}