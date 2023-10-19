import { Box } from "@mui/material";
import { forwardRef, useEffect, useRef } from "react";
import { init } from "~/utils/mainRoutine";
// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface Props {}

const Canvas = forwardRef<HTMLCanvasElement, Props>(function Canvas(props, ref) {
    //const canvas = useRef<HTMLCanvasElement>(null);

    return (
        <canvas ref = {ref} width={1024} height={1024} className="w-full h-[100%] bg-slate-50 select-none"> 
        </canvas>
    );
})

export default Canvas;