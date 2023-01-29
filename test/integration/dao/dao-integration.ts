import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { assert, expect } from 'chai';
import {
  BigNumber,
  ContractFactory,
  ContractReceipt,
  ContractTransaction,
} from 'ethers';
import { ethers } from 'hardhat';
import {
  DaoGovernor,
  GovernanceToken,
  IUserStoryTreasury,
  TimeLock,
  UserStoryTreasury,
} from '../../../typechain-types';
import {
  FUNCTION_TO_CALL,
  MIN_DELAY,
  NEW_USER_STORY,
  PROPOSAL_DESCRIPTION,
  QUORUM_PERCENTAGE,
  THRESHOLD,
  TOKEN_INITIAL_SUPPLY,
  TOKEN_NAME,
  TOKEN_SYMBOL,
  VOTING_DELAY,
  VOTING_PERIOD,
} from '../../../utils/dao-config';
import { moveBlocks } from '../../../utils/move-blocks';
import { moveTime } from '../../../utils/move-time';

const daoIntegration = async (): Promise<void> => {
  context('DAO Integration Test', async () => {
    let deployer: SignerWithAddress;
    let otherUser: SignerWithAddress;
    let deployedDaoGovernor: DaoGovernor;
    let deployedGovernanceToken: GovernanceToken;
    let deployedTimeLock: TimeLock;
    let userStoryTreasuryContractFactory: ContractFactory;
    let deployedUserStoryTreasury: UserStoryTreasury;

    beforeEach(async () => {
      const [addr0, addr1]: SignerWithAddress[] = await ethers.getSigners();
      deployer = addr0;
      otherUser = addr1;
      const governanceToken = await ethers.getContractFactory(
        'GovernanceToken'
      );
      deployedGovernanceToken = (await governanceToken.deploy(
        TOKEN_NAME,
        TOKEN_SYMBOL,
        TOKEN_INITIAL_SUPPLY
      )) as GovernanceToken;
      await deployedGovernanceToken.deployed();

      // Setting the Owner as Delegate of the Governance Token - this allows him to vote
      const delegationTransaction: ContractTransaction =
        await deployedGovernanceToken.delegate(deployer.address);
      await delegationTransaction.wait();

      const timeLock: ContractFactory = await ethers.getContractFactory(
        'TimeLock'
      );
      deployedTimeLock = (await timeLock.deploy(
        MIN_DELAY,
        [],
        [],
        deployer.address
      )) as TimeLock;
      await deployedTimeLock.deployed();

      const daoGovernor = await ethers.getContractFactory('DaoGovernor');
      deployedDaoGovernor = (await daoGovernor.deploy(
        deployedGovernanceToken.address,
        deployedTimeLock.address,
        // Delay, in Number of Blocks, between the Proposal is created and the Vote starts
        VOTING_DELAY,
        // Delay, in Number of Blocks, between the Vote start and Vote ends
        VOTING_PERIOD,
        THRESHOLD,
        // Minimum Number of Votes voted required for a Proposal to be successful
        QUORUM_PERCENTAGE
      )) as DaoGovernor;
      await deployedDaoGovernor.deployed();

      userStoryTreasuryContractFactory = await ethers.getContractFactory(
        'UserStoryTreasury'
      );
      deployedUserStoryTreasury =
        (await userStoryTreasuryContractFactory.deploy()) as UserStoryTreasury;
      await deployedUserStoryTreasury.deployed();

      // Transfer Ownership to TimeLock Contract so that it can execute the Operation
      const transferTransaction: ContractTransaction =
        await deployedUserStoryTreasury.transferOwnership(
          deployedTimeLock.address
        );
      await transferTransaction.wait();

      // Granting Roles to the relevant Parties
      const proposerRole: string = await deployedTimeLock.PROPOSER_ROLE();
      const executorRole: string = await deployedTimeLock.EXECUTOR_ROLE();
      const adminRole: string = await deployedTimeLock.TIMELOCK_ADMIN_ROLE();
      const proposerTransaction: ContractTransaction =
        await deployedTimeLock.grantRole(
          proposerRole,
          deployedDaoGovernor.address
        );
      await proposerTransaction.wait();

      const executorTransaction: ContractTransaction =
        await deployedTimeLock.grantRole(
          executorRole,
          ethers.constants.AddressZero
        );
      await executorTransaction.wait();

      const revokeTransaction: ContractTransaction =
        await deployedTimeLock.revokeRole(adminRole, deployer.address);
      await revokeTransaction.wait();
    });

    it('should store User Story only through Governance', async () => {
      await expect(
        deployedUserStoryTreasury.storeUserStory('New User Story', 42, 21)
      ).to.be.revertedWith('Ownable: caller is not the owner');
    });

    /* 
    Test Scenario
    1. Add an initial Member - the Founder of DAO
    2. The Founder creates a Proposal - he proposes a Function to be executed on a Target Smart Contract
    3. The Founder votes on the created Proposal, it will pass since Founder has 100% of the Vote Share
    4. Execute the Proposal - and thus the Function inside the Target Smart Contract
    */
    it('Testing Creation, Voting and Execution of Proposal by single User', async () => {
      // Creating Proposal
      console.log('Creating Proposal');
      // Encoding Function to call with its Parameters
      const encodedFunctionCall: string =
        userStoryTreasuryContractFactory.interface.encodeFunctionData(
          FUNCTION_TO_CALL,
          NEW_USER_STORY
        );
      const proposeTransaction: ContractTransaction =
        await deployedDaoGovernor.propose(
          [deployedUserStoryTreasury.address],
          [0],
          [encodedFunctionCall],
          PROPOSAL_DESCRIPTION
        );
      await moveBlocks(VOTING_DELAY + 1);
      const proposeTransactionReceipt: ContractReceipt =
        await proposeTransaction.wait();
      const proposalId: BigNumber =
        proposeTransactionReceipt.events![0].args!.proposalId;
      console.log(`Proposed with Proposal ID: ${proposalId}`);

      // State of Proposal - 0 is pending, 1 is active and 4 is succeeded Proposal
      let proposalState: number = await deployedDaoGovernor.state(proposalId);
      console.log(`Current Proposal State is ${proposalState}`);

      /*
      `proposalSnapShot` is the Block Number used to retrieve User’s Votes and Quorum
      The Snapshot is performed at the End of this Block, hence, Voting for this Proposal starts at the Beginning of the following Block
      */
      const proposalSnapShot: BigNumber =
        await deployedDaoGovernor.proposalSnapshot(proposalId);
      console.log(`Current Proposal Snapshot is ${proposalSnapShot}`);

      /*
      `proposalDeadline` is the Block Number at which Votes close
      Votes close at the End of this Block, so it is possible to cast a Vote during this Block
      */
      const proposalDeadline: BigNumber =
        await deployedDaoGovernor.proposalDeadline(proposalId);
      console.log(`Current Proposal Deadline is ${proposalDeadline}`);

      // Voting for Proposal
      console.log('Voting for Proposal');
      // Type of Vote - 0 is against, 1 is for, and 2 is abstain the Proposal
      const voteType: number = 1;
      const reason: string = 'User Story fits in Sprint';

      // Cast a Vote with a Reason
      const voteTransaction: ContractTransaction =
        await deployedDaoGovernor.castVoteWithReason(
          proposalId,
          voteType,
          reason
        );
      const voteTransactionReceipt: ContractReceipt =
        await voteTransaction.wait();
      // Check that `owner` has voted
      assert.equal(
        await deployedDaoGovernor.hasVoted(proposalId, deployer.address),
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
      const descriptionHash: string = ethers.utils.id(PROPOSAL_DESCRIPTION);
      proposalState = await deployedDaoGovernor.state(proposalId);
      console.log(`Current Proposal State is ${proposalState}`);

      const latestBlock: number = (await ethers.provider.getBlockNumber()) - 1;
      // `votes` are the Voting Power of an Account at a specific Block Number
      const votes = await deployedDaoGovernor.getVotes(
        deployer.address,
        latestBlock
      );
      console.log(`Voting Power of an Account is ${votes.toString()}`);
      console.log(
        `Checkpoints: ${await deployedGovernanceToken.numCheckpoints(
          deployer.address
        )}`
      );

      const quorum: BigNumber = await deployedDaoGovernor.quorum(latestBlock);
      console.log(
        `Quorum (Minimum Number of Votes required for a Proposal to be successful) is ${quorum.toString()}`
      );

      proposalState = await deployedDaoGovernor.state(proposalId);
      console.log(`Current Proposal State is ${proposalState}`);
      const queueTransaction: ContractTransaction =
        await deployedDaoGovernor.queue(
          [deployedUserStoryTreasury.address],
          [0],
          [encodedFunctionCall],
          descriptionHash
        );
      await queueTransaction.wait();
      await moveTime(MIN_DELAY + 1);
      await moveBlocks(1);

      // Execute Proposal
      console.log('Executing Proposal');
      const executeTransaction: ContractTransaction =
        await deployedDaoGovernor.execute(
          [deployedUserStoryTreasury.address],
          [0],
          [encodedFunctionCall],
          descriptionHash
        );
      await executeTransaction.wait();
      const newUserStory: IUserStoryTreasury.UserStoryStructOutput[] =
        await deployedUserStoryTreasury.retrieveAllUserStories();
      console.log(`New User Story is ${newUserStory.toString()}`);
    });

    /* 
    Test Scenario
    1. Add an initial Member - the Founder of DAO
    2. Add another Member and issue him Governance Tokens worth 24% (10 of 42 Governance Tokens) of the Founder’s Share
    3. The Founder creates a Proposal - he proposes a Function to be executed on a Target Smart Contract
    4. The Founder and other Member votes on the created Proposal, it will pass since the Quorum is reached of 80%
    5. Execute the Proposal - and thus the Function inside the Target Smart Contract
    */
    it('Create another User, issue Governance Token, both Users voting to match over 80% Quorum and Execution', async () => {
      // Adding another User to DAO
      const otherSigner: SignerWithAddress = await ethers.getSigner(
        otherUser.address
      );
      const deployedGovernanceTokenOtherUser: GovernanceToken =
        await deployedGovernanceToken.connect(otherSigner);
      // Issuing 10 of possible 42 Governance Tokens to another User - the Initial Supply is 42 Governance Tokens
      await deployedGovernanceTokenOtherUser.issueToken(otherUser.address, 10);
      /*
      Setting the other User as Delegate of the Governance Token
      The Other User can not vote until he is add as a Delegate of the Governance Token
      The Delegation allows Members who have Governance Tokens and do not want to participate in Decision Making do not to do it
      By Avoiding the Delegation the Members do not need to spend extra Gas on Maintaining the Snapshots of their Voting Power on Ledger
      */
      const delegationTransaction: ContractTransaction =
        await deployedGovernanceToken.delegate(otherUser.address);
      await delegationTransaction.wait();

      // Creating Proposal
      console.log('Creating Proposal');
      // Encoding Function to call with its Parameters
      const encodedFunctionCall: string =
        userStoryTreasuryContractFactory.interface.encodeFunctionData(
          FUNCTION_TO_CALL,
          NEW_USER_STORY
        );
      const proposeTransaction: ContractTransaction =
        await deployedDaoGovernor.propose(
          [deployedUserStoryTreasury.address],
          [0],
          [encodedFunctionCall],
          PROPOSAL_DESCRIPTION
        );
      await moveBlocks(VOTING_DELAY + 1);
      const proposeTransactionReceipt: ContractReceipt =
        await proposeTransaction.wait();
      const proposalId: BigNumber =
        proposeTransactionReceipt.events![0].args!.proposalId;
      console.log(`Proposed with Proposal ID: ${proposalId}`);

      // State of Proposal - 0 is pending, 1 is active and 4 is succeeded Proposal
      let proposalState: number = await deployedDaoGovernor.state(proposalId);
      console.log(`Current Proposal State is ${proposalState}`);

      // Which Block Number the Proposal was snapshot
      const proposalSnapShot: BigNumber =
        await deployedDaoGovernor.proposalSnapshot(proposalId);
      console.log(`Current Proposal Snapshot is ${proposalSnapShot}`);

      // Block Number when the Proposal Voting expires
      const proposalDeadline: BigNumber =
        await deployedDaoGovernor.proposalDeadline(proposalId);
      console.log(`Current Proposal Deadline is ${proposalDeadline}`);

      // Voting for Proposal */
      console.log('Voting for Proposal');
      // Type of Vote - 0 is against, 1 is for, and 2 is abstain the Proposal
      const voteType: number = 1;
      const reason: string = 'User Story fits in Sprint';

      // First User is casting a Vote with Reason
      let voteTransaction: ContractTransaction =
        await deployedDaoGovernor.castVoteWithReason(
          proposalId,
          voteType,
          reason
        );
      let voteTransactionReceipt: ContractReceipt =
        await voteTransaction.wait();
      // Check that `owner` has voted
      assert.equal(
        await deployedDaoGovernor.hasVoted(proposalId, deployer.address),
        true
      );
      console.log(
        `User #1 voted for Proposal with Description: ${
          voteTransactionReceipt.events![0].args!.reason
        }`
      );

      proposalState = await deployedDaoGovernor.state(proposalId);
      // Proposal State 1 it is active
      assert.equal(proposalState.toString(), '1');
      console.log(`Current Proposal State: ${proposalState}`);

      // Second User is voting
      const deployedDaoGovernorOtherUser: DaoGovernor =
        await deployedDaoGovernor.connect(otherSigner);
      // Second User is casting a Vote with Reason
      voteTransaction = await deployedDaoGovernorOtherUser.castVoteWithReason(
        proposalId,
        voteType,
        reason
      );
      voteTransactionReceipt = await voteTransaction.wait();
      // Check that `otherUser` has voted
      assert.equal(
        await deployedDaoGovernor.hasVoted(proposalId, otherUser.address),
        true
      );
      console.log(
        `User #2 voted for Proposal with Description: ${
          voteTransactionReceipt.events![0].args!.reason
        }`
      );

      proposalState = await deployedDaoGovernor.state(proposalId);
      console.log(`Current Proposal State: ${proposalState}`);

      /// Moving Blocks to simulate Completion of Voting Period
      await moveBlocks(VOTING_PERIOD + 1);

      // Queueing Proposal
      console.log('Queueing Proposal');
      // `PROPOSAL_DESCRIPTION` has to be hashed to match because on-chain all Data are hashed
      const descriptionHash: string = ethers.utils.id(PROPOSAL_DESCRIPTION);
      proposalState = await deployedDaoGovernor.state(proposalId);
      console.log(`Current Proposal State is ${proposalState}`);

      const latestBlock: number = (await ethers.provider.getBlockNumber()) - 1;
      const votes: BigNumber = await deployedDaoGovernor.getVotes(
        deployer.address,
        latestBlock
      );
      console.log(`Voting Power of an Account is ${votes.toString()}`);
      console.log(
        `Checkpoints: ${await deployedGovernanceToken.numCheckpoints(
          deployer.address
        )}`
      );

      const quorum: BigNumber = await deployedDaoGovernor.quorum(latestBlock);
      console.log(
        `Quorum (Minimum Number of Votes required for a Proposal to be successful) is ${quorum.toString()}`
      );

      proposalState = await deployedDaoGovernor.state(proposalId);
      console.log(`Current Proposal State is ${proposalState}`);
      const queueTransaction: ContractTransaction =
        await deployedDaoGovernor.queue(
          [deployedUserStoryTreasury.address],
          [0],
          [encodedFunctionCall],
          descriptionHash
        );
      await queueTransaction.wait();
      await moveTime(MIN_DELAY + 1);
      await moveBlocks(1);

      // Execute Proposal
      console.log('Executing Proposal');
      const executeTransaction: ContractTransaction =
        await deployedDaoGovernor.execute(
          [deployedUserStoryTreasury.address],
          [0],
          [encodedFunctionCall],
          descriptionHash
        );
      await executeTransaction.wait();
      const newUserStory: IUserStoryTreasury.UserStoryStructOutput[] =
        await deployedUserStoryTreasury.retrieveAllUserStories();
      console.log(`New User Story is ${newUserStory.toString()}`);
    });
  });
};

export default daoIntegration;
