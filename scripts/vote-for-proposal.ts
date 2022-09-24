import * as fs from 'fs';
import { deployments, ethers, network } from 'hardhat';
import {
  developmentChains,
  proposalsFile,
  VOTING_PERIOD,
} from '../utils/hardhat-config';
import { moveBlocks } from '../utils/move-blocks';

const voteForProposal = async () => {
  const proposals = JSON.parse(fs.readFileSync(proposalsFile, 'utf8'));
  // Getting last Proposal for the Network of Proposals in `proposals.json`
  const proposalId = proposals[network.config.chainId!].at(-1);
  // Type of Vote - 0 is against, 1 is for, and 2 is abstain the Proposal
  const voteType = 1;
  const reasonForVote = 'Voting for User Story';
  console.log('Voting in Process');
  const DaoGovernor = await deployments.get('DaoGovernor');
  const daoGovernor = await ethers.getContractAt(
    'DaoGovernor',
    DaoGovernor.address
  );
  // Cast a Vote with a Reason
  const voteTransaction = await daoGovernor.castVoteWithReason(
    proposalId,
    voteType,
    reasonForVote
  );
  const voteTransactionResult = await voteTransaction.wait(1);
  console.log(voteTransactionResult.events[0].args.reason);
  const proposalState = await daoGovernor.state(proposalId);
  console.log(`Current Proposal State is ${proposalState}`);
  // If on a Development Network, then Blocks will be pushed forward until the Voting Period is over
  if (developmentChains.includes(network.name)) {
    await moveBlocks(VOTING_PERIOD + 1);
  }
  console.log('Voted for Proposal');
};

voteForProposal()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

export default voteForProposal;
