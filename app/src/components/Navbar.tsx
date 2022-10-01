import { FunctionComponent, ReactElement } from 'react';
import {
  AppBar,
  FormControlLabel,
  FormGroup,
  styled,
  Switch,
  Toolbar,
  Typography,
} from '@mui/material';
import { ModeNight } from '@mui/icons-material';

type NavbarProps = {
  mode: string;
  setMode: any;
};

const StyledToolbar = styled(Toolbar)({
  display: 'flex',
  justifyContent: 'space-between',
}) as typeof Toolbar;

const Navbar: FunctionComponent<NavbarProps> = ({
  mode,
  setMode,
}): ReactElement => {
  return (
    <AppBar position='sticky'>
      <StyledToolbar>
        <Typography variant='h6' sx={{ display: { xs: 'none', sm: 'block' } }}>
          Navbar
        </Typography>
        <FormGroup>
          <FormControlLabel
            control={
              <Switch
                onChange={(e) => setMode(mode === 'light' ? 'dark' : 'light')}
              />
            }
            label={<ModeNight />}
          />
        </FormGroup>
      </StyledToolbar>
    </AppBar>
  );
};

export default Navbar;
