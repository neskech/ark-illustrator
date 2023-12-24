import BrushIcon from '@mui/icons-material/Brush';
import CropSquareIcon from '@mui/icons-material/CropSquare';
import FormatColorFillIcon from '@mui/icons-material/FormatColorFill';
import PanoramaFishEyeIcon from '@mui/icons-material/PanoramaFishEye';
import { Box, Button } from '@mui/material';
import { useState } from 'react';
import { type ToolType, type ToolTypeRef } from '~/utils/canvas/tools/handler';

export interface LeftBarProps {
  selectedTool: ToolTypeRef;
}

const SELECTED_OPACITY = 0.3;

function LeftBar({ selectedTool }: LeftBarProps) {
  const [toolType, setToolType] = useState<ToolType>(selectedTool.current);

  function setType(type: ToolType) {
    selectedTool.current = type;
    setToolType(selectedTool.current);
  }

  return (
    <Box className="flex h-full w-full flex-col items-center justify-center gap-5">
      <Button
        variant="contained"
        sx={{ color: '#1c3e8a', filter: `brightness(${toolType == 'brush' ? SELECTED_OPACITY : 1})` }}
        className="m-auto h-10 w-10 border-4 border-solid border-slate-200"
        onClick={(_) => setType('brush')}
      >
        <BrushIcon className="h-full w-full"> </BrushIcon>
      </Button>

      <Button
        variant="contained"
        sx={{ color: '#1c3e8a', filter: `brightness(${toolType == 'fillBucket' ? SELECTED_OPACITY : 1})` }}
        className="m-auto h-10 w-10 border-4 border-solid border-slate-200"
        onClick={(_) => setType('fillBucket')}
      >
        <FormatColorFillIcon className="h-full w-full"> </FormatColorFillIcon>
      </Button>

      <Button
        variant="contained"
        sx={{ color: '#1c3e8a', filter: `brightness(${toolType == 'square' ? SELECTED_OPACITY : 1})` }}
        className="m-auto h-10 w-10 border-4 border-solid border-slate-200"
        onClick={(_) => setType('square')}
      >
        <CropSquareIcon className="h-full w-full"> </CropSquareIcon>
      </Button>

      <Button
        variant="contained"
        sx={{ color: '#1c3e8a', filter: `brightness(${toolType == 'circle' ? SELECTED_OPACITY : 1})` }}
        className="m-auto h-10 w-10 border-4 border-solid border-slate-200"
        onClick={(_) => setType('circle')}
      >
        <PanoramaFishEyeIcon className="h-full w-full"> </PanoramaFishEyeIcon>
      </Button>
    </Box>
  );
}

export default LeftBar;
