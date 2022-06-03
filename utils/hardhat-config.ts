type UserStory = [description: string, functionalComplexity: number, effortEstimation: number];

export interface networkConfigItem {
    ethUsdPriceFeed?: string
    blockConfirmations?: number
}

export interface networkConfigInfo {
    [key: string]: networkConfigItem
}

export const networkConfig: networkConfigInfo = {
    localhost: {},
    hardhat: {},
    rinkeby: {
        blockConfirmations: 3,
    },
    mumbai: {
        blockConfirmations: 2,
    }
}

export const developmentChains = ["hardhat", "localhost"];
export const proposalsFile = "proposals.json";

/* Governor Contract Values */

/* A Proposal needs 42% of Voters to vote for it to pass */
/* Percentage of total Supply of Token Holders (People) / Tokens needed to approve Proposals (42%) */
export const QUORUM_PERCENTAGE = 42;
/* The Vote has to last over 5 Blocks */
export const VOTING_PERIOD = 5;
/* The passed Vote has to wait one Block before it can be executed */
export const VOTING_DELAY = 1;
/* Minimum Number of Votes an Account must have to create a proposal */
export const THRESHOLD = 0;

/* Time Lock Controller */
/* A Vote has to pass 60 Seconds before it can be enacted */
export const MIN_DELAY = 60;

/* Store new User Story */
export const NEW_USER_STORY: UserStory = ["First User Story", 21, 42];
export const FUNCTION_TO_CALL = "storeUserStory";
export const PROPOSAL_DESCRIPTION = "Proposal #1 Store new User Story";
