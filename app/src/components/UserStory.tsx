import { Contract, ethers, Signer } from 'ethers';
import React, { ChangeEvent, ReactElement, useEffect, useState } from 'react';
import { useWeb3React } from '@web3-react/core';
import styled from 'styled-components';
// @ts-ignore
import GovernorContract from '../artifacts/contracts/GovernorContract.sol/GovernorContract.json';
// @ts-ignore
import UserStoryContract from '../artifacts/contracts/UserStoryContract.sol/UserStoryContract.json';
import { Provider } from '../utils/provider';
import { SectionDivider } from './SectionDivider';

type IUserStory = {
  creator: string;
  userStoryNumber: number;
  description: string;
  functionalComplexity: number;
  effortEstimation: number;
  timestamp: any;
  isDone: boolean;
};

const StyledDeployContractButton = styled.button`
  width: 180px;
  height: 2rem;
  border-radius: 1rem;
  border-color: blue;
  cursor: pointer;
  place-self: center;
`;

const StyledUserStoryDiv = styled.div`
  display: grid;
  /* grid-template-rows: 1fr 1fr 1fr; */
  /* grid-template-columns: 135px 2.7fr 1fr; */
  grid-gap: 10px;
  place-self: center;
  align-items: center;
`;

const StyledLabel = styled.label`
  font-weight: bold;
`;

const StyledInput = styled.input`
  padding: 0.4rem 0.6rem;
`;

const StyledButton = styled.button`
  width: 150px;
  height: 2rem;
  border-radius: 1rem;
  border-color: blue;
  cursor: pointer;
`;

const UserStory = (): ReactElement => {
  const { library, active, account } = useWeb3React<Provider>();
  const [signer, setSigner] = useState<Signer>();
  const [userStoryContract, setUserStoryContract] = useState<Contract>();
  const [currentAccount, setCurrentAccount] = useState('');
  const [allUserStories, setAllUserStories] = useState<IUserStory[]>([]);
  const [error, setError] = useState<Error>();
  const [description, setDescription] = useState('');
  const [functionalComplexity, setFunctionalComplexity] = useState('');
  const [effortEstimation, setEffortEstimation] = useState('');
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

  /* Listen on emitted Wave Events to update the Data in Real-Rime */
  useEffect((): void => {
    const { ethereum } = window as any;
    let _userStoryContract: ethers.Contract;
    /* Listening on Event and passing received Event into State */
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
        /* Set User Story from Event */
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

    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      _userStoryContract = new ethers.Contract(
        userStoryContractAddress,
        userStoryContractABI,
        signer
      );
      setUserStoryContract(_userStoryContract);
      /* Subscribe to Event Calling Listener when the Event `UserStoryCreated` occurs */
      _userStoryContract.on('UserStoryCreated', onUserStoryCreated);
      const retrieveAllUserStories = async (
        _userStoryContract: Contract
      ): Promise<void> => {
        /* Getting all User Stories */
        const userStories = await _userStoryContract.retrieveAllUserStory();
        console.log(userStories);
        /* Change all User Stories, if they changed */
        if (allUserStories !== userStories) {
          setAllUserStories(userStories);
        }
      };
      retrieveAllUserStories(_userStoryContract).catch(console.error);
    }
    /*
        return (
            () => {
                if (_userStoryContract) {
                    // Unsubscribe Event Calling Listener to Event `UserStoryCreated`
                    _userStoryContract.off("UserStoryCreated", onUserStoryCreated);
                }
            }
        );
        */
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

        /* `encodeFunctionData` returns the encoded Data, which can be used as the Data for a Transaction for Fragment for the given Values */
        /* Encoding Function to call with their Parameters */
        const encodedFunctionCall =
          userStoryContract.interface.encodeFunctionData('storeUserStory', [
            description,
            functionalComplexity,
            effortEstimation,
          ]);

        /* Creating a new Proposal, with a Proposal ID that is obtained by Hashing together the Proposal Data, and which will also be found in an event in the Logs of the Transaction */
        const proposeTransaction = await governorContract.propose(
          /* Targets that are called from the DAO */
          [userStoryContract.address],
          /* Ether sending to Targets */
          [0],
          /* Encoded Parameters for the Functions that are going to be called */
          [encodedFunctionCall],
          /* Description of Proposal */
          'Proposal for creating a new User Story'
        );

        const proposeTransactionResult = await proposeTransaction.wait();
        /* Getting `proposalId` from Event `ProposalCreated` */
        const proposalId = proposeTransactionResult.events[0].args.proposalId;
        console.log(`Proposed with Proposal ID:\n  ${proposalId}`);
        const proposalState = await governorContract.state(proposalId);
        /* Getting current Snapshot of Proposal */
        const proposalSnapShot = await governorContract.proposalSnapshot(
          proposalId
        );
        /* Getting Deadline for Proposal */
        const proposalDeadline = await governorContract.proposalDeadline(
          proposalId
        );
        /* Set User Story from Event */
        setAllProposalIDs((previousProposalIDs: number[]) => {
          return [...previousProposalIDs, proposalId];
        });
        console.log(`Sate with Proposal ID:\n  ${allProposalIDs}`);
        /* State of Proposal: 1 is not passed and 0 is passed */
        console.log(`Current Proposal State: ${proposalState}`);
        /* Block Number that the current Proposal was snapshot */
        console.log(`Current Proposal Snapshot: ${proposalSnapShot}`);
        /* Block Number that the Proposal Voting will expire */
        console.log(`Current Proposal Deadline: ${proposalDeadline}`);
      } else {
        console.log('Ethereum Object does not exist');
      }
    } catch (err: any) {
      setError(err);
      console.error(err.message);
    }
  };

  /* Pop a Error Message if User is not on Testnet Rinkeby */
  if (error && error.name === 'UnsupportedChainIdError') {
    return (
      <div>
        <h2>Please connect to Testnet Rinkeby</h2>
        <p>This decentralized Application only works on the Testnet Rinkeby</p>
      </div>
    );
  }

  function handleDescriptionChange(event: ChangeEvent<HTMLInputElement>): void {
    event.preventDefault();
    setDescription(event.target.value);
  }

  function handleFunctionalComplexityChange(
    event: ChangeEvent<HTMLInputElement>
  ): void {
    event.preventDefault();
    setFunctionalComplexity(event.target.value);
  }

  function handleEffortEstimationChange(
    event: ChangeEvent<HTMLInputElement>
  ): void {
    event.preventDefault();
    setEffortEstimation(event.target.value);
  }

  return (
    <React.Fragment>
      <StyledUserStoryDiv>
        <h1>Agile DAO</h1>
        <StyledLabel>Contract Address</StyledLabel>
        <div>
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
        </div>
        {/* Empty Placeholder `div` below to provide empty first Row, third Colum `div` for a 2x3 Grid */}
        <div />
        <StyledLabel>Current User Stories</StyledLabel>
        <div>
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
            <em>{`<Smart Contract not yet deployed>`}</em>
          )}
        </div>
        {/* Empty Placeholder `div` below to provide empty first Row, third Colum `div` for a 2x3 Grid */}
        <div />
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
        <StyledButton
          disabled={!active || !userStoryContract}
          style={{
            cursor: !active || !userStoryContract ? 'not-allowed' : 'pointer',
            borderColor: !active || !userStoryContract ? 'unset' : 'blue',
          }}
          onClick={storeUserStory}
        >
          Create
        </StyledButton>
      </StyledUserStoryDiv>
    </React.Fragment>
  );
};

export default UserStory;
