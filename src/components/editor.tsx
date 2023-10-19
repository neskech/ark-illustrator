import { Box } from "@mui/material";
import Canvas from './canvas';
import { useEffect, useRef, useState } from "react";
import { appState, init } from "~/utils/mainRoutine";
import { SettingsDialog } from "./settings";

function Editor() {
    const canvas = useRef<HTMLCanvasElement>(null);
    const [showSettings, setShowSettings] = useState(false)

    useEffect(() => {
        if (canvas.current) {
            console.log('init!')
            init(canvas.current)
        }

        document.addEventListener('keydown', (e) => {
            if (e.key == 's')
                setShowSettings(v => !v)
        })

        /* I know this is disgusting now shut up */
        setTimeout(() => {
            appState.inputState.gestures.subscribeToOnSettingsOpenGesture(() => setShowSettings(v => !v))
        }, 1000)
        
    }, []);

    return (
        <Box className='w-full h-full flex flex-row select-none touch-none'> 
                <Canvas ref={canvas}/> 
               { showSettings ? <SettingsDialog open={showSettings} /> : <div> </div> }
        </Box>
    );
}

export default Editor;