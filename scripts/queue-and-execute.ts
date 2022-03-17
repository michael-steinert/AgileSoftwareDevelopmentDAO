import {ethers, network} from "hardhat";
import {
    FUNCTION_TO_CALL,
    NEW_STORE_VALUE,
    PROPOSAL_DESCRIPTION,
    MIN_DELAY,
    developmentChains
} from "../utils/hardhat-config";
import {moveBlocks} from "../utils/move-blocks";
import {moveTime} from "../utils/move-time";

const queueAndExecute = async () => {
    const args = [NEW_STORE_VALUE];
    const functionToCall = FUNCTION_TO_CALL;
    const userStoryContract = await ethers.getContract("UserStoryContract");
    const encodedFunctionCall = userStoryContract.interface.encodeFunctionData(functionToCall, args);
    /* Alternative: ethers.utils.id(PROPOSAL_DESCRIPTION) */
    /* `PROPOSAL_DESCRIPTION` has to be hashed to match because on-chain all Data are hashed */
    const descriptionHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(PROPOSAL_DESCRIPTION));
    const governorContract = await ethers.getContract("GovernorContract");
    console.log("Queueing in Process");
    /* Exact the same Parameter as in the `propose()` because this Data is not stored on-chain, as a Measure to save Gas */
    const queueTransaction = await governorContract.queue(
        [userStoryContract.address],
        [0],
        [encodedFunctionCall],
        descriptionHash
    );
    await queueTransaction.wait(1);
    /* `MIN_DELAY` gives the Users some Time to check the Proposal before it is executed */
    /* If working on a Development Network, the Time and Blocks will be pushed forward till got to the Voting Period */
    if (developmentChains.includes(network.name)) {
        /* Moving Time by `MIN_DELAY + 1` to be sure that the Voting Period is expired */
        await moveTime(MIN_DELAY + 1);
        await moveBlocks(1);
    }
    console.log("Executing in Process");
    /* Exact the same Parameter as in the `propose()` because this Data is not stored on-chain, as a Measure to save Gas */
    /* `execute()` will fail on Testnet or Mainnet because the `MIN_DELAY` for the Voting Period must expire */
    const executeTransaction = await governorContract.execute(
        /* Exact the same Parameter as in the `propose()` */
        [userStoryContract.address],
        [0],
        [encodedFunctionCall],
        descriptionHash
    );
    await executeTransaction.wait(1);
    console.log("Executed");
    /* Retrieving new Value that has been proposed and executed in Contract `UserStory` */
    const newValue = await userStoryContract.retrieve();
    console.log(`New UserStory Value is ${newValue.toString()}`);
}

queueAndExecute()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

export default queueAndExecute;
