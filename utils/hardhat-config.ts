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
  goerli: {
    blockConfirmations: 3,
  },
  mumbai: {
    blockConfirmations: 2,
  },
};

export const developmentChains = ['hardhat', 'localhost'];
export const proposalsFile = 'proposals.json';

/*
Governor
Quorum required for a Proposal to pass - A Proposal needs 80% of Voters to vote for it to pass
Quorum is the Percentage of total Supply of Token Holders needed to vote on a Proposal
80% of the Token Holders have to vote for a Proposal to be
*/
export const QUORUM_PERCENTAGE: number = 80;
/*
Length of Period during which Token Holders can cast their Vote
The Vote has to last over 5 Blocks
*/
export const VOTING_PERIOD: number = 5;
// Delay since Proposal is created until Voting starts
export const VOTING_DELAY: number = 3;
// Minimum Number of Votes an Account must have to create a Proposal
export const THRESHOLD: number = 0;

/*
Time Lock Controller
The passed Vote has to wait a Delay before it can be executed
A Vote has to pass 300 Seconds (5 Minutes) before it can be enacted
*/
export const MIN_DELAY: number = 300;
export const PROPOSERS: string[] = [];
export const EXECUTORS: string[] = [];

// User Story Treasury
export const NEW_USER_STORY: UserStory = ['First User Story', 21, 42];
export const FUNCTION_TO_CALL: any = 'storeUserStory';
export const PROPOSAL_DESCRIPTION: string = 'Proposal #1 Store new User Story';
