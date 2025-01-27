import { Box } from '@mui/material';
import ColorPicker from './colorPicker';
import BrushSettingsPanel from './brushSettingsPanel';
import { type InputManager } from '~/drawingEditor/Input/toolSystem/inputManager';
import { type StampBrushSettings } from '~/drawingEditor/Input/toolSystem/settings/brushSettings';

export interface RightBarProps {
  inputManager: InputManager;
}

// pointer-events-auto z-20 ml-auto mr-0 flex h-full w-[150px] flex-col justify-center
function RightBar({ inputManager }: RightBarProps) {
  return (
    <Box className="pointer-events-auto z-20 ml-auto mr-0 h-[100%] w-[150px] flex flex-col items-center gap-5 bg-neutral-800 font-mono text-neutral-200">
      <Box className="h-[30%] pb-3 pt-11">
        <ColorPicker
          size={130}
        />
      </Box>

      <Box className="h-fit w-full pr-4 pt-4">
        <BrushSettingsPanel
          height={300}
          brushSettings={inputManager.getSettings().brushConfigurations.getCurrentPreset().brushSettings as StampBrushSettings}
        />
      </Box>
    </Box>
  );
}

export default RightBar;
