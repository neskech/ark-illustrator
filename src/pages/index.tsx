import { type NextPage } from 'next';
import { Box } from '@mui/system';
import EditorWrapper from '~/components/editorWrapper';
import { BasicEditor } from '~/components/editors/basicEditor/basicEditor';

const Home: NextPage = () => {
  return (
    <Box className="h-screen w-screen touch-none">
      <EditorWrapper EditorComponent={BasicEditor} />
    </Box>
  );
};

export default Home;
