import { Button } from '@mui/material';
import { useEthers, useLookupAddress } from '@usedapp/core';
import { ReactElement, useEffect, useState } from 'react';

const WalletButton = (): ReactElement => {
  const { account, activateBrowserWallet, deactivate } = useEthers();
  const { ens } = useLookupAddress(account);

  const [accountAddress, setAccountAddress] = useState('');

  useEffect(() => {
    if (ens) {
      setAccountAddress(ens);
    } else if (account) {
      setAccountAddress(account);
    } else {
      setAccountAddress('');
    }
  }, [account, ens, setAccountAddress]);

  return (
    <Button
      variant='contained'
      color='secondary'
      sx={{
        width: '500px',
      }}
      onClick={() => {
        if (!account) {
          activateBrowserWallet();
        } else {
          deactivate();
        }
      }}
    >
      {accountAddress || 'Connect Wallet'}
    </Button>
  );
};

export default WalletButton;
