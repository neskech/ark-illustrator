import { type GL } from '../web/glUtils';
import type RenderPipeline from '../web/renderPipeline';
import { type Vec2F, vec2F } from '../web/vector';
import getDebugPipeline from './debugPipeline';

export interface PipelineMap {
    debugPipeline: RenderPipeline
}

export default function getPipelineMap(gl: GL): PipelineMap {
    return {
        debugPipeline: getDebugPipeline(gl)
    }
}

export function destroyPipelines(gl: GL, map: PipelineMap): void {
    map.debugPipeline.destroy(gl);
}

export function constructQuad(position: Vec2F, width: number, height: number): [Vec2F, Vec2F, Vec2F, Vec2F] {
    return [
        //bottom left
        vec2F(position.val.x - width / 2, position.val.y - height / 2),
        //top left
        vec2F(position.val.x - width / 2, position.val.y + height / 2),
        //top right
        vec2F(position.val.x + width / 2, position.val.y + height / 2),
        //bottom right
        vec2F(position.val.x + width / 2, position.val.y - height / 2)
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