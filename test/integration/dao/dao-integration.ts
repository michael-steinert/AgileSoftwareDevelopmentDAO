import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { assert, expect } from 'chai';
import { ContractFactory } from 'ethers';
import { ethers } from 'hardhat';
import {
  FUNCTION_TO_CALL,
  MIN_DELAY,
  NEW_USER_STORY,
  PROPOSAL_DESCRIPTION,
  QUORUM_PERCENTAGE,
  THRESHOLD,
  VOTING_DELAY,
  VOTING_PERIOD,
} from '../../../utils/hardhat-config';
import { moveBlocks } from '../../../utils/move-blocks';
import { moveTime } from '../../../utils/move-time';

const daoIntegration = async (): Promise<void> => {
  context('DAO Integration Test', async () => {
    let owner: SignerWithAddress;
    let otherUser: SignerWithAddress;
    let deployedDaoGovernor: any;
    let deployedGovernanceToken: any;
    let deployedTimeLock: any;
    let userStoryTreasuryContractFactory: ContractFactory;
    let deployedUserStoryTreasury: any;

    beforeEach(async () => {
      const [addr0, addr1] = await ethers.getSigners();
      owner = addr0;
      otherUser = addr1;
      const governanceToken = await ethers.getContractFactory(
        'GovernanceToken'
      );
      deployedGovernanceToken = await governanceToken.deploy(
        'SCRUM Token',
        'SCRUM',
        (42 * 10 ** 18).toString()
      );
      await deployedGovernanceToken.deployed();

      // Delegating Governance Token to User
      let transactionResponse = await deployedGovernanceToken.delegate(
        owner.address
      );
      await transactionResponse.wait(1);

      const timeLock = await ethers.getContractFactory('TimeLock');
      deployedTimeLock = await timeLock.deploy(MIN_DELAY, [], []);
      await deployedTimeLock.deployed();

      const daoGovernor = await ethers.getContractFactory('DaoGovernor');
      deployedDaoGovernor = await daoGovernor.deploy(
        deployedGovernanceToken.address,
        deployedTimeLock.address,
        // Delay, in Number of Blocks, between the Proposal is created and the Vote starts
        VOTING_DELAY,
        // Delay, in Number of Blocks, between the Vote start and Vote ends
        VOTING_PERIOD,
        THRESHOLD,
        // Minimum Number of Votes voted required for a Proposal to be successful
        QUORUM_PERCENTAGE
      );
      await deployedDaoGovernor.deployed();

      userStoryTreasuryContractFactory = await ethers.getContractFactory(
        'UserStoryTreasury'
      );
      deployedUserStoryTreasury =
        await userStoryTreasuryContractFactory.deploy();
      await deployedUserStoryTreasury.deployed();

      // Transfer Ownership to TimeLock Contract so that it can execute the Operation
      const transferTx = await deployedUserStoryTreasury.transferOwnership(
        deployedTimeLock.address
      );
      await transferTx.wait(1);

      // Granting Roles to the relevant Parties
      const proposerRole = await deployedTimeLock.PROPOSER_ROLE();
      const executorRole = await deployedTimeLock.EXECUTOR_ROLE();
      const adminRole = await deployedTimeLock.TIMELOCK_ADMIN_ROLE();
      const proposerTx = await deployedTimeLock.grantRole(
        proposerRole,
        deployedDaoGovernor.address
      );
      await proposerTx.wait(1);

      const executorTx = await deployedTimeLock.grantRole(
        executorRole,
        ethers.constants.AddressZero
      );
      await executorTx.wait(1);
      const revokeTx = await deployedTimeLock.revokeRole(
        adminRole,
        owner.address
      );
      await revokeTx.wait(1);
    });

    it('should store User Story only through Governance', async () => {
      await expect(
        deployedUserStoryTreasury.storeUserStory('New User Story', 42, 21)
      ).to.be.revertedWith('Ownable: caller is not the owner');
    });

    it('Testing Creation, Voting and Execution of Proposal by single User', async () => {
      // Creating Proposal
      console.log('Creating Proposal');
      // Encoding Function to call with its Parameters
      const encodedFunctionCall =
        userStoryTreasuryContractFactory.interface.encodeFunctionData(
          FUNCTION_TO_CALL,
          NEW_USER_STORY
        );
      const proposeTransaction = await deployedDaoGovernor.propose(
        [deployedUserStoryTreasury.address],
        [0],
        [encodedFunctionCall],
        PROPOSAL_DESCRIPTION
      );
      await moveBlocks(VOTING_DELAY + 1);
      const proposeTransactionReceipt = await proposeTransaction.wait(1);
      const proposalId = proposeTransactionReceipt.events![0].args!.proposalId;
      console.log(`Proposed with Proposal ID: ${proposalId}`);

      // State of Proposal - 0 is pending, 1 is active and 4 is succeeded Proposal
      let proposalState = await deployedDaoGovernor.state(proposalId);
      console.log(`Current Proposal State is ${proposalState}`);

      /*
      `proposalSnapShot` is the Block Number used to retrieve User’s Votes and Quorum
      The Snapshot is performed at the End of this Block, hence, Voting for this Proposal starts at the Beginning of the following Block
      */
      const proposalSnapShot = await deployedDaoGovernor.proposalSnapshot(
        proposalId
      );
      console.log(`Current Proposal Snapshot is ${proposalSnapShot}`);

      /*
      `proposalDeadline` is the Block Number at which Votes close
      Votes close at the End of this Block, so it is possible to cast a Vote during this Block
      */
      const proposalDeadline = await deployedDaoGovernor.proposalDeadline(
        proposalId
      );
      console.log(`Current Proposal Deadline is ${proposalDeadline}`);

      // Voting for Proposal
      console.log('Voting for Proposal');
      // Type of Vote - 0 is against, 1 is for, and 2 is abstain the Proposal
      const voteType = 1;
      const reason = 'User Story fits in Sprint';

      // Cast a Vote with a Reason
      const voteTransaction = await deployedDaoGovernor.castVoteWithReason(
        proposalId,
        voteType,
        reason
      );
      const voteTransactionReceipt = await voteTransaction.wait(1);
      // Check that `owner` has voted
      assert.equal(
        await deployedDaoGovernor.hasVoted(proposalId, owner.address),
        true
      );
      console.log(voteTransactionReceipt.events![0].args!.reason);

      proposalState = await deployedDaoGovernor.state(proposalId);
      // Proposal State 1 it is active
      assert.equal(proposalState.toString(), '1');
      console.log(`Current Proposal State: ${proposalState}`);

      // Moving Blocks to simulate Completion of Voting Period
      await moveBlocks(VOTING_PERIOD + 1);

      // Queue Proposal
      console.log('Queueing Proposal');

      // `PROPOSAL_DESCRIPTION` has to be hashed to match because on-chain all Data are hashed
      const descriptionHash = ethers.utils.id(PROPOSAL_DESCRIPTION);
      proposalState = await deployedDaoGovernor.state(proposalId);
      console.log(`Current Proposal State is ${proposalState}`);

      const latestBlock = (await ethers.provider.getBlockNumber()) - 1;
      // `votes` are the Voting Power of an Account at a specific Block Number
      const votes = await deployedDaoGovernor.getVotes(
        owner.address,
        latestBlock
      );
      console.log(`Voting Power of an Account is ${votes.toString()}`);
      console.log(
        `Checkpoints: ${await deployedGovernanceToken.numCheckpoints(
          owner.address
        )}`
      );

      const quorum = await deployedDaoGovernor.quorum(latestBlock);
      console.log(
        `Quorum (Minimum Number of Votes required for a Proposal to be successful) is ${quorum.toString()}`
      );

      proposalState = await deployedDaoGovernor.state(proposalId);
      console.log(`Current Proposal State is ${proposalState}`);
      const queueTransaction = await deployedDaoGovernor.queue(
        [deployedUserStoryTreasury.address],
        [0],
        [encodedFunctionCall],
        descriptionHash
      );
      await queueTransaction.wait(1);
      await moveTime(MIN_DELAY + 1);
      await moveBlocks(1);

      // Execute Proposal
      console.log('Executing Proposal');
      const executeTransaction = await deployedDaoGovernor.execute(
        [deployedUserStoryTreasury.address],
        [0],
        [encodedFunctionCall],
        descriptionHash
      );
      await executeTransaction.wait(1);
      const newUserStory =
        await deployedUserStoryTreasury.retrieveAllUserStories();
      console.log(`New User Story is ${newUserStory.toString()}`);
    });

    it('Create another User, issue Governance Token, both Users voting to match over 80% Quorum and Execution', async () => {
      // Adding another User to DAO
      const signer = await ethers.getSigner(otherUser.address);
      const deployedGovernanceOtherUser = await deployedGovernanceToken.connect(
        signer
      );
      // Issuing Tokens to another User
      await deployedGovernanceOtherUser.issueToken(otherUser.address, 200);
      const transactionResponse = await deployedGovernanceToken.delegate(
        otherUser.address
      );
      await transactionResponse.wait(1);

      // Creating Proposal
      console.log('Creating Proposal');
      // Encoding Function to call with its Parameters
      const encodedFunctionCall =
        userStoryTreasuryContractFactory.interface.encodeFunctionData(
          FUNCTION_TO_CALL,
          NEW_USER_STORY
        );
      const proposeTransaction = await deployedDaoGovernor.propose(
        [deployedUserStoryTreasury.address],
        [0],
        [encodedFunctionCall],
        PROPOSAL_DESCRIPTION
      );
      await moveBlocks(VOTING_DELAY + 1);
      const proposeTransactionReceipt = await proposeTransaction.wait(1);
      const proposalId = proposeTransactionReceipt.events![0].args!.proposalId;
      console.log(`Proposed with Proposal ID: ${proposalId}`);

      // State of Proposal - 0 is pending, 1 is active and 4 is succeeded Proposal
      let proposalState = await deployedDaoGovernor.state(proposalId);
      console.log(`Current Proposal State is ${proposalState}`);

      // Which Block Number the Proposal was snapshot
      const proposalSnapShot = await deployedDaoGovernor.proposalSnapshot(
        proposalId
      );
      console.log(`Current Proposal Snapshot is ${proposalSnapShot}`);

      // Block Number when the Proposal Voting expires
      const proposalDeadline = await deployedDaoGovernor.proposalDeadline(
        proposalId
      );
      console.log(`Current Proposal Deadline is ${proposalDeadline}`);

      // Voting for Proposal */
      console.log('Voting for Proposal');
      // Type of Vote - 0 is against, 1 is for, and 2 is abstain the Proposal
      const voteType = 1;
      const reason = 'User Story fits in Sprint';

      // First User is casting a Vote with Reason
      let voteTransaction = await deployedDaoGovernor.castVoteWithReason(
        proposalId,
        voteType,
        reason
      );
      let voteTransactionReceipt = await voteTransaction.wait(1);
      // Check that `owner` has voted
      assert.equal(
        await deployedDaoGovernor.hasVoted(proposalId, owner.address),
        true
      );
      console.log(voteTransactionReceipt.events![0].args!.reason);

      proposalState = await deployedDaoGovernor.state(proposalId);
      // Proposal State 1 it is active
      assert.equal(proposalState.toString(), '1');
      console.log(`Current Proposal State: ${proposalState}`);

      // Second User is voting
      const deployedDaoGovernorOtherUser = await deployedDaoGovernor.connect(
        signer
      );
      // Second User is casting a Vote with Reason
      voteTransaction = await deployedDaoGovernorOtherUser.castVoteWithReason(
        proposalId,
        voteType,
        reason
      );
      voteTransactionReceipt = await voteTransaction.wait(1);
      // Check that `otherUser` has voted
      assert.equal(
        await deployedDaoGovernor.hasVoted(proposalId, otherUser.address),
        true
      );
      console.log(voteTransactionReceipt.events[0].args.reason);

      proposalState = await deployedDaoGovernor.state(proposalId);
      console.log(`Current Proposal State: ${proposalState}`);

      /// Moving Blocks to simulate Completion of Voting Period
      await moveBlocks(VOTING_PERIOD + 1);

      // Queueing Proposal
      console.log('Queueing Proposal');
      // `PROPOSAL_DESCRIPTION` has to be hashed to match because on-chain all Data are hashed
      const descriptionHash = ethers.utils.id(PROPOSAL_DESCRIPTION);
      proposalState = await deployedDaoGovernor.state(proposalId);
      console.log(`Current Proposal State is ${proposalState}`);

      const latestBlock = (await ethers.provider.getBlockNumber()) - 1;
      const votes = await deployedDaoGovernor.getVotes(
        owner.address,
        latestBlock
      );
      console.log(`Voting Power of an Account is ${votes.toString()}`);
      console.log(
        `Checkpoints: ${await deployedGovernanceToken.numCheckpoints(
          owner.address
        )}`
      );

      const quorum = await deployedDaoGovernor.quorum(latestBlock);
      console.log(
        `Quorum (Minimum Number of Votes required for a Proposal to be successful) is ${quorum.toString()}`
      );

      proposalState = await deployedDaoGovernor.state(proposalId);
      console.log(`Current Proposal State is ${proposalState}`);
      const queueTransaction = await deployedDaoGovernor.queue(
        [deployedUserStoryTreasury.address],
        [0],
        [encodedFunctionCall],
        descriptionHash
      );
      await queueTransaction.wait(1);
      await moveTime(MIN_DELAY + 1);
      await moveBlocks(1);

      // Execute Proposal
      console.log('Executing Proposal');
      const executeTransaction = await deployedDaoGovernor.execute(
        [deployedUserStoryTreasury.address],
        [0],
        [encodedFunctionCall],
        descriptionHash
      );
      await executeTransaction.wait(1);
      const newUserStory =
        await deployedUserStoryTreasury.retrieveAllUserStories();
      console.log(`New User Story is ${newUserStory.toString()}`);
    });
  });
};

export default daoIntegration;
