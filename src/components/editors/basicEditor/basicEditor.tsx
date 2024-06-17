import { Box } from '@mui/material';
import { useEffect, useState } from 'react';
import EventManager from '~/util/eventSystem/eventManager';
import LeftBar from './leftBar';
import { SettingsDialog } from './settings';
import RightBar from './rightBar';
import EyeDropper from '~/components/eyeDropper';
import { type EditorProps } from '~/components/editorWrapper';

export function BasicEditor({ inputManager }: EditorProps) {
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
          <LeftBar inputManager={inputManager} />
        </Box>
      </Box>

      <Box className="pointer-events-auto z-20 ml-auto mr-0 flex h-full w-[150px] flex-col justify-center">
        <RightBar inputManager={inputManager} />
      </Box>

      <EyeDropper brushSettings={inputManager.getSettings().brushSettings.getCurrentPreset()} />

      {showSettings ? (
        <SettingsDialog
          open={showSettings}
          brushSettings={inputManager.getSettings().brushSettings.getCurrentPreset()}
          onClose={() => setShowSettings(false)}
        />
      ) : (
        <div> </div>
      )}
    </Box>
  );
}
