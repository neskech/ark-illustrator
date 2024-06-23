import { Box } from '@mui/material';
import ColorPicker from './colorPicker';
import BrushSettingsPanel from './brushSettingsPanel';
import { type InputManager } from '~/drawingEditor/Input/toolSystem/inputManager';

export interface RightBarProps {
  inputManager: InputManager;
}

function RightBar({ inputManager }: RightBarProps) {
  return (
    <Box className="z-20 ml-auto mr-0 flex h-[100%] w-[100%] flex-col items-center gap-5 rounded-lg border-slate-800 bg-slate-800">
      <Box className="h-[30%] pb-3 pt-11">
        <ColorPicker
          size={130}
          brushSettings={inputManager.getSettings().brushSettings.getCurrentPreset()}
        />
      </Box>

      <Box className="h-fit w-full pl-4 pr-4 pt-4">
        <BrushSettingsPanel
          height={300}
          brushSettings={inputManager.getSettings().brushSettings.getCurrentPreset()}
        />
      </Box>
    </Box>
  );
}

export default RightBar;
