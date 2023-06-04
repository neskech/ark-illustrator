import { Box, Button, Grid } from "@mui/material";
import BrushIcon from '@mui/icons-material/Brush';
import FormatColorFillIcon from '@mui/icons-material/FormatColorFill';
import CropSquareIcon from '@mui/icons-material/CropSquare';
import PanoramaFishEyeIcon from '@mui/icons-material/PanoramaFishEye';

function RightBar() {
    return (
        <Box className='w-full h-full flex flex-col justify-center items-center bg-slate-700'> 
            <Box className='w-[50%] h-[30%] grid grid-rows-3 grid-cols-2'>
               <Button variant='contained' className='w-20 h-20 m-auto border-solid border-slate-200 border-4'> 
                 <BrushIcon className="w-full h-full"> </BrushIcon>
               </Button>

               <Button variant='contained' className='w-20 h-20 m-auto border-solid border-slate-200 border-4'> 
                 <FormatColorFillIcon className="w-full h-full"> </FormatColorFillIcon>
               </Button>

               <Button variant='contained' className='w-20 h-20 m-auto border-solid border-slate-200 border-4'> 
                 <CropSquareIcon className="w-full h-full"> </CropSquareIcon>
               </Button>

               <Button variant='contained' className='w-20 h-20 m-auto border-solid border-slate-200 border-4'> 
                <PanoramaFishEyeIcon className="w-full h-full"> </PanoramaFishEyeIcon>
               </Button>
            </Box>
        </Box>
    );
}

export default RightBar;