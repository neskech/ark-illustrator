import { type NextPage } from 'next';
import Editor from '../components/editor';
import { Box } from '@mui/system';

const Home: NextPage = () => {
  return (
    <Box className="h-screen w-screen">
      <Editor />
    </Box>
  );
};

export default Home;
