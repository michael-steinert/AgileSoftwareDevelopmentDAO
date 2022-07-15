type UserStory = [
  description: string,
  functionalComplexity: number,
  effortEstimation: number
];

export interface networkConfigItem {
  blockConfirmations?: number;
}

export interface networkConfigInfo {
  [key: string]: networkConfigItem;
}

export const networkConfig: networkConfigInfo = {
  localhost: {},
  hardhat: {},
  rinkeby: {
    blockConfirmations: 3,
  },
  mumbai: {
    blockConfirmations: 2,
  },
};

export const developmentChains = ["hardhat", "localhost"];
export const proposalsFile = "proposals.json";

/* Governor */
/* Quorum required for a Proposal to pass - A Proposal needs 4% of Voters to vote for it to pass */
/* Percentage of total Supply of Token Holders (People) / Tokens needed to approve Proposals (4%) */
export const QUORUM_PERCENTAGE: number = 4;
/* Length of Period during which People can cast their Vote */
/* The Vote has to last over 42 Blocks */
/* Block Time on Ethereum Rinkeby: 15 Seconds */
/* Block Time on Polygon Mumbai: 3 Seconds */
export const VOTING_PERIOD: number = 42;
/* Delay since Proposal is created until Voting starts */
export const VOTING_DELAY: number = 1;
/* Minimum Number of Votes an Account must have to create a Proposal */
export const THRESHOLD: number = 0;

/* Time Lock Controller */
/* The passed Vote has to wait some Time before it can be executed */
/* A Vote has to pass 60 Seconds before it can be enacted */
export const MIN_DELAY: number = 60;
export const PROPOSERS: string[] = [];
export const EXECUTORS: string[] = [];

/* User Story Treasury */
export const NEW_USER_STORY: UserStory = ["First User Story", 21, 42];
export const FUNCTION_TO_CALL: any = "storeUserStory";
export const PROPOSAL_DESCRIPTION: string = "Proposal #1 Store new User Story";
