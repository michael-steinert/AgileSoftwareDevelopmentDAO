import React, {
  ChangeEvent,
  FunctionComponent,
  ReactElement,
  useEffect,
  useState,
} from 'react';
import {
  Box,
  Button,
  InputLabel,
  TextField,
  Divider,
  Typography,
} from '@mui/material';
import { styled } from '@mui/system';
import { useEthers } from '@usedapp/core';
import { Contract, providers } from 'ethers';
import { useUserStoryTreasury, useDaoGovernor } from '../hooks';

const StyledUserStoryBox = styled(Box)({
  display: 'grid',
  gridGap: '10px',
  placeSelf: 'center',
  alignItems: 'center',
}) as typeof Box;

const StyledLabel = styled(InputLabel)({
  fontWeight: 'bold',
}) as typeof InputLabel;

const StyledInput = styled(TextField)({
  padding: '0.4rem 0.6rem',
}) as typeof TextField;

const StyledCreateButton = styled(Button)({
  width: '150px',
  color: 'white',
  backgroundColor: '#1976d2',
  borderColor: 'blue',
  cursor: 'pointer',
}) as typeof Button;

const UserStory: FunctionComponent = (): ReactElement => {
  const { account, active } = useEthers();
  const [allUserStories, setAllUserStories] = useState<IUserStory[]>([]);
  const [allProposals, setAllProposals] = useState<IProposal[]>([]);
  const [error, setError] = useState<Error>();
  const [description, setDescription] = useState('');
  const [functionalComplexity, setFunctionalComplexity] = useState('0');
  const [effortEstimation, setEffortEstimation] = useState('0');
  const [allProposalIds, setAllProposalIds] = useState<number[]>([]);

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
    const onUserStoryCreated =
      () =>
      (
        creator: string,
        userStoryNumber: number,
        description: string,
        functionalComplexity: number,
        effortEstimation: number,
        timestamp: any,
        isDone: boolean
      ) => {
        // Set new User Story from Event
        setAllUserStories((previousUserStories: IUserStory[]) => {
          return [
            ...previousUserStories,
            {
              creator: creator,
              userStoryNumber: userStoryNumber,
              description: description,
              functionalComplexity: functionalComplexity,
              effortEstimation: effortEstimation,
              timestamp: new Date(timestamp * 1000),
              isDone: isDone,
            },
          ];
        });
      };

    // Subscribe to Event Calling Listener when the Event `UserStoryCreated` occurs
    userStoryTreasury?.on('UserStoryCreated', onUserStoryCreated);

    // Listen on emitted Event to update the Data in Real-Time
    const onProposalCreated =
      () =>
      (
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
      };

    // Subscribe to Event Calling Listener when the Event `ProposalCreated` occurs
    daoGovernor?.on('ProposalCreated', onProposalCreated);

    // Retrieving all existing User Stories, then store them into State
    const retrieveAllUserStories = async (
      userStoryTreasury: Contract
    ): Promise<void> => {
      // Fetching all User Stories
      const userStories = await userStoryTreasury.retrieveAllUserStory();
      console.log(userStories);

      // Change all User Stories, if they changed
      if (allUserStories !== userStories) {
        setAllUserStories(userStories);
      }
    };
    // retrieveAllUserStories(userStoryTreasury!).catch(console.error);
  }, [daoGovernor, userStoryTreasury]);

  const storeUserStory = async () => {
    try {
      // `encodeFunctionData` returns the encoded Data, which can be used as the Data for a Transaction for Fragment for the given Values
      // Encoding Function to call with their Parameters
      const encodedFunctionCall =
        userStoryTreasuryInterface?.encodeFunctionData('storeUserStory', [
          description,
          functionalComplexity,
          effortEstimation,
        ]);

      // Creating a new Proposal, with a Proposal ID that is obtained by Hashing together the Proposal Data, and which will also be found in an event in the Logs of the Transaction
      const proposeTransaction = await daoGovernor?.propose(
        // Targets that are called from the DAO
        [userStoryTreasury?.address],
        // Ether sending to Targets
        [0],
        // Encoded Parameters for the Functions that are going to be called
        [encodedFunctionCall],
        // Description of Proposal
        'Proposal for creating new User Story'
      );

      const proposeTransactionResult = await proposeTransaction.wait();

      // Getting `proposalId` from Event `ProposalCreated`
      const proposalId = proposeTransactionResult.events[0].args.proposalId;
      console.log(`Proposed with Proposal ID:\n  ${proposalId}`);

      // State of Proposal - 0 is pending, 1 is active and 4 is succeeded Proposal
      const proposalState = await daoGovernor?.state(proposalId);
      console.log(`Current Proposal State: ${proposalState}`);

      // Block Number that the current Proposal was snapshot
      const proposalSnapShot = await daoGovernor?.proposalSnapshot(proposalId);
      console.log(`Current Proposal Snapshot: ${proposalSnapShot}`);

      // Block Number that the Proposal Voting will expire
      const proposalDeadline = await daoGovernor?.proposalDeadline(proposalId);
      console.log(`Current Proposal Deadline: ${proposalDeadline}`);

      // Set User Story from Event
      setAllProposalIds((previousProposalIds: number[]) => {
        return [...previousProposalIds, proposalId];
      });
      console.log(`Sate with Proposal ID:\n  ${allProposalIds}`);
    } catch (error: any) {
      setError(error);
      console.error(error.message);
    }
  };

  // Show Error Message if User is not on Development Network
  if (error && error.name === 'UnsupportedChainIdError') {
    return (
      <Box>
        <Typography variant='h2'>
          Please connect to a Development Network
        </Typography>
        <Typography variant='subtitle2'>
          This decentralized Application only works on the Development Goerli
        </Typography>
      </Box>
    );
  }

  const handleDescriptionChange = (
    event: ChangeEvent<HTMLInputElement>
  ): void => {
    event.preventDefault();
    setDescription(event.target.value);
  };

  const handleFunctionalComplexityChange = (
    event: ChangeEvent<HTMLInputElement>
  ): void => {
    event.preventDefault();
    setFunctionalComplexity(event.target.value);
  };

  const handleEffortEstimationChange = (
    event: ChangeEvent<HTMLInputElement>
  ): void => {
    event.preventDefault();
    setEffortEstimation(event.target.value);
  };

  return (
    <React.Fragment>
      <StyledUserStoryBox>
        <h1>Scrum DAO</h1>
        <StyledLabel>User Story Treasury Address</StyledLabel>
        <Box>
          {userStoryTreasury ? (
            typeof account === 'undefined' ? (
              ''
            ) : account ? (
              `${account.substring(0, 6)}...${account.substring(
                account.length - 4
              )}`
            ) : (
              ''
            )
          ) : (
            <em>{`<Smart Contract not yet deployed>`}</em>
          )}
        </Box>
        <StyledLabel>Current User Stories</StyledLabel>
        <Box>
          {userStoryTreasury ? (
            <div>
              <h2>Active User Stories</h2>
              {allUserStories &&
                allUserStories.map((userStory: IUserStory, index: number) => {
                  return (
                    <div key={index}>
                      <h5>{userStory.userStoryNumber}</h5>
                      <h6>{userStory.description}</h6>
                    </div>
                  );
                })}
            </div>
          ) : (
            <em>{`<Smart Contract not for User Stories yet deployed>`}</em>
          )}
        </Box>
        <Divider />
        <Box>
          {userStoryTreasury ? (
            <div>
              <h2>Active Proposals</h2>
              {allProposals &&
                allProposals.map((proposal: IProposal, index: number) => {
                  return (
                    <div key={index}>
                      <h5>{proposal.proposalId}</h5>
                      <h6>{proposal.description}</h6>
                    </div>
                  );
                })}
            </div>
          ) : (
            <em>{`<Smart Contract for Proposals not yet deployed>`}</em>
          )}
        </Box>
        <Divider />
        <h2>Create new User Story</h2>
        <StyledLabel htmlFor={'descriptionInput'}>Description</StyledLabel>
        <StyledInput
          id={'descriptionInput'}
          type={'text'}
          placeholder={
            userStoryTreasury ? '' : '<Smart Contract not yet deployed>'
          }
          onChange={handleDescriptionChange}
          style={{ fontStyle: userStoryTreasury ? 'normal' : 'italic' }}
        />
        <StyledLabel htmlFor={'functionalComplexityInput'}>
          Functional Complexity
        </StyledLabel>
        <StyledInput
          id={'functionalComplexityInput'}
          type={'text'}
          placeholder={
            userStoryTreasury ? '' : '<Smart Contract not yet deployed>'
          }
          onChange={handleFunctionalComplexityChange}
          style={{ fontStyle: userStoryTreasury ? 'normal' : 'italic' }}
        />
        <StyledLabel htmlFor={'effortEstimationInput'}>
          Effort Estimation
        </StyledLabel>
        <StyledInput
          id={'effortEstimationInput'}
          type={'text'}
          placeholder={
            userStoryTreasury ? '' : '<Smart Contract not yet deployed>'
          }
          onChange={handleEffortEstimationChange}
          style={{ fontStyle: userStoryTreasury ? 'normal' : 'italic' }}
        />
        <StyledCreateButton
          disabled={!active || !userStoryTreasury}
          sx={{
            cursor: !active || !userStoryTreasury ? 'not-allowed' : 'pointer',
            borderColor: !active || !userStoryTreasury ? 'unset' : 'blue',
          }}
          onClick={storeUserStory}
        >
          Create
        </StyledCreateButton>
      </StyledUserStoryBox>
    </React.Fragment>
  );
};

export default UserStory;
