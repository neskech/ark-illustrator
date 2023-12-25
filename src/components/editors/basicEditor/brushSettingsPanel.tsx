import { Box, Slider, Typography } from '@mui/material';
import { useState } from 'react';
import { type BrushSettings } from '~/utils/canvas/tools/brush';

export interface BrushSettingsProps {
  brushSettings: BrushSettings;
  height: number;
}

function BrushSettingsPanel({ brushSettings, height }: BrushSettingsProps) {

  const [size, setSize_] = useState<number>(brushSettings.size);
  const setSize = (e: Event, val: number) => {
    brushSettings.size = val;
    setSize_(val);
  };

  const [minSize, setMinSize_] = useState<number>(brushSettings.minSize);
  const setMinSize = (e: Event, val: number) => {
    brushSettings.minSize = val;
    setMinSize_(val);
  };

  const [maxSize, setMaxSize_] = useState<number>(brushSettings.maxSize);
  const setMaxSize = (e: Event, val: number) => {
    brushSettings.maxSize = val;
    setMaxSize_(val);
  };

  const [opacity, setOpacity_] = useState<number>(brushSettings.opacity);
  const setOpacity = (e: Event, val: number) => {
    brushSettings.opacity = val;
    setOpacity_(val);
  };

  const [minOpacity, setMinOpacity_] = useState<number>(brushSettings.minOpacity);
  const setMinOpacity = (e: Event, val: number) => {
    brushSettings.minOpacity = val;
    setMinOpacity_(val);
  };

  const [maxOpacity, setMaxOpacity_] = useState<number>(brushSettings.maxOpacity);
  const setMaxOpacity = (e: Event, val: number) => {
    brushSettings.maxOpacity = val;
    setMaxOpacity_(val);
  };

  const [flow, setFlow_] = useState<number>(0.01);
  const setFlow = (e: Event, val: number) => {
    brushSettings.flow = val;
    setFlow_(val);
  };

  return (
    <Box className="flex h-full w-[90%] flex-col items-center justify-center gap-4">
      <Box className="ml-0 mr-auto grid grid-cols-2">
        <Typography fontSize={15} className="ml-0 mr-auto" sx={{ color: '#dfe0eb' }}>
          Brush Size
        </Typography>
        <Slider
          aria-label="Brush Size"
          value={size}
          min={0}
          max={0.5}
          step={0.01}
          className="absolute left-3"
          sx={{ width: '90%', color: '#3c69cf' }}
          onChange={(e, val) => setSize(e, val as number)}
        />
      </Box>

      <Box className="ml-0 mr-auto grid grid-cols-2">
        <Typography fontSize={15} sx={{ color: '#dfe0eb' }}>
          Min Brush Size
        </Typography>
        <Slider
          aria-label="Min Brush Size"
          value={minSize}
          min={0}
          max={1}
          step={0.01}
          className="absolute left-3"
          sx={{ width: '90%', color: '#3c69cf' }}
          onChange={(e, val) => setMinSize(e, val as number)}
        />
      </Box>

      <Box className="ml-0 mr-auto grid grid-cols-2">
        <Typography fontSize={15} sx={{ color: '#dfe0eb' }}>
          Max Brush Size
        </Typography>
        <Slider
          aria-label="Max Brush Size"
          value={maxSize}
          min={0}
          max={1}
          step={0.01}
          className="absolute left-3"
          sx={{ width: '90%', color: '#3c69cf' }}
          onChange={(e, val) => setMaxSize(e, val as number)}
        />
      </Box>

      <Box className="ml-0 mr-auto grid grid-cols-2">
        <Typography fontSize={15} sx={{ color: '#dfe0eb' }}>
          Opacity
        </Typography>
        <Slider
          aria-label="Opacity"
          value={opacity}
          min={0}
          max={1}
          step={0.01}
          className="absolute left-3"
          sx={{ width: '90%', color: '#3c69cf' }}
          onChange={(e, val) => setOpacity(e, val as number)}
        />
      </Box>

      <Box className="ml-0 mr-auto grid grid-cols-2">
        <Typography fontSize={15} sx={{ color: '#dfe0eb' }}>
          Min Opacity
        </Typography>
        <Slider
          aria-label="Min Opacity"
          value={minOpacity}
          min={0}
          max={1}
          step={0.01}
          className="absolute left-3"
          sx={{ width: '90%', color: '#3c69cf' }}
          onChange={(e, val) => setMinOpacity(e, val as number)}
        />
      </Box>

      <Box className="ml-0 mr-auto grid grid-cols-2">
        <Typography fontSize={15} sx={{ color: '#dfe0eb' }}>
          Max Opacity
        </Typography>
        <Slider
          aria-label="Max Opacity"
          value={maxOpacity}
          min={0}
          max={1}
          step={0.01}
          className="absolute left-3"
          sx={{ width: '90%', color: '#3c69cf' }}
          onChange={(e, val) => setMaxOpacity(e, val as number)}
        />
      </Box>

      <Box className="ml-0 mr-auto grid grid-cols-2">
        <Typography fontSize={15} sx={{ color: '#dfe0eb' }}>
          Flow
        </Typography>
        <Slider
          aria-label="Flow"
          value={flow}
          min={0.01}
          max={0.1}
          step={0.01}
          className="absolute left-11"
          sx={{ color: '#3c69cf',width: '100%' }}
          onChange={(e, val) => setFlow(e, val as number)}
        />
      </Box>
    </Box>
  );
}

export default BrushSettingsPanel;
