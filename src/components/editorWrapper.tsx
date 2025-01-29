/* eslint-disable @typescript-eslint/no-non-null-assertion */
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import { Box, Typography } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import { ClipLoader } from 'react-spinners';
import EditorApplication from '../drawingEditor/application';
import { type InputManager } from '~/drawingEditor/Input/toolSystem/inputManager';

export interface EditorProps {
  inputManager: InputManager;
}
interface EditorWrapperProps {
  EditorComponent: React.ComponentType<EditorProps>;
}

type State = { type: 'loading' } | { type: 'error'; errorMsg: string } | { type: 'finished' };

function LoadingFallback(): React.JSX.Element {
  return (
    <Box className="align absolute z-10 flex h-full w-full touch-none select-none flex-col items-center justify-center gap-7 bg-black">
      <ClipLoader color="#43a333" size={300} loading={true} />
    </Box>
  );
}

function ErrorFallback({ error }: { error: string }): React.JSX.Element {
  console.error(error);
  return (
    <Box className="align absolute z-10 flex h-full w-full touch-none select-none flex-col items-center justify-center gap-7 bg-black text-white">
      <SentimentVeryDissatisfiedIcon sx={{ width: 100, height: 100, color: '#43a333' }} />
      <Typography className="mb-4">Woops! It seems like the editor could not load</Typography>
      <Typography>The error: {error}</Typography>
    </Box>
  );
}

function EditorWrapper({ EditorComponent }: EditorWrapperProps) {
  const [state, setState] = useState<State>({ type: 'loading' });
  const [settings, setSettings] = useState<InputManager | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    function initialize() {
      EditorApplication.init(canvasRef.current!)
        .then((result) => {
          result.match(
            (app) => {
              setSettings(app.inputManager);
              setState({ type: 'finished' });
            },
            (e) => setState({ type: 'error', errorMsg: e })
          );
        })
        .catch((e) => {
          console.error(e);
          setState({ type: 'error', errorMsg: JSON.stringify(e) });
        });
    }

    setTimeout(initialize, 750);
  }, []);

  return (
    <Box className="flex h-full w-full touch-none select-none flex-row">
      {state.type == 'loading' ? (
        <LoadingFallback />
      ) : state.type == 'error' ? (
        <ErrorFallback error={state.errorMsg} />
      ) : (
        <></>
      )}

      {settings && <EditorComponent inputManager={settings} />}
      <canvas
        ref={canvasRef}
        width={1000}
        height={1000}
        className="absolute z-0 h-full w-full touch-none select-none bg-black"
      ></canvas>
    </Box>
  );
}

export default EditorWrapper;
