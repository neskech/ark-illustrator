import { Box } from '@mui/material';
import ColorPicker from './colorPicker';
import BrushSettingsPanel from './brushSettingsPanel';

// pointer-events-auto z-20 ml-auto mr-0 flex h-full w-[150px] flex-col justify-center
function RightBar() {
  return (
    <Box className="pointer-events-auto z-20 ml-auto mr-0 flex h-[100%] w-[250px] flex-col items-center gap-5 bg-neutral-800 p-1 font-mono text-neutral-200">
      <ColorPicker />
      <BrushSettingsPanel />
    </Box>
  );
}

export default RightBar;
