import { Button } from '@mui/material';
import { styled } from '@mui/system';
import { useWeb3React } from '@web3-react/core';
import { MouseEvent, ReactElement } from 'react';
import { Provider } from '../utils/provider';

const StyledSignButton = styled(Button)({
  width: '150px',
  color: 'white',
  backgroundColor: '#1976d2',
  borderColor: 'blue',
  cursor: 'pointer',
  placeSelf: 'center',
});

const SignMessage = (): ReactElement => {
  const context = useWeb3React<Provider>();
  const { account, active, library } = context;

  const handleSignMessage = (event: MouseEvent<HTMLButtonElement>): void => {
    event.preventDefault();

    if (!library || !account) {
      window.alert('Wallet not connected');
      return;
    }

    const signMessage = async (
      library: Provider,
      account: string
    ): Promise<void> => {
      try {
        const signature = await library.getSigner(account).signMessage('👋');
        window.alert(`Successful\n${signature}`);
      } catch (error: any) {
        window.alert(`Error ${error && error.message ? error.message : ''}`);
      }
    };

    signMessage(library, account).catch(console.error);
  };

  return (
    <StyledSignButton
      disabled={!active}
      style={{
        cursor: !active ? 'not-allowed' : 'pointer',
        borderColor: !active ? 'unset' : 'blue',
      }}
      onClick={handleSignMessage}
    >
      Sign Message
    </StyledSignButton>
  );
};

export default SignMessage;
