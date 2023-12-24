import BrushIcon from '@mui/icons-material/Brush';
import CropSquareIcon from '@mui/icons-material/CropSquare';
import FormatColorFillIcon from '@mui/icons-material/FormatColorFill';
import PanoramaFishEyeIcon from '@mui/icons-material/PanoramaFishEye';
import { Box, Button } from '@mui/material';
import { useState } from 'react';
import { type ToolType, type ToolTypeRef } from '~/utils/canvas/tools/handler';
import ColorPicker from './colorPicker';

export interface RightBarProps {
  selectedTool: ToolTypeRef;
}

const SELECTED_OPACITY = 0.3;

function RightBar({ selectedTool }: RightBarProps) {
  const [toolType, setToolType] = useState<ToolType>(selectedTool.current);

  function setType(type: ToolType) {
    selectedTool.current = type;
    setToolType(selectedTool.current);
  }

  return (
    <Box className="z-20 ml-auto mr-0 flex h-[100%] w-[100%] flex-col items-center gap-5 rounded-lg border-slate-800 bg-slate-800">
      <Box className='h-[30%] pt-11'>
        <ColorPicker size={130} />
      </Box>
      hhgh
    </Box>
  );
}

export default RightBar;
