import { ReactElement } from "react";
import styled from "styled-components";
import { ActivateDeactivate } from "./components/ActivateDeactivate";
import { SignMessage } from "./components/SignMessage";
import { SectionDivider } from "./components/SectionDivider";
import { WalletStatus } from "./components/WalletStatus";
import UserStory from "./components/UserStory";
import React from "react";

const StyledAppDiv = styled.div`
  display: grid;
  grid-gap: 20px;
`;

const App = (): ReactElement => {
  return (
    <StyledAppDiv>
      <ActivateDeactivate />
      <SectionDivider />
      <WalletStatus />
      <SectionDivider />
      <SignMessage />
      <SectionDivider />
      <UserStory />
    </StyledAppDiv>
  );
};

export default App;
