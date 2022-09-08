import { useWeb3React } from '@web3-react/core';
import { ethers } from 'ethers';
import React, { ReactElement, useEffect, useState } from 'react';
import { styled } from '@mui/system';
import { Provider } from '../utils/provider';
import { Box } from '@mui/material';

type CleanupFunction = (() => void) | undefined;

const StyledWalletStatusBox = styled(Box)({
  display: 'grid',
  gridTemplateRows: '1fr',
  gridTemplateColumns:
    '0.6fr 0.1fr 0.6fr 1fr 0.1fr 0.6fr 0.5fr 0.1fr 1.1fr 0.4fr 0.1fr 1fr 0.9fr 0.1fr 0.7fr 0.1fr',
  gridGap: '10px',
  placeSelf: 'center',
  alignItems: 'center',
});

const StyledStatusIcon = styled('h1')({
  margin: 0,
});

const ChainId = (): ReactElement => {
  const { chainId } = useWeb3React<Provider>();

  return (
    <React.Fragment>
      <span>
        <strong>Chain Id</strong>
      </span>
      <span>{chainId ?? ''}</span>
    </React.Fragment>
  );
};

const BlockNumber = (): ReactElement => {
  const { chainId, library } = useWeb3React<Provider>();
  const [blockNumber, setBlockNumber] = useState<number>();

  useEffect((): CleanupFunction => {
    if (!library) {
      return;
    }

    let stale = false;

    const getBlockNumber = async (library: Provider): Promise<void> => {
      try {
        const blockNumber: number = await library.getBlockNumber();

        if (!stale) {
          setBlockNumber(blockNumber);
        }
      } catch (error: any) {
        if (!stale) {
          setBlockNumber(undefined);
        }

        window.alert(`Error ${error && error.message ? error.message : ''}`);
      }
    };

    getBlockNumber(library).catch(console.error);

    library.on('block', setBlockNumber);

    return (): void => {
      stale = true;
      library.removeListener('block', setBlockNumber);
      setBlockNumber(undefined);
    };
    /* Ensuring Refresh if referential Identity of Library does not change across chainIds */
  }, [library, chainId]);

  return (
    <React.Fragment>
      <span>
        <strong>Block Number</strong>
      </span>
      <span>{blockNumber === null ? 'Error' : blockNumber ?? ''}</span>
    </React.Fragment>
  );
};

const Account = (): ReactElement => {
  const { account } = useWeb3React<Provider>();

  return (
    <React.Fragment>
      <span>
        <strong>Account</strong>
      </span>
      <span>
        {typeof account === 'undefined'
          ? ''
          : account
          ? `${account.substring(0, 6)}...${account.substring(
              account.length - 4
            )}`
          : ''}
      </span>
    </React.Fragment>
  );
};

const Balance = (): ReactElement => {
  const { account, library, chainId } = useWeb3React<Provider>();

  const [balance, setBalance] = useState<ethers.BigNumber>();

  useEffect((): CleanupFunction => {
    if (typeof account === 'undefined' || account === null || !library) {
      return;
    }

    let stale = false;

    const getBalance = async (
      library: Provider,
      account: string
    ): Promise<void> => {
      const balance: ethers.BigNumber = await library.getBalance(account);
      try {
        if (!stale) {
          setBalance(balance);
        }
      } catch (error: any) {
        if (!stale) {
          setBalance(undefined);
          window.alert(`Error ${error && error.message ? error.message : ''}`);
        }
      }
    };

    getBalance(library, account).catch(console.error);

    /* Create a named Balancer Handler Function to fetch the Balance each Block */
    const getBalanceHandler = (): void => {
      getBalance(library, account).catch(console.error);
    };

    library.on('block', getBalanceHandler);

    /* Use the Function Name to remove the Listener */
    return (): void => {
      stale = true;
      library.removeListener('block', getBalanceHandler);
      setBalance(undefined);
    };
    /* Ensuring Refresh if referential Identity of Library does not change across chainIds */
  }, [account, library, chainId]);

  return (
    <React.Fragment>
      <span>
        <strong>Balance</strong>
      </span>
      <span>
        {balance === null
          ? 'Error'
          : balance
          ? `Ξ${Math.round(+ethers.utils.formatEther(balance) * 1e4) / 1e4}`
          : ''}
      </span>
    </React.Fragment>
  );
};

/* Nonce corresponds to the Transaction Count */
const NextNonce = (): ReactElement => {
  const { account, library, chainId } = useWeb3React<Provider>();

  const [nextNonce, setNextNonce] = useState<number>();

  useEffect((): CleanupFunction => {
    if (typeof account === 'undefined' || account === null || !library) {
      return;
    }

    let stale = false;

    const getNextNonce = async (
      library: Provider,
      account: string
    ): Promise<void> => {
      const nextNonce: number = await library.getTransactionCount(account);
      try {
        if (!stale) {
          setNextNonce(nextNonce);
        }
      } catch (error: any) {
        if (!stale) {
          setNextNonce(undefined);
          window.alert(`Error ${error && error.message ? error.message : ''}`);
        }
      }
    };

    getNextNonce(library, account).catch(console.error);

    /* Create a named Next Nonce Handler Function to fetch the next Nonce each Block */
    const getNextNonceHandler = (): void => {
      getNextNonce(library, account).catch(console.error);
    };

    library.on('block', getNextNonceHandler);

    /* Use the Function Name to remove the Listener */
    return (): void => {
      stale = true;
      setNextNonce(undefined);
    };
    /* Ensuring Refresh if referential Identity of Library does not change across chainIds */
  }, [account, library, chainId]);

  return (
    <React.Fragment>
      <span>
        <strong>Next Nonce</strong>
      </span>
      <span>{nextNonce === null ? 'Error' : nextNonce ?? ''}</span>
    </React.Fragment>
  );
};

const StatusIcon = (): ReactElement => {
  const { active, error } = useWeb3React<Provider>();
  return (
    <StyledStatusIcon>{active ? '🟢' : error ? '🔴' : '🟠'}</StyledStatusIcon>
  );
};

const WalletStatus = (): ReactElement => {
  return (
    <StyledWalletStatusBox>
      <ChainId />
      <BlockNumber />
      <Account />
      <Balance />
      <NextNonce />
      <StatusIcon />
    </StyledWalletStatusBox>
  );
};

export default WalletStatus;
