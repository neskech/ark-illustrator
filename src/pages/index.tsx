import { type NextPage } from 'next';
import { Box } from '@mui/system';
import EditorWrapper from '~/components/editorWrapper';
import { BasicEditor } from '~/components/editors/basicEditor/basicEditor';
import Script from 'next/script';

const Home: NextPage = () => {
  return (
    <Box className="h-screen w-screen touch-none">

      {/* <Script
        src="https://greggman.github.io/webgl-memory/webgl-memory.js"
        strategy="lazyOnload"
        onLoad={() => console.log("Script loaded!")}
        crossOrigin='anonymous'
      /> */}
      <EditorWrapper EditorComponent={BasicEditor} />
    </Box>
  );
};

export default Home;
