import {
  Backdrop,
  Box,
  Button,
  Fade,
  Modal,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Contract, utils } from 'ethers';
import React, {
  ChangeEvent,
  FunctionComponent,
  ReactElement,
  useState,
} from 'react';

type ProposalCreationModalProps = {
  daoGovernor: Contract;
  userStoryTreasury: Contract;
  userStoryTreasuryInterface: utils.Interface;
};

type UserStoryInputs = {
  description: string;
  functionalComplexity: number;
  effortEstimation: number;
};

const ProposalCreationModal: FunctionComponent<ProposalCreationModalProps> = ({
  daoGovernor,
  userStoryTreasury,
  userStoryTreasuryInterface,
}: ProposalCreationModalProps): ReactElement => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<Error>();
  const [createdProposalIds, setCreatedProposalIds] = useState<number[]>([]);
  const [userStoryInputs, setUserStoryInputs] = useState<UserStoryInputs>({
    description: '',
    functionalComplexity: 0,
    effortEstimation: 0,
  });

  const handleOpenModal = () => setIsModalOpen(true);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setUserStoryInputs({
      description: '',
      functionalComplexity: 0,
      effortEstimation: 0,
    });
  };

  const storeUserStory = async () => {
    try {
      // `encodeFunctionData` returns the encoded Data, which can be used as the Data for a Transaction for Fragment for the given Values
      // Encoding Function to call with their Parameters
      const encodedFunctionCall =
        userStoryTreasuryInterface?.encodeFunctionData('storeUserStory', [
          userStoryInputs.description,
          userStoryInputs.functionalComplexity,
          userStoryInputs.effortEstimation,
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
      console.log(`Proposed with Proposal ID:\n ${proposalId}`);

      // State of Proposal - 0 is pending, 1 is active and 4 is succeeded Proposal
      const proposalState = await daoGovernor?.state(proposalId);
      console.log(`Current Proposal State: ${proposalState}`);

      // Block Number that the current Proposal was snapshot
      const proposalSnapShot = await daoGovernor?.proposalSnapshot(proposalId);
      console.log(`Current Proposal Snapshot: ${proposalSnapShot}`);

      // Block Number that the Proposal Voting will expire
      const proposalDeadline = await daoGovernor?.proposalDeadline(proposalId);
      console.log(`Current Proposal Deadline: ${proposalDeadline}`);

      // Store created Proposal ID
      setCreatedProposalIds([...createdProposalIds, proposalId]);
      console.log(`All created Proposals IDs:\n ${createdProposalIds}`);
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

  return (
    <Box>
      {userStoryTreasury ? (
        <React.Fragment>
          <Button
            variant='contained'
            color='secondary'
            onClick={handleOpenModal}
          >
            Create Proposal
          </Button>
          <Modal
            open={isModalOpen}
            onClose={handleCloseModal}
            closeAfterTransition
            BackdropComponent={Backdrop}
            BackdropProps={{
              timeout: 500,
            }}
          >
            <Fade in={isModalOpen}>
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  padding: 2,
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  bgcolor: 'background.paper',
                  border: '1px solid #000',
                }}
              >
                <Stack spacing={1} sx={{ width: 500 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
                    <TextField
                      id='description'
                      label='Description'
                      sx={{ width: 500 }}
                      variant='standard'
                      value={userStoryInputs.description}
                      onChange={(event: ChangeEvent<HTMLInputElement>) => {
                        setUserStoryInputs({
                          ...userStoryInputs,
                          description: event.target.value,
                        });
                      }}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
                    <TextField
                      id='functionalComplexity'
                      label='functional Complexity'
                      sx={{ width: 500 }}
                      variant='standard'
                      value={userStoryInputs.functionalComplexity}
                      onChange={(event: ChangeEvent<HTMLInputElement>) => {
                        const functionalComplexity: number =
                          parseInt(event.target.value) || 0;
                        setUserStoryInputs({
                          ...userStoryInputs,
                          functionalComplexity: functionalComplexity,
                        });
                      }}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
                    <TextField
                      id='effortEstimation'
                      label='Effort Estimation'
                      sx={{ width: 500 }}
                      variant='standard'
                      value={userStoryInputs.effortEstimation}
                      onChange={(event: ChangeEvent<HTMLInputElement>) => {
                        const effortEstimation: number =
                          parseInt(event.target.value) || 0;
                        setUserStoryInputs({
                          ...userStoryInputs,
                          effortEstimation: effortEstimation,
                        });
                      }}
                    />
                  </Box>
                  <Stack direction='row' spacing={2} sx={{ margin: 5 }}>
                    <Button variant='outlined' onClick={storeUserStory}>
                      Propose
                    </Button>
                    <Button variant='outlined' onClick={handleCloseModal}>
                      Close
                    </Button>
                  </Stack>
                </Stack>
              </Box>
            </Fade>
          </Modal>
        </React.Fragment>
      ) : (
        <em>{`<Smart Contract not for User Stories yet deployed>`}</em>
      )}
    </Box>
  );
};

export default ProposalCreationModal;
