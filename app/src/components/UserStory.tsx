import React, {
  FunctionComponent,
  ReactElement,
  useEffect,
  useState,
} from 'react';
import { Box, Divider, Stack, Typography } from '@mui/material';
import { styled } from '@mui/system';
import { providers } from 'ethers';
import { useDaoGovernor, useUserStoryTreasury } from '../hooks';
import ProposalCreationModal from './ProposalCreationModal';
import UserStoryTable from './UserStoryTable';

const StyledTypography = styled(Typography)({
  fontWeight: 'bold',
  color: 'gray',
}) as typeof Typography;

const UserStory: FunctionComponent = (): ReactElement => {
  const [allProposals, setAllProposals] = useState<IProposal[]>([]);

  const { ethereum } = window as any;
  // A Provider is a Class which provides an Abstraction for a Connection to the Ethereum Network
  // It provides read-only Access to the Blockchain and its Status
  const provider = new providers.Web3Provider(ethereum);
  // A Signer is a Class which has Access to a Private Key,
  // which can sign Messages and Transactions to authorize the Network to charge the Account ETH to perform Operations
  const signer = provider.getSigner();

  // Initialize Dao Governor by using Custom Hook
  const [daoGovernor, daoGovernorInterface] = useDaoGovernor(signer!);

  // Initialize User Story Treasury by using Custom Hook
  const [userStoryTreasury, userStoryTreasuryInterface] = useUserStoryTreasury(
    signer!
  );

  useEffect((): void => {
    // Listen on emitted Event to update the Data in Real-Time
    // Subscribe to Event Calling Listener when the Event `ProposalCreated` occurs
    daoGovernor?.on('ProposalCreated', (
        proposalId: number,
        proposer: string,
        targets: any,
        signatures: any,
        calldata: any,
        startBlock: number,
        endBlock: number,
        description: string
      ) => {
        // Set new Proposal from Event
        setAllProposals((previousProposals: IProposal[]) => {
          return [
            ...previousProposals,
            {
              proposalId,
              proposer,
              targets,
              signatures,
              calldata,
              startBlock,
              endBlock,
              description,
            },
          ];
        });
      });
  }, [daoGovernor, userStoryTreasury]);

  return (
    <React.Fragment>
      <Stack>
        <Typography variant='h1'>Scrum DAO</Typography>
        <StyledTypography>
          User Story Treasury deployed at{' '}
          {userStoryTreasury ? (
            userStoryTreasury.address
          ) : (
            <em>Smart Contract not yet deployed</em>
          )}
        </StyledTypography>
        <StyledTypography>
          DAO Governor deployed at{' '}
          {daoGovernor ? (
            daoGovernor.address
          ) : (
            <em>Smart Contract not yet deployed</em>
          )}
        </StyledTypography>
        <Divider />
        <Box>
          <Typography variant='h2'>Active Proposals</Typography>
          {userStoryTreasury ? (
            <Box>
              {allProposals &&
                allProposals.map((proposal: IProposal, index: number) => {
                  return (
                    <Box key={index}>
                      <Typography variant='h5'>
                        {proposal.proposalId}
                      </Typography>
                      <Typography variant='h6'>
                        {proposal.description}
                      </Typography>
                    </Box>
                  );
                })}
            </Box>
          ) : (
            <em>{`<Smart Contract for Proposals not yet deployed>`}</em>
          )}
        </Box>
      </Stack>
      <UserStoryTable userStoryTreasury={userStoryTreasury} />
      <ProposalCreationModal
        daoGovernor={daoGovernor}
        userStoryTreasury={userStoryTreasury}
        userStoryTreasuryInterface={userStoryTreasuryInterface}
      />
    </React.Fragment>
  );
};

export default UserStory;
