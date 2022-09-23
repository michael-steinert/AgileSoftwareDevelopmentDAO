import { BigNumber } from 'ethers';
import { deployments, ethers, network } from 'hardhat';
import { UserStoryTreasury } from '../typechain-types';
import {
  developmentChains,
  FUNCTION_TO_CALL,
  MIN_DELAY,
  NEW_USER_STORY,
  PROPOSAL_DESCRIPTION,
} from '../utils/hardhat-config';
import { moveBlocks } from '../utils/move-blocks';
import { moveTime } from '../utils/move-time';

interface UserStory {
  creator: string;
  userStoryNumber: BigNumber;
  description: string;
  functionalComplexity: BigNumber;
  effortEstimation: BigNumber;
  timestamp: BigNumber;
  isDone: boolean;
}

const queueAndExecuteProposal = async () => {
  const UserStoryTreasury = await deployments.get('UserStoryTreasury');
  const userStoryTreasury = (await ethers.getContractAt(
    'UserStoryTreasury',
    UserStoryTreasury.address
  )) as UserStoryTreasury;
  const encodedFunctionCall = userStoryTreasury.interface.encodeFunctionData(
    FUNCTION_TO_CALL,
    NEW_USER_STORY
  );
  // `PROPOSAL_DESCRIPTION` has to be hashed to match because on-chain all Data are hashed
  const descriptionHash = ethers.utils.id(PROPOSAL_DESCRIPTION);
  const DaoGovernor = await deployments.get('DaoGovernor');
  const daoGovernor = await ethers.getContractAt(
    'DaoGovernor',
    DaoGovernor.address
  );
  console.log('Queueing Proposal in Process');
  // Exact the same Parameter as in the `propose()` because this Data is not stored on-chain, as a Measure to save Gas
  const queueTransaction = await daoGovernor.queue(
    [userStoryTreasury.address],
    [0],
    [encodedFunctionCall],
    descriptionHash
  );
  await queueTransaction.wait(1);
  /*
  `MIN_DELAY` gives the Users some Time to check the Proposal before it is executed
  If working on a Development Network, the Time and Blocks will be pushed forward till got to the Voting Period
  */
  if (developmentChains.includes(network.name)) {
    // Moving Time by `MIN_DELAY + 1` to be sure that the Voting Period is expired
    await moveTime(MIN_DELAY + 1);
    await moveBlocks(1);
  }
  console.log('Executing Proposal in Process');
  /*
  Exact the same Parameter as in the `propose()` because this Data is not stored on-chain, as a Measure to save Gas
  `execute()` will fail on Testnet or Mainnet because the `MIN_DELAY` for the Voting Period must expire
  */
  const executeTransaction = await daoGovernor.execute(
    // Exact the same Parameter as in the `propose()`
    [userStoryTreasury.address],
    [0],
    [encodedFunctionCall],
    descriptionHash
  );
  await executeTransaction.wait(1);
  console.log('Proposal executed');
  // Retrieving new Value that has been proposed, voted for and executed
  const allUserStories = await userStoryTreasury.retrieveAllUserStories();
  allUserStories?.forEach((userStory: UserStory, index: number) =>
    console.log(`Retrieved User Story ${index} : ${userStory}`)
  );
};

queueAndExecuteProposal()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

export default queueAndExecuteProposal;
