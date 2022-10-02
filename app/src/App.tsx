import React, { ReactElement, useState } from 'react';
import {
  Box,
  createTheme,
  CssBaseline,
  PaletteMode,
  Stack,
  ThemeProvider,
} from '@mui/material';
import { Navbar, UserStory } from './components';

const App = (): ReactElement => {
  const [mode, setMode] = useState<PaletteMode>('light');

  const themeMode = createTheme({
    palette: {
      mode: mode,
    },
  });

  return (
    <React.Fragment>
      <CssBaseline />
      <ThemeProvider theme={themeMode}>
        <Navbar setMode={setMode} mode={mode} />
        <Box
          bgcolor={'background.default'}
          color={'text.primary'}
          sx={{
            padding: 2,
          }}
        >
          <Stack direction='column' spacing={4}>
            <UserStory />
          </Stack>
        </Box>
      </ThemeProvider>
    </React.Fragment>
  );
};

export default App;
