import React from 'react';
import ReactDOM from 'react-dom/client';
import { DAppProvider, Goerli } from '@usedapp/core';

import App from './App';
import './index.css';

const DAPP_CONFIG = {
  readOnlyChainId: Goerli.chainId || 5,
  readOnlyUrls: {
    [Goerli.chainId]: import.meta.env.VITE_GOERLI_RPC_URL || '',
  },
};

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <DAppProvider config={DAPP_CONFIG}>
      <App />
    </DAppProvider>
  </React.StrictMode>
);
