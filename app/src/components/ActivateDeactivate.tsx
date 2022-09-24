import { Box, Button } from '@mui/material';
import { styled } from '@mui/system';
import { AbstractConnector } from '@web3-react/abstract-connector';
import { UnsupportedChainIdError, useWeb3React } from '@web3-react/core';
import {
  NoEthereumProviderError,
  UserRejectedRequestError,
} from '@web3-react/injected-connector';
import { MouseEvent, ReactElement, useState } from 'react';
import { injected } from '../utils/connectors';
import { useEagerConnect, useInactiveListener } from '../utils/hooks';
import { Provider } from '../utils/provider';

type ActivateFunction = (
  connector: AbstractConnector,
  onError?: (error: Error) => void,
  throwErrors?: boolean
) => Promise<void>;

const getErrorMessage = (error: Error): string => {
  let errorMessage: string;

  switch (error.constructor) {
    case NoEthereumProviderError:
      errorMessage = `No Ethereum Browser Extension detected. Please install MetaMask Extension.`;
      break;
    case UnsupportedChainIdError:
      errorMessage = `You are connected to an unsupported Network.`;
      break;
    case UserRejectedRequestError:
      errorMessage = `Please authorize this Website to access your Ethereum Account.`;
      break;
    default:
      errorMessage = error.message;
  }

  return errorMessage;
};

const StyledActivateDeactivateBox = styled(Box)({
  display: 'grid',
  gridTemplateRows: '1fr',
  gridTemplateColumns: '1fr 1fr',
  gridGap: '10px',
  placeSelf: 'center',
  alignItems: 'center',
}) as typeof Box;

const StyledActivateButton = styled(Button)({
  width: '150px',
  color: 'white',
  backgroundColor: '#1976d2',
  borderColor: 'green',
  cursor: 'pointer',
}) as typeof Button;

const StyledDeactivateButton = styled(Button)({
  width: '150px',
  color: 'white',
  backgroundColor: '#1976d2',
  borderColor: 'red',
  cursor: 'pointer',
}) as typeof Button;

const Activate = (): ReactElement => {
  const context = useWeb3React<Provider>();
  const { activate, active } = context;

  const [activating, setActivating] = useState<boolean>(false);

  const handleActivate = (event: MouseEvent<HTMLButtonElement>): void => {
    event.preventDefault();

    const _activate = async (activate: ActivateFunction): Promise<void> => {
      setActivating(true);
      await activate(injected);
      setActivating(false);
    };

    _activate(activate).catch(console.error);
  };

  // Handle Logic to eagerly connect to the injected Ethereum Provider, if it exists and has granted Access already
  const eagerConnectionSuccessful = useEagerConnect();

  // Handle Logic to connect in Reaction to certain Events on the injected Ethereum Provider, if it exists
  useInactiveListener(!eagerConnectionSuccessful);

  return (
    <StyledActivateButton
      disabled={active}
      sx={{
        cursor: active ? 'not-allowed' : 'pointer',
        borderColor: activating ? 'orange' : active ? 'unset' : 'green',
      }}
      onClick={handleActivate}
    >
      Connect
    </StyledActivateButton>
  );
};

const Deactivate = (): ReactElement => {
  const context = useWeb3React<Provider>();
  const { deactivate, active } = context;

  const handleDeactivate = (event: MouseEvent<HTMLButtonElement>): void => {
    event.preventDefault();
    deactivate();
  };

  return (
    <StyledDeactivateButton
      disabled={!active}
      sx={{
        cursor: active ? 'pointer' : 'not-allowed',
        borderColor: active ? 'red' : 'unset',
      }}
      onClick={handleDeactivate}
    >
      Disconnect
    </StyledDeactivateButton>
  );
};

const ActivateDeactivate = (): ReactElement => {
  const context = useWeb3React<Provider>();
  const { error } = context;

  if (!!error) {
    window.alert(getErrorMessage(error));
  }

  return (
    <StyledActivateDeactivateBox>
      <Activate />
      <Deactivate />
    </StyledActivateDeactivateBox>
  );
};

export default ActivateDeactivate;
