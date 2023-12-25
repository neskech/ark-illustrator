import { Box } from '@mui/material';
import { useEffect, useState } from 'react';
import EventManager from '~/utils/event/eventManager';
import type EditorProps from '../types';
import LeftBar from './leftBar';
import { SettingsDialog } from './settings';
import RightBar from './rightBar';
import EyeDropper from '~/components/eyeDropper';

export function BasicEditor({ settings }: EditorProps) {
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      EventManager.subscribe('openSettings', () => setShowSettings((v) => !v));
    }, 1000);
  }, []);

  return (
    <Box className='pointer-events-none w-[100%] h-[100%] z-30'> 

      <Box className="z-20 pointer-events-auto float-left h-full w-[80px] flex flex-col justify-center">
        <Box className="z-20 float-left h-[100%] w-[80px] rounded-lg border-slate-800 bg-slate-800 p-6">
          <LeftBar settingsObject={settings} />
        </Box>
      </Box>

      <Box className="z-20 pointer-events-auto ml-auto mr-0 h-full w-[150px] flex flex-col justify-center">
          <RightBar settingsObject={settings} />
      </Box>

      <EyeDropper brushSettings={settings.settings.brushSettings[0]}/>

      {showSettings ? (
        <SettingsDialog open={showSettings} onClose={() => setShowSettings(false)} />
      ) : (
        <div> </div>
      )}
   </Box>
  );
}
