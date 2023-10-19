import { Box } from "@mui/material";
import Canvas from './canvas';
import { useEffect, useRef } from "react";
import { init } from "~/utils/mainRoutine";

function Editor() {
    const canvas = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (canvas.current) {
            console.log('init!')
            init(canvas.current)
        }
        
    }, []);

    return (
        <Box className='w-full h-full flex flex-row select-none touch-none'> 
                <Canvas ref={canvas}/> 
        </Box>
    );
}

export default Editor;