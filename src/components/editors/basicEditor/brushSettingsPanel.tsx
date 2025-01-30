import { useContext, useState } from 'react';
import { EditorContext } from '~/components/editorWrapper';
import Slider from '~/components/util/Slider';
import { type StampBrushSettings } from '~/drawingEditor/Input/toolSystem/settings/brushSettings';

function BrushSettingsPanel() {
  const context = useContext(EditorContext);
  const brushSettings = context.inputManager.getSettings().brushConfigurations.getCurrentPreset()
    .brushSettings as StampBrushSettings;

  const [size, setSize_] = useState<number>(brushSettings.size);
  const setSize = (val: number) => {
    brushSettings.size = val;
    setSize_(val);
  };

  const [opacity, setOpacity_] = useState<number>(brushSettings.opacity);
  const setOpacity = (val: number) => {
    brushSettings.opacity = val;
    setOpacity_(val);
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
