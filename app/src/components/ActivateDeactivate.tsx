import { AbstractConnector } from "@web3-react/abstract-connector";
import { UnsupportedChainIdError, useWeb3React } from "@web3-react/core";
import {
  NoEthereumProviderError,
  UserRejectedRequestError,
} from "@web3-react/injected-connector";
import { MouseEvent, ReactElement, useState } from "react";
import styled from "styled-components";
import { Provider } from "../utils/provider";
import { injected } from "../utils/connectors";
import { useEagerConnect, useInactiveListener } from "../utils/hooks";
import React from "react";

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

const StyledActivateDeactivateDiv = styled.div`
  display: grid;
  grid-template-rows: 1fr;
  grid-template-columns: 1fr 1fr;
  grid-gap: 10px;
  place-self: center;
  align-items: center;
`;

const StyledActivateButton = styled.button`
  width: 150px;
  height: 2rem;
  border-radius: 1rem;
  border-color: green;
  cursor: pointer;
`;

const StyledDeactivateButton = styled.button`
  width: 150px;
  height: 2rem;
  border-radius: 1rem;
  border-color: red;
  cursor: pointer;
`;

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

  /* Handle Logic to eagerly connect to the injected Ethereum Provider, if it exists and has granted Access already */
  const eagerConnectionSuccessful = useEagerConnect();

  /* Handle Logic to connect in Reaction to certain Events on the injected Ethereum Provider, if it exists */
  useInactiveListener(!eagerConnectionSuccessful);

  return (
    <StyledActivateButton
      disabled={active}
      style={{
        cursor: active ? "not-allowed" : "pointer",
        borderColor: activating ? "orange" : active ? "unset" : "green",
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
      style={{
        cursor: active ? "pointer" : "not-allowed",
        borderColor: active ? "red" : "unset",
      }}
      onClick={handleDeactivate}
    >
      Disconnect
    </StyledDeactivateButton>
  );
};

export const ActivateDeactivate = (): ReactElement => {
  const context = useWeb3React<Provider>();
  const { error } = context;

  if (!!error) {
    window.alert(getErrorMessage(error));
  }

  return (
    <StyledActivateDeactivateDiv>
      <Activate />
      <Deactivate />
    </StyledActivateDeactivateDiv>
  );
};
