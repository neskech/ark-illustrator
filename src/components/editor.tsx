import { Box } from "@mui/material";
import RightBar from "./rightBar";
import Canvas from './canvas';
import { useEffect, useRef } from "react";
import { init, startRenderLoop } from "~/utils/mainRoutine";

function Editor() {
    const canvas = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (canvas.current) {
            console.log('init!')
            init(canvas.current)
            startRenderLoop();
        }
        
    }, []);

    return (
        <Box className='w-full h-full flex flex-row'> 
                <Canvas ref={canvas}/> 
        </Box>
    );
}

export default Editor;