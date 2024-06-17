import { faEraser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import BrushIcon from '@mui/icons-material/Brush';
import CropSquareIcon from '@mui/icons-material/CropSquare';
import FormatColorFillIcon from '@mui/icons-material/FormatColorFill';
import PanoramaFishEyeIcon from '@mui/icons-material/PanoramaFishEye';
import { Box, Button } from '@mui/material';
import { useState } from 'react';
import { type InputManager, type ToolType as ToolType_ } from '../../../drawingEditor/canvas/toolSystem/inputManager';

export interface LeftBarProps {
  inputManager: InputManager;
}
type ToolType = ToolType_ | 'Eraser';

const SELECTED_OPACITY = 0.3;

function LeftBar({ inputManager }: LeftBarProps) {
  const [toolType, setToolType] = useState<ToolType>(inputManager.getCurrentTool());
  const brushSettings = inputManager.getSettings().brushSettings.getCurrentPreset();

  function setType(type: ToolType) {
    if (type == 'Eraser') {
      brushSettings.isEraser = true;
      setToolType('Eraser');
      return;
    }

    inputManager.setCurrentTool(type)
    setToolType(type);
    brushSettings.isEraser = false;
  }

  return (
    <Box className="flex h-full w-full flex-col items-center justify-center gap-5">
      <Button
        variant="contained"
        sx={{
          color: '#1c3e8a',
          filter: `brightness(${toolType == 'brush' ? SELECTED_OPACITY : 1})`,
        }}
        className="m-auto h-10 w-10 border-4 border-solid border-slate-200"
        onClick={(_) => setType('brush')}
      >
        <BrushIcon className="h-full w-full"> </BrushIcon>
      </Button>

      <Button
        variant="contained"
        sx={{
          color: '#1c3e8a',
          filter: `brightness(${
            inputManager.getSettings().brushSettings.getCurrentPreset().isEraser ? SELECTED_OPACITY : 1
          })`,
        }}
        className="m-auto h-10 w-10 border-4 border-solid border-slate-200"
        onClick={(_) => setType('Eraser')}
      >
        <FontAwesomeIcon icon={faEraser} className="h-full w-full" />
      </Button>

      <Button
        variant="contained"
        sx={{
          color: '#1c3e8a',
          filter: `brightness(${toolType == 'fillBucket' ? SELECTED_OPACITY : 1})`,
        }}
        className="m-auto h-10 w-10 border-4 border-solid border-slate-200"
        onClick={(_) => setType('fillBucket')}
      >
        <FormatColorFillIcon className="h-full w-full"> </FormatColorFillIcon>
      </Button>

      <Button
        variant="contained"
        sx={{
          color: '#1c3e8a',
          filter: `brightness(${toolType == 'square' ? SELECTED_OPACITY : 1})`,
        }}
        className="m-auto h-10 w-10 border-4 border-solid border-slate-200"
        onClick={(_) => setType('square')}
      >
        <CropSquareIcon className="h-full w-full"> </CropSquareIcon>
      </Button>

      <Button
        variant="contained"
        sx={{
          color: '#1c3e8a',
          filter: `brightness(${toolType == 'circle' ? SELECTED_OPACITY : 1})`,
        }}
        className="m-auto h-10 w-10 border-4 border-solid border-slate-200"
        onClick={(_) => setType('circle')}
      >
        <PanoramaFishEyeIcon className="h-full w-full"> </PanoramaFishEyeIcon>
      </Button>
    </Box>
  );
}

export default LeftBar;
