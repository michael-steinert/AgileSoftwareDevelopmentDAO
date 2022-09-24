import { styled } from '@mui/system';
import { useWeb3React } from '@web3-react/core';
import { Contract, ethers, Signer } from 'ethers';
import React, { ChangeEvent, ReactElement, useEffect, useState } from 'react';
// @ts-ignore
import GovernorContract from '../artifacts/contracts/GovernorContract.sol/GovernorContract.json';
import { Box, Button, TextField, InputLabel } from '@mui/material';
import { SectionDivider } from '.';
// @ts-ignore
import UserStoryContract from '../artifacts/contracts/UserStoryContract.sol/UserStoryContract.json';
import { Provider } from '../utils/provider';

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

const UserStory = (): ReactElement => {
  const { library, active, account } = useWeb3React<Provider>();

  const [signer, setSigner] = useState<Signer>();
  const [userStoryContract, setUserStoryContract] = useState<Contract>();
  const [allUserStories, setAllUserStories] = useState<IUserStory[]>([]);
  const [allProposals, setAllProposals] = useState<IProposal[]>([]);
  const [error, setError] = useState<Error>();
  const [description, setDescription] = useState('');
  const [functionalComplexity, setFunctionalComplexity] = useState(0);
  const [effortEstimation, setEffortEstimation] = useState(0);
  const [allProposalIDs, setAllProposalIDs] = useState<number[]>([]);

  const governanceContractAddress =
    '0x15F16B9c06a107eEED8192682Ca22fdac64E74e3';
  const userStoryContractAddress = '0xbD046a019aCf77B9F370C4F7C4C6354Af8936C1a';
  const governanceContractABI = GovernorContract.abi;
  const userStoryContractABI = UserStoryContract.abi;

  useEffect((): void => {
    if (!library) {
      setSigner(undefined);
      return;
    }
    setSigner(library.getSigner());
  }, [library]);

  useEffect((): void => {
    const { ethereum } = window as any;
    let _userStoryContract: ethers.Contract;
    let _governorContract: ethers.Contract;

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
    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();

      // Instantiate User Story Contract
      _userStoryContract = new ethers.Contract(
        userStoryContractAddress,
        userStoryContractABI,
        signer
      );
      setUserStoryContract(_userStoryContract);

      // Subscribe to Event Calling Listener when the Event `UserStoryCreated` occurs
      _userStoryContract.on('UserStoryCreated', onUserStoryCreated);

      // Retrieving all existing User Stories, then store them into State
      const retrieveAllUserStories = async (
        _userStoryContract: Contract
      ): Promise<void> => {
        // Fetching all User Stories
        const userStories = await _userStoryContract.retrieveAllUserStory();
        console.log(userStories);
        // Change all User Stories, if they changed
        if (allUserStories !== userStories) {
          setAllUserStories(userStories);
        }
      };
      retrieveAllUserStories(_userStoryContract).catch(console.error);

      // Instantiate Governor Contract
      _governorContract = new ethers.Contract(
        governanceContractAddress,
        governanceContractABI,
        signer
      );

      // Subscribe to Event Calling Listener when the Event `ProposalCreated` occurs
      _governorContract.on('ProposalCreated', onProposalCreated);
    }
  }, []);

  const storeUserStory = async () => {
    try {
      const { ethereum } = window as any;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const userStoryContract = new ethers.Contract(
          userStoryContractAddress,
          userStoryContractABI,
          signer
        );
        const governorContract = new ethers.Contract(
          governanceContractAddress,
          governanceContractABI,
          signer
        );

        // `encodeFunctionData` returns the encoded Data, which can be used as the Data for a Transaction for Fragment for the given Values
        // Encoding Function to call with their Parameters
        const encodedFunctionCall =
          userStoryContract.interface.encodeFunctionData('storeUserStory', [
            description,
            functionalComplexity,
            effortEstimation,
          ]);

        // Creating a new Proposal, with a Proposal ID that is obtained by Hashing together the Proposal Data, and which will also be found in an event in the Logs of the Transaction
        const proposeTransaction = await governorContract.propose(
          // Targets that are called from the DAO
          [userStoryContract.address],
          // Ether sending to Targets
          [0],
          // Encoded Parameters for the Functions that are going to be called
          [encodedFunctionCall],
          // Description of Proposal
          'Proposal for creating a new User Story'
        );

        const proposeTransactionResult = await proposeTransaction.wait();
        // Getting `proposalId` from Event `ProposalCreated`
        const proposalId = proposeTransactionResult.events[0].args.proposalId;
        console.log(`Proposed with Proposal ID:\n  ${proposalId}`);
        const proposalState = await governorContract.state(proposalId);
        // Getting current Snapshot of Proposal
        const proposalSnapShot = await governorContract.proposalSnapshot(
          proposalId
        );
        // Getting Deadline for Proposal
        const proposalDeadline = await governorContract.proposalDeadline(
          proposalId
        );
        // Set User Story from Event
        setAllProposalIDs((previousProposalIDs: number[]) => {
          return [...previousProposalIDs, proposalId];
        });
        console.log(`Sate with Proposal ID:\n  ${allProposalIDs}`);
        // State of Proposal - 0 is pending, 1 is active and 4 is succeeded Proposal
        console.log(`Current Proposal State: ${proposalState}`);
        // Block Number that the current Proposal was snapshot
        console.log(`Current Proposal Snapshot: ${proposalSnapShot}`);
        // Block Number that the Proposal Voting will expire
        console.log(`Current Proposal Deadline: ${proposalDeadline}`);
      } else {
        console.log('Ethereum Object does not exist');
      }
    } catch (err: any) {
      setError(err);
      console.error(err.message);
    }
  };

  // Pop a Error Message if User is not on Testnet Rinkeby
  if (error && error.name === 'UnsupportedChainIdError') {
    return (
      <div>
        <h2>Please connect to Testnet Rinkeby</h2>
        <p>This decentralized Application only works on the Testnet Rinkeby</p>
      </div>
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
    setFunctionalComplexity(event.target.valueAsNumber);
  };

  const handleEffortEstimationChange = (
    event: ChangeEvent<HTMLInputElement>
  ): void => {
    event.preventDefault();
    setEffortEstimation(event.target.valueAsNumber);
  };

  return (
    <React.Fragment>
      <StyledUserStoryBox>
        <h1>Scrum DAO</h1>
        <StyledLabel>User story Treasury Address</StyledLabel>
        <Box>
          {userStoryContract ? (
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
          {userStoryContract ? (
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
        <SectionDivider />
        <Box>
          {userStoryContract ? (
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
        <SectionDivider />
        <h2>Create new User Story</h2>
        <StyledLabel htmlFor={'descriptionInput'}>Description</StyledLabel>
        <StyledInput
          id={'descriptionInput'}
          type={'text'}
          placeholder={
            userStoryContract ? '' : '<Smart Contract not yet deployed>'
          }
          onChange={handleDescriptionChange}
          style={{ fontStyle: userStoryContract ? 'normal' : 'italic' }}
        />
        <StyledLabel htmlFor={'functionalComplexityInput'}>
          Functional Complexity
        </StyledLabel>
        <StyledInput
          id={'functionalComplexityInput'}
          type={'text'}
          placeholder={
            userStoryContract ? '' : '<Smart Contract not yet deployed>'
          }
          onChange={handleFunctionalComplexityChange}
          style={{ fontStyle: userStoryContract ? 'normal' : 'italic' }}
        />
        <StyledLabel htmlFor={'effortEstimationInput'}>
          Effort Estimation
        </StyledLabel>
        <StyledInput
          id={'effortEstimationInput'}
          type={'text'}
          placeholder={
            userStoryContract ? '' : '<Smart Contract not yet deployed>'
          }
          onChange={handleEffortEstimationChange}
          style={{ fontStyle: userStoryContract ? 'normal' : 'italic' }}
        />
        <StyledCreateButton
          disabled={!active || !userStoryContract}
          sx={{
            cursor: !active || !userStoryContract ? 'not-allowed' : 'pointer',
            borderColor: !active || !userStoryContract ? 'unset' : 'blue',
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
