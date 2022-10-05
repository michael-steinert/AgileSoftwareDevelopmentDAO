import * as fs from 'fs';
import { deployments, ethers, network } from 'hardhat';
import {
  developmentChains,
  FUNCTION_TO_CALL,
  NEW_USER_STORY,
  proposalsFile,
  PROPOSAL_DESCRIPTION,
  VOTING_DELAY,
} from '../utils/hardhat-config';
import { moveBlocks } from '../utils/move-blocks';

type UserStory = [
  description: string,
  functionalComplexity: number,
  effortEstimation: number
];

const proposeProposal = async (
  userStory: UserStory,
  functionToCall: string,
  proposalDescription: string
) => {
  const DaoGovernor = await deployments.get('DaoGovernor');
  const daoGovernor = await ethers.getContractAt(
    'DaoGovernor',
    DaoGovernor.address
  );
  const UserStoryTreasury = await deployments.get('UserStoryTreasury');
  const userStoryTreasury = await ethers.getContractAt(
    'UserStoryTreasury',
    UserStoryTreasury.address
  );
  /*
  `encodeFunctionData` returns the encoded Data, which can be used as the Data for a Transaction for Fragment for the given Values
  The Data containing the encoded Function Selector and Parameters of the Call
  Encoding Function to call with its Parameter
  */
  const encodedFunctionCall = userStoryTreasury.interface.encodeFunctionData(
    functionToCall,
    userStory
  );
  console.log(
    `Proposing ${functionToCall} on ${userStoryTreasury.address} with ${userStory}`
  );
  console.log(`Proposal Description:\n  ${proposalDescription}`);
  /*
  Creating a new Proposal, with a Proposal ID that is obtained by Hashing together the Proposal Data
  Proposal ID will be also found in an Event in the Logs of the Transaction
  */
  const proposeTransaction = await daoGovernor.propose(
    // Targets that are called from the DAO
    [userStoryTreasury.address],
    // Ether sending to Target Contract
    [0],
    // Encoded Parameters for the Functions that are going to be called
    [encodedFunctionCall],
    // Description of Proposal
    proposalDescription
  );
  // If working on Development Network, then Blocks will be pushed forward until the Voting Period is over
  if (developmentChains.includes(network.name)) {
    await moveBlocks(VOTING_DELAY + 1);
  }
  const proposeTransactionResult = await proposeTransaction.wait();
  // Getting `proposalId` from Event `ProposalCreated`
  const proposalId = proposeTransactionResult.events[0].args.proposalId;
  console.log(`Proposed with Proposal ID:\n  ${proposalId}`);
  const proposalState = await daoGovernor.state(proposalId);
  // Getting current Snapshot of Proposal
  const proposalSnapShot = await daoGovernor.proposalSnapshot(proposalId);
  // Getting Deadline for Proposal
  const proposalDeadline = await daoGovernor.proposalDeadline(proposalId);
  // Getting all Proposals from `proposals.json`
  let proposals = JSON.parse(fs.readFileSync(proposalsFile, 'utf8'));
  // Saving new Proposal
  proposals[network.config.chainId!.toString()].push(proposalId.toString());
  // Writing new Proposal into `proposals.json`
  storeProposalId(proposalId);
  // State of Proposal - 0 is pending, 1 is active and 4 is succeeded Proposal
  console.log(`Current Proposal State: ${proposalState}`);
  // Block Number that the current Proposal was snapshot
  console.log(`Current Proposal Snapshot: ${proposalSnapShot}`);
  // Block Number that the Proposal Voting will expire
  console.log(`Current Proposal Deadline: ${proposalDeadline}`);
};

const storeProposalId = (proposalId: any) => {
  const chainId = network.config.chainId!.toString();
  let proposals: any;
  if (fs.existsSync(proposalsFile)) {
    proposals = JSON.parse(fs.readFileSync(proposalsFile, 'utf8'));
  } else {
    proposals = {};
    proposals[chainId] = [];
  }
  proposals[chainId].push(proposalId.toString());
  fs.writeFileSync(proposalsFile, JSON.stringify(proposals), 'utf8');
};

proposeProposal(NEW_USER_STORY, FUNCTION_TO_CALL, PROPOSAL_DESCRIPTION)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

export default proposeProposal;
