import React, { ReactElement } from 'react';
import { useState } from 'react';
import {
  Box,
  createTheme,
  PaletteMode,
  Stack,
  ThemeProvider,
} from '@mui/material';
import {
  ActivateDeactivate,
  SectionDivider,
  WalletStatus,
  UserStory,
  SignMessage,
  Navbar,
} from './components';

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
          <ActivateDeactivate />
          <SectionDivider />
          <WalletStatus />
          <SectionDivider />
          <SignMessage />
          <SectionDivider />
          <UserStory />
        </Stack>
      </Box>
    </ThemeProvider>
  );
};

export default App;
