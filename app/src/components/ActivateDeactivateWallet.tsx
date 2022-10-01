import { Box, Button } from '@mui/material';
import { styled } from '@mui/system';
import { shortenAddress, useEthers, useLookupAddress } from '@usedapp/core';
import { ReactElement, useEffect, useState } from 'react';

const StyledButton = styled(Button)({
  width: '150px',
  color: 'white',
  backgroundColor: '#1976d2',
  cursor: 'pointer',
}) as typeof Button;

const ActivateDeactivateWallet = (): ReactElement => {
  const { account, activateBrowserWallet, active, deactivate } = useEthers();
  const { ens } = useLookupAddress(account);

  const [accountAddress, setAccountAddress] = useState('');

  useEffect(() => {
    if (ens) {
      setAccountAddress(ens);
    } else if (account) {
      setAccountAddress(shortenAddress(account));
    } else {
      setAccountAddress('');
    }
  }, [account, ens, setAccountAddress]);

  return (
    <StyledButton
      onClick={() => {
        if (!account) {
          activateBrowserWallet();
        } else {
          deactivate();
        }
      }}
    >
      {accountAddress || 'Connect Wallet'}
    </StyledButton>
  );
};

export default ActivateDeactivateWallet;
