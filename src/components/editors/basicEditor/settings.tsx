/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  Dialog,
  Paper,
  type PaperProps,
  Slider,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  Button,
} from '@mui/material';
import { useState } from 'react';
import Draggable from 'react-draggable';
import { type BrushSettings } from '~/drawingEditor/canvas/toolSystem/tools/brush';
import CheckIcon from '@mui/icons-material/Check';
import CancelIcon from '@mui/icons-material/Cancel';
import { getSpacingFromBrushSettings } from '../../../drawingEditor/canvas/utils/stabilizing/stabilizer';

const PaperComponent = (props: PaperProps) => {
  return (
    <Draggable handle="#draggable-dialog-title" cancel={'[class*="MuiDialogContent-root"]'}>
      <Paper {...props} style={{ width: '40vh', padding: '60px' }} />
    </Draggable>
  );
};

interface Props {
  open: boolean;
  brushSettings: BrushSettings;
  onClose: () => void;
}

/* This is nasty I KNOW!!!! */
export let allowLimitedStrokeLength = true;

export const SettingsDialog = ({ open, brushSettings, onClose }: Props) => {
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

  const [flow, setFlow_] = useState<number>(brushSettings.flow);
  const setFlow = (e: Event, val: number) => {
    brushSettings.flow = val;
    setFlow_(val);
  };

  const [smoothing, setSmoothing_] = useState<number>(brushSettings.stabilization);
  const setSmoothing = (e: Event, val: number) => {
    brushSettings.stabilization = val;
    setSmoothing_(val);
  };

  const [spacing, setSpacing_] = useState<number>(getSpacingFromBrushSettings(brushSettings));
  const setSpacing = (e: Event, val: number) => {
    brushSettings.spacing = val;
    setSpacing_(val);
  };

  const [limitStrokeLength, setLimitStrokeLength_] = useState<'yes' | 'no'>(
    allowLimitedStrokeLength ? 'yes' : 'no'
  );
  const setLimitStrokeLength = (e: unknown, val: 'yes' | 'no') => {
    allowLimitedStrokeLength = val == 'yes';
    setLimitStrokeLength_(val);
  };

  return (
    <Dialog PaperComponent={PaperComponent} open={open} style={{}}>
      <Button variant="contained" onClick={() => onClose()} sx={{ marginBottom: '50px' }}>
        <CancelIcon />
      </Button>

      <Stack spacing={2} direction="row" sx={{ mb: 1 }} alignItems="center">
        <Typography> Brush Size </Typography>
        <Slider
          aria-label="Brush Size"
          value={size}
          min={0}
          max={0.5}
          step={0.01}
          onChange={(e, val) => setSize(e, val as number)}
        />
      </Stack>

      <Stack spacing={2} direction="row" sx={{ mb: 1 }} alignItems="center">
        <Typography> Min Brush Size </Typography>
        <Slider
          aria-label="Min Brush Size"
          value={minSize}
          min={0}
          max={1}
          step={0.01}
          onChange={(e, val) => setMinSize(e, val as number)}
        />
      </Stack>

      <Stack spacing={2} direction="row" sx={{ mb: 1 }} alignItems="center">
        <Typography> Max Brush Size </Typography>
        <Slider
          aria-label="Max Brush Size"
          value={maxSize}
          min={0}
          max={1}
          step={0.01}
          onChange={(e, val) => setMaxSize(e, val as number)}
        />
      </Stack>

      <Stack spacing={2} direction="row" sx={{ mb: 1 }} alignItems="center">
        <Typography> Opacity </Typography>
        <Slider
          aria-label="Opacity"
          value={opacity}
          min={0}
          max={1}
          step={0.01}
          onChange={(e, val) => setOpacity(e, val as number)}
        />
      </Stack>

      <Stack spacing={2} direction="row" sx={{ mb: 1 }} alignItems="center">
        <Typography> Min Opacity </Typography>
        <Slider
          aria-label="Min Opacity"
          value={minOpacity}
          min={0}
          max={1}
          step={0.01}
          onChange={(e, val) => setMinOpacity(e, val as number)}
        />
      </Stack>

      <Stack spacing={2} direction="row" sx={{ mb: 1 }} alignItems="center">
        <Typography> Max Opacity </Typography>
        <Slider
          aria-label="Max Opacity"
          value={maxOpacity}
          min={0}
          max={1}
          step={0.01}
          onChange={(e, val) => setMaxOpacity(e, val as number)}
        />
      </Stack>

      <Stack spacing={2} direction="row" sx={{ mb: 1 }} alignItems="center">
        <Typography> Flow </Typography>
        <Slider
          aria-label="Flow"
          value={flow}
          min={0}
          max={1}
          step={0.01}
          onChange={(e, val) => setFlow(e, val as number)}
        />
      </Stack>

      <Stack spacing={2} direction="row" sx={{ mb: 1 }} alignItems="center">
        <Typography> Smoothing (Produces visual artifacts for now) </Typography>
        <Slider
          aria-label="Smoothing"
          value={smoothing}
          min={0}
          max={1}
          step={0.01}
          onChange={(e, val) => setSmoothing(e, val as number)}
        />
      </Stack>

      <Stack spacing={2} direction="row" sx={{ mb: 1 }} alignItems="center">
        <Typography> Spacing </Typography>
        <Slider
          aria-label="Spacing"
          value={spacing}
          min={0.005}
          max={0.5}
          step={0.001}
          onChange={(e, val) => setSpacing(e, val as number)}
        />
      </Stack>

      <Stack spacing={2} direction="row" sx={{ mb: 1 }} alignItems="center">
        Allow limited length brush strokes? (No causes visual artifacts)
        <ToggleButtonGroup
          color="primary"
          value={limitStrokeLength}
          exclusive
          onChange={(e, val) => setLimitStrokeLength(e, val as 'yes' | 'no')}
          aria-label="Limited Brush Stroes"
        >
          <ToggleButton value="yes">
            <CheckIcon />
          </ToggleButton>
          <ToggleButton value="no">
            <CancelIcon />
          </ToggleButton>
        </ToggleButtonGroup>
      </Stack>
    </Dialog>
  );
};
