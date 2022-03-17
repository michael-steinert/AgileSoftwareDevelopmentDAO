import {GovernorContract, GovernanceToken, GovernanceTimeLock, Box} from "../typechain-types";
import {deployments, ethers} from "hardhat";
import {assert, expect} from "chai";
import {
    FUNCTION_TO_CALL,
    PROPOSAL_DESCRIPTION,
    NEW_STORE_VALUE,
    VOTING_DELAY,
    VOTING_PERIOD,
    MIN_DELAY
} from "../utils/hardhat-config";
import {moveBlocks} from "../utils/move-blocks";
import {moveTime} from "../utils/move-time";

describe("DAO Flow Test", async () => {
    let governorContract: GovernorContract;
    let governanceTokenContract: GovernanceToken;
    let governanceTimeLockContract: GovernanceTimeLock;
    let boxContract: Box;
    /* Vote Type 1 corresponds to vote for a Proposal */
    const voteType = 1;
    const reason = "Change Number to 42";

    beforeEach(async () => {
        await deployments.fixture(["all"]);
        governorContract = await ethers.getContract("GovernorContract");
        governanceTimeLockContract = await ethers.getContract("GovernanceTimeLock");
        governanceTokenContract = await ethers.getContract("GovernanceToken");
        boxContract = await ethers.getContract("Box");
    })

    it("should change Number only through Governance", async () => {
        await expect(boxContract.store(42)).to.be.revertedWith("Ownable: caller is not the owner");
    })

    it("should create, vote, wait, queue, and then execute the Proposal", async () => {
        /* Create Proposal */
        const encodedFunctionCall = boxContract.interface.encodeFunctionData(FUNCTION_TO_CALL, [NEW_STORE_VALUE]);
        const proposeTx = await governorContract.propose(
            [boxContract.address],
            [0],
            [encodedFunctionCall],
            PROPOSAL_DESCRIPTION
        );
        const proposeReceipt = await proposeTx.wait(1);
        const proposalId = proposeReceipt.events![0].args!.proposalId;
        let proposalState = await governorContract.state(proposalId);
        console.log(`Current Proposal State is ${proposalState}`);
        await moveBlocks(VOTING_DELAY + 1)
        /* Vote for Proposal */
        const voteTransaction = await governorContract.castVoteWithReason(proposalId, voteType, reason)
        await voteTransaction.wait(1);
        proposalState = await governorContract.state(proposalId);
        assert.equal(proposalState.toString(), "1");
        console.log(`Current Proposal State: ${proposalState}`);
        await moveBlocks(VOTING_PERIOD + 1);
        /* Queue Proposal */
        /* Alternative: ethers.utils.keccak256(ethers.utils.toUtf8Bytes(PROPOSAL_DESCRIPTION)) */
        const descriptionHash = ethers.utils.id(PROPOSAL_DESCRIPTION);
        const queueTransaction = await governorContract.queue([boxContract.address], [0], [encodedFunctionCall], descriptionHash);
        await queueTransaction.wait(1);
        await moveTime(MIN_DELAY + 1);
        await moveBlocks(1);
        proposalState = await governorContract.state(proposalId);
        console.log(`Current Proposal State is ${proposalState}`);
        /* Execute Proposal */
        console.log("Executing in Process");
        const executeTransaction = await governorContract.execute([boxContract.address], [0], [encodedFunctionCall], descriptionHash);
        await executeTransaction.wait(1);
        const newValue = await boxContract.retrieve();
        console.log(`New Box Value is ${newValue.toString()}`);
    });
});
