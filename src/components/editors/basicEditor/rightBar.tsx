import { Box } from '@mui/material';
import ColorPicker from './colorPicker';
import BrushSettingsPanel from './brushSettingsPanel';
import LayerEditor from './layerEditor';

// pointer-events-auto z-20 ml-auto mr-0 flex h-full w-[150px] flex-col justify-center
function RightBar() {
  return (
    <Box className="pointer-events-auto z-20 ml-auto mr-0 flex h-[100%] w-[250px] flex-col items-center gap-5 bg-neutral-800 font-mono text-neutral-200">
      <ColorPicker />
      <BrushSettingsPanel />
      <LayerEditor/>
    </Box>
  );
}

export default RightBar;
