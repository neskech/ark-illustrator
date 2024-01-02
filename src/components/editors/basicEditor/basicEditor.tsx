import { Box } from '@mui/material';
import { useEffect, useState } from 'react';
import EventManager from '~/application/eventSystem/eventManager';
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
    <Box className="pointer-events-none z-30 h-[100%] w-[100%]">
      <Box className="pointer-events-auto z-20 float-left flex h-full w-[80px] flex-col justify-center">
        <Box className="z-20 float-left h-[100%] w-[80px] rounded-lg border-slate-800 bg-slate-800 p-6">
          <LeftBar settingsObject={settings} />
        </Box>
      </Box>

      <Box className="pointer-events-auto z-20 ml-auto mr-0 flex h-full w-[150px] flex-col justify-center">
        <RightBar settingsObject={settings} />
      </Box>

      <EyeDropper brushSettings={settings.settings.brushSettings[0]} />

      {showSettings ? (
        <SettingsDialog open={showSettings} onClose={() => setShowSettings(false)} />
      ) : (
        <div> </div>
      )}
    </Box>
  );
}
