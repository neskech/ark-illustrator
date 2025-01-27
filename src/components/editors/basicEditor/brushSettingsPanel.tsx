import { Box, Typography } from '@mui/material';
import { useState } from 'react';
import Slider from '~/components/util/Slider';
import { type StampBrushSettings } from '~/drawingEditor/Input/toolSystem/settings/brushSettings';

export interface BrushSettingsProps {
  brushSettings: StampBrushSettings;
  height: number;
}

function BrushSettingsPanel({ brushSettings, height }: BrushSettingsProps) {
  const [size, setSize_] = useState<number>(brushSettings.size);
  const setSize = (val: number) => {
    brushSettings.size = val;
    setSize_(val);
  };

  const [minSize, setMinSize_] = useState<number>(brushSettings.minSize);
  const setMinSize = (val: number) => {
    brushSettings.minSize = val;
    setMinSize_(val);
  };

  const [maxSize, setMaxSize_] = useState<number>(brushSettings.maxSize);
  const setMaxSize = (val: number) => {
    brushSettings.maxSize = val;
    setMaxSize_(val);
  };

  const [opacity, setOpacity_] = useState<number>(brushSettings.opacity);
  const setOpacity = (val: number) => {
    brushSettings.opacity = val;
    setOpacity_(val);
  };

  const [minOpacity, setMinOpacity_] = useState<number>(brushSettings.minOpacity);
  const setMinOpacity = (val: number) => {
    brushSettings.minOpacity = val;
    setMinOpacity_(val);
  };

  const [maxOpacity, setMaxOpacity_] = useState<number>(brushSettings.maxOpacity);
  const setMaxOpacity = (val: number) => {
    brushSettings.maxOpacity = val;
    setMaxOpacity_(val);
  };

  const [flow, setFlow_] = useState<number>(0.01);
  const setFlow = (val: number) => {
    brushSettings.flow = val;
    setFlow_(val);
  };

  const normalize = (val: number, min: number, max: number) => {
    const v = (val - min) / (max - min)
    return Math.round(100 * v)
  }

  return (
    <div className="w-full bg-neutral-800 pl-3 font-mono text-sm text-neutral-200">
      <Slider
        label="Size"
        rawValue={size}
        displayValue={normalize(size, 0.05, 0.1)}
        setValue={setSize}
        min={0.05}
        max={0.1}
        units={'px'}
        round={false}
        width="95%"
      />

      <Slider
        label="Opacity"
        rawValue={opacity}
        displayValue={normalize(opacity, 0.005, 0.3)}
        setValue={setOpacity}
        min={0.005}
        max={0.3}
        units={'%'}
        round={false}
        width="95%"
      />

      <Slider
        label="Flow"
        rawValue={flow}
        displayValue={normalize(flow, 0.005, 0.3)}
        setValue={setFlow}
        min={0.005}
        max={0.3}
        units={'%'}
        round={false}
        width="95%"
      />
    </div>
  );
}

export default BrushSettingsPanel;
