import { assert, expect } from "chai";
import { deployments, ethers } from "hardhat";
import {
  DaoGovernor,
  GovernanceToken,
  TimeLock,
  UserStoryTreasury,
} from "../../../typechain-types";
import {
  FUNCTION_TO_CALL,
  MIN_DELAY,
  NEW_USER_STORY,
  PROPOSAL_DESCRIPTION,
  VOTING_DELAY,
  VOTING_PERIOD,
} from "../../../utils/hardhat-config";
import { moveBlocks } from "../../../utils/move-blocks";
import { moveTime } from "../../../utils/move-time";

const daoIntegration = async (): Promise<void> => {
  context("DAO Integration Test", async () => {
    let daoGovernor: DaoGovernor;
    let governanceToken: GovernanceToken;
    let timeLock: TimeLock;
    let userStoryTreasury: UserStoryTreasury;
    /* Vote Type 1 corresponds to vote for a Proposal */
    const voteType = 1;
    const reason = "User Story fit in the Project";

    beforeEach(async () => {
      await deployments.fixture(["all"]);
      const DaoGovernor = await deployments.get("DaoGovernor");
      daoGovernor = (await ethers.getContractAt(
        "DaoGovernor",
        DaoGovernor.address
      )) as DaoGovernor;
      const TimeLock = await deployments.get("TimeLock");
      timeLock = (await ethers.getContractAt(
        "TimeLock",
        TimeLock.address
      )) as TimeLock;
      const GovernanceToken = await deployments.get("GovernanceToken");
      governanceToken = (await ethers.getContractAt(
        "GovernanceToken",
        GovernanceToken.address
      )) as GovernanceToken;
      const UserStoryTreasury = await deployments.get("UserStoryTreasury");
      userStoryTreasury = (await ethers.getContractAt(
        "UserStoryTreasury",
        UserStoryTreasury.address
      )) as UserStoryTreasury;
      // TODO: Fix UserStoryTreasuryCoordinator
    });

    it("should store User Story only through Governance", async () => {
      await expect(
        userStoryTreasury.storeUserStory("New User Story", 42, 21)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it.skip("should create, vote, wait, queue, and then execute the Proposal", async () => {
      /* Creating Proposal */
      /* Encoding Function to call with its Parameters */
      const encodedFunctionCall =
        userStoryTreasury.interface.encodeFunctionData(
          FUNCTION_TO_CALL,
          NEW_USER_STORY
        );
      const proposeTx = await daoGovernor.propose(
        [userStoryTreasury.address],
        [0],
        [encodedFunctionCall],
        PROPOSAL_DESCRIPTION
      );
      const proposeReceipt = await proposeTx.wait(1);
      const proposalId = proposeReceipt.events![0].args!.proposalId;
      let proposalState = await daoGovernor.state(proposalId);
      console.log(`Current Proposal State is ${proposalState}`);
      await moveBlocks(VOTING_DELAY + 1);
      /* Vote for Proposal */
      const voteTransaction = await daoGovernor.castVoteWithReason(
        proposalId,
        voteType,
        reason
      );
      await voteTransaction.wait(1);
      proposalState = await daoGovernor.state(proposalId);
      assert.equal(proposalState.toString(), "1");
      console.log(`Current Proposal State: ${proposalState}`);
      await moveBlocks(VOTING_PERIOD + 1);
      /* Queue Proposal */
      /* Alternative: ethers.utils.keccak256(ethers.utils.toUtf8Bytes(PROPOSAL_DESCRIPTION)) */
      const descriptionHash = ethers.utils.id(PROPOSAL_DESCRIPTION);
      const queueTransaction = await daoGovernor.queue(
        [userStoryTreasury.address],
        [0],
        [encodedFunctionCall],
        descriptionHash
      );
      await queueTransaction.wait(1);
      await moveTime(MIN_DELAY + 1);
      await moveBlocks(1);
      proposalState = await daoGovernor.state(proposalId);
      console.log(`Current Proposal State is ${proposalState}`);
      /* Execute Proposal */
      console.log("Executing in Process");
      const executeTransaction = await daoGovernor.execute(
        [userStoryTreasury.address],
        [0],
        [encodedFunctionCall],
        descriptionHash
      );
      await executeTransaction.wait(1);
      const newUserStory = await userStoryTreasury.retrieveAllUserStories();
      console.log(`New User Story is ${newUserStory.toString()}`);
    });
  });
};

export default daoIntegration;
