import { Box } from '@mui/material';
import { useEffect, useState } from 'react';
import EventManager from '~/util/eventSystem/eventManager';
import LeftBar from './leftBar';
import { SettingsDialog } from './settings';
import RightBar from './rightBar';
import EyeDropper from '~/components/eyeDropper';

export function BasicEditor() {
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      EventManager.subscribe('openSettings', () => setShowSettings((v) => !v));
    }, 1000);
  }, []);

  return (
    <Box className="pointer-events-none z-30 h-[100%] w-[100%]">
      <LeftBar />
      <RightBar />
      <EyeDropper />
      {showSettings && (
        <SettingsDialog open={showSettings} onClose={() => setShowSettings(false)} />
      )}
    </Box>
  );
}
