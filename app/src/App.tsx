import { ReactElement, useState } from 'react';
import {
  Box,
  createTheme,
  Divider,
  PaletteMode,
  Stack,
  ThemeProvider,
} from '@mui/material';
import { ActivateDeactivateWallet, Navbar, UserStory } from './components';

const App = (): ReactElement => {
  const [mode, setMode] = useState<PaletteMode>('light');

  const themeMode = createTheme({
    palette: {
      mode: mode,
    },
  });

  return (
    <ThemeProvider theme={themeMode}>
      <Box
        bgcolor={'background.default'}
        color={'text.primary'}
        sx={{
          display: 'grid',
          gridGap: '20px',
        }}
      >
        <Navbar setMode={setMode} mode={mode} />
        <Stack direction='column' spacing={2} justifyContent='space-between'>
          <ActivateDeactivateWallet />
          <Divider />
          <UserStory />
        </Stack>
      </Box>
    </ThemeProvider>
  );
};

export default App;
