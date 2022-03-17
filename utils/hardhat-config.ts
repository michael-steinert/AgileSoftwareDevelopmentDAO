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
        blockConfirmations: 6,
    },
}

export const developmentChains = ["hardhat", "localhost"];
export const proposalsFile = "proposals.json";

/* Governor Contract Values */
/* A Vote needs 4% of Voters to voted for it to pass */
export const QUORUM_PERCENTAGE = 4;
/* A Vote has to pass 1 Hour before it can be enacted */
export const MIN_DELAY = 3600;
/* The Vote has to last over 5 Blocks */
export const VOTING_PERIOD = 5;
/* The Vote becomes active after 1 Block */
export const VOTING_DELAY = 1;

export const NEW_STORE_VALUE = 42;
export const FUNCTION_TO_CALL = "store";
export const PROPOSAL_DESCRIPTION = "Proposal #1 42 in the Box!";
