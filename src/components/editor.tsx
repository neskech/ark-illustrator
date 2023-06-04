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
        <Box className='w-full h-full flex flex-row bg-pink-700'> 
            <Box className='w-[25%] h-full bg-slate-700'> 
                
            </Box>

            <Box className='w-[50%] h-full bg-yellow-400 flex flex-col justify-center items-center'> 
                <Canvas ref={canvas}/> 
            </Box>
            
            <Box className='w-[25%] h-full bg-blue-600'> 
                 <RightBar/>
            </Box>
        </Box>
    );
}

export default Editor;