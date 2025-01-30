import { faEraser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import BrushIcon from '@mui/icons-material/Brush';
import CropSquareIcon from '@mui/icons-material/CropSquare';
import FormatColorFillIcon from '@mui/icons-material/FormatColorFill';
import PanoramaFishEyeIcon from '@mui/icons-material/PanoramaFishEye';
import { Box, Button } from '@mui/material';
import { useContext, useState } from 'react';
import { type ToolTypeName } from '~/drawingEditor/Input/toolSystem/tool';
import { type StampBrushSettings } from '~/drawingEditor/Input/toolSystem/settings/brushSettings';
import { EditorContext } from '~/components/editorWrapper';

type ToolType = ToolTypeName | 'Eraser';

const SELECTED_OPACITY = 0.35;

function LeftBar() {
  const context = useContext(EditorContext);
  const brushSettings = context.inputManager.getSettings().brushConfigurations.getCurrentPreset()
    .brushSettings as StampBrushSettings;

  const [toolType, setToolType] = useState<ToolType>(context.inputManager.getCurrentTool());

  function setType(type: ToolType) {
    if (type == 'Eraser') {
      brushSettings.isEraser = true;
      setToolType('Eraser');
      return;
    }

    context.inputManager.setCurrentTool(type);
    setToolType(type);
    brushSettings.isEraser = false;
  }

  return (
    <Box className=" pointer-events-auto fixed  left-0 right-0 z-20 flex h-full w-[80px] flex-col items-center justify-center gap-5 bg-neutral-800 p-4 font-mono text-neutral-200 ">
      <Button
        variant="contained"
        disableRipple
        sx={{
          minWidth: '95%',
          maxWidth: '95%',
          color: '#fffffff',
          background: '#3f3f3f',
          filter: `brightness(${toolType == 'brush' ? SELECTED_OPACITY : 1})`,
          '&:hover': {
            backgroundColor: '#3f3f3f', // Set background color on hover
          },
          '&:focus': {
            backgroundColor: '#3f3f3f', // Set background color on focus (highlight)
          },
        }}
        onClick={(_) => setType('brush')}
        className="m-auto h-10"
      >
        <BrushIcon className="text-[20px]"> </BrushIcon>
      </Button>

      <Button
        variant="contained"
        disableRipple
        sx={{
          minWidth: '95%',
          maxWidth: '95%',
          color: '#fffffff',
          background: '#3f3f3f',
          filter: `brightness(${
            brushSettings.isEraser
              ? SELECTED_OPACITY
              : 1
          })`,
          '&:hover': {
            backgroundColor: '#3f3f3f', // Set background color on hover
          },
          '&:focus': {
            backgroundColor: '#3f3f3f', // Set background color on focus (highlight)
          },
        }}
        className="m-auto h-10"
        onClick={(_) => setType('Eraser')}
      >
        <FontAwesomeIcon icon={faEraser} className="text-[20px]" />
      </Button>

      <Button
        variant="contained"
        disableRipple
        sx={{
          minWidth: '95%',
          maxWidth: '95%',
          color: '#fffffff',
          background: '#3f3f3f',
          filter: `brightness(${toolType == 'fillBucket' ? SELECTED_OPACITY : 1})`,
          '&:hover': {
            backgroundColor: '#3f3f3f', // Set background color on hover
          },
          '&:focus': {
            backgroundColor: '#3f3f3f', // Set background color on focus (highlight)
          },
        }}
        className="m-auto h-10"
        onClick={(_) => setType('fillBucket')}
      >
        <FormatColorFillIcon className="text-[20px]"> </FormatColorFillIcon>
      </Button>

      <Button
        variant="contained"
        disableRipple
        sx={{
          minWidth: '95%',
          maxWidth: '95%',
          color: '#fffffff',
          background: '#3f3f3f',
          filter: `brightness(${toolType == 'square' ? SELECTED_OPACITY : 1})`,
          '&:hover': {
            backgroundColor: '#3f3f3f', // Set background color on hover
          },
          '&:focus': {
            backgroundColor: '#3f3f3f', // Set background color on focus (highlight)
          },
        }}
        className="m-auto h-10"
        onClick={(_) => setType('square')}
      >
        <CropSquareIcon className="text-[20px]"> </CropSquareIcon>
      </Button>

      <Button
        variant="contained"
        disableRipple
        sx={{
          minWidth: '95%',
          maxWidth: '95%',
          color: '#fffffff',
          background: '#3f3f3f',
          filter: `brightness(${toolType == 'circle' ? SELECTED_OPACITY : 1})`,
          '&:hover': {
            backgroundColor: '#3f3f3f', // Set background color on hover
          },
          '&:focus': {
            backgroundColor: '#3f3f3f', // Set background color on focus (highlight)
          },
        }}
        className="m-auto h-10"
        onClick={(_) => setType('circle')}
      >
        <PanoramaFishEyeIcon className="text-[20px]"> </PanoramaFishEyeIcon>
      </Button>
    </Box>
  );
}

export default LeftBar;
