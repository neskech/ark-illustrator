import { Box } from '@mui/material';
import { type SettingsObject } from '../types';
import ColorPicker from './colorPicker';
import BrushSettingsPanel from './brushSettingsPanel';

export interface RightBarProps {
  settingsObject: SettingsObject;
}

function RightBar({ settingsObject }: RightBarProps) {
  return (
    <Box className="z-20 ml-auto mr-0 flex h-[100%] w-[100%] flex-col items-center gap-5 rounded-lg border-slate-800 bg-slate-800">
      <Box className="h-[30%] pb-3 pt-11">
        <ColorPicker size={130} brushSettings={settingsObject.settings.brushSettings.getCurrentPreset()} />
      </Box>

      <Box className="h-fit pt-4 w-full pr-4 pl-4">
        <BrushSettingsPanel height={300} brushSettings={settingsObject.settings.brushSettings.getCurrentPreset()} />
      </Box>
    </Box>
  );
}

export default RightBar;
