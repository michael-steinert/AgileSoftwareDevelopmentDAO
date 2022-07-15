import { useWeb3React } from "@web3-react/core";
import React from "react";
import { MouseEvent, ReactElement } from "react";
import styled from "styled-components";
import { Provider } from "../../../../hardhat-ethers-react-ts-starter-main/hardhat-ethers-react-ts-starter-main/frontend/src/utils/provider";

const StyledButton = styled.button`
  width: 150px;
  height: 2rem;
  border-radius: 1rem;
  border-color: blue;
  cursor: pointer;
  place-self: center;
`;

export const SignMessage = (): ReactElement => {
  const context = useWeb3React<Provider>();
  const { account, active, library } = context;

  const handleSignMessage = (event: MouseEvent<HTMLButtonElement>): void => {
    event.preventDefault();

    if (!library || !account) {
      window.alert("Wallet not connected");
      return;
    }

    const signMessage = async (
      library: Provider,
      account: string
    ): Promise<void> => {
      try {
        const signature = await library.getSigner(account).signMessage("👋");
        window.alert(`Successful\n${signature}`);
      } catch (error: any) {
        window.alert(`Error ${error && error.message ? error.message : ""}`);
      }
    };

    signMessage(library, account).catch(console.error);
  };

  return (
    <StyledButton
      disabled={!active}
      style={{
        cursor: !active ? "not-allowed" : "pointer",
        borderColor: !active ? "unset" : "blue",
      }}
      onClick={handleSignMessage}
    >
      Sign Message
    </StyledButton>
  );
};
