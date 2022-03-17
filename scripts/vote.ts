import {network, ethers} from "hardhat";
import * as fs from "fs";
import {proposalsFile, developmentChains, VOTING_PERIOD} from "../utils/hardhat-config";
import {moveBlocks} from "../utils/move-blocks";

/* Index of first Proposal in `proposals.json` */
const index = 0;

const vote = async (proposalIndex: number) => {
    const proposals = JSON.parse(fs.readFileSync(proposalsFile, "utf8"));
    /* Getting first Proposal of List of Proposals in `proposals.json` */
    const proposalId = proposals[network.config.chainId!][proposalIndex];
    /* Vote Types := 0 = Against, 1 = For, and 2 = Abstain for Proposal */
    const voteType = 1;
    const reasonForVote = "Change Number to 42";
    console.log("Voting in Process");
    const governorContract = await ethers.getContract("GovernorContract");
    /* Creating Proposal with Reason */
    const voteTransaction = await governorContract.castVoteWithReason(proposalId, voteType, reasonForVote);
    const voteTransactionResult = await voteTransaction.wait(1);
    console.log(voteTransactionResult.events[0].args.reason);
    const proposalState = await governorContract.state(proposalId);
    console.log(`Current Proposal State is ${proposalState}`);
    /* If working on a Development Network, the Blocks will be pushed forward till got to the Voting Period */
    if (developmentChains.includes(network.name)) {
        await moveBlocks(VOTING_PERIOD + 1);
    }
    console.log("Voted");
}

vote(index)
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

export default vote;
