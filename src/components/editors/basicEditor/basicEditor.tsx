import { Box } from '@mui/material';
import { useEffect, useState } from 'react';
import EventManager from '~/util/eventSystem/eventManager';
import LeftBar from './leftBar';
import { SettingsDialog } from './settings';
import RightBar from './rightBar';
import EyeDropper from '~/components/eyeDropper';
import { type EditorProps } from '~/components/editorWrapper';
import { StampBrushSettings } from '~/drawingEditor/Input/toolSystem/settings/brushSettings';

export function BasicEditor({ inputManager }: EditorProps) {
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      EventManager.subscribe('openSettings', () => setShowSettings((v) => !v));
    }, 1000);
  }, []);

  return (
    <Box className="pointer-events-none z-30 h-[100%] w-[100%]">
      <LeftBar inputManager={inputManager} />

      <RightBar inputManager={inputManager} />

      <EyeDropper />

      {showSettings ? (
        <SettingsDialog
          open={showSettings}
          brushSettings={
            inputManager.getSettings().brushConfigurations.getCurrentPreset()
              .brushSettings as StampBrushSettings
          }
          onClose={() => setShowSettings(false)}
        />
      ) : (
        <div> </div>
      )}
    </Box>
  );
}
