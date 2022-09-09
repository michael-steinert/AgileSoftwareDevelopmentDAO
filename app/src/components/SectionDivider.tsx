import { Box } from '@mui/material';
import { styled } from '@mui/system';

const SectionDivider = styled(Box)({
  borderTop: '2px solid darkgrey',
  /* Make the Row stretch to entire Width of the Grid */
  gridColumn: '1 / 1',
}) as typeof Box;

export default SectionDivider;
