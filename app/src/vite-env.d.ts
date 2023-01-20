/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GOERLI_RPC_URL: string;
  readonly VITE_MUMBAI_RPC_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
