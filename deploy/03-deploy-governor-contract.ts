import {HardhatRuntimeEnvironment} from "hardhat/types";
import {DeployFunction} from "hardhat-deploy/types";
import verify from "../utils/verify";
import {
    networkConfig,
    developmentChains,
    QUORUM_PERCENTAGE,
    VOTING_PERIOD,
    VOTING_DELAY,
} from "../utils/hardhat-config";

const deployGovernorContract: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const {getNamedAccounts, deployments, network} = hre;
    const {deploy, log, get} = deployments;
    const {deployer} = await getNamedAccounts();
    /* Getting existing Instance of Contract `GovernanceToken` */
    const governanceToken = await get("GovernanceToken");
    /* Getting existing Instance of Contract `TimeLock` */
    const governanceTimeLock = await get("GovernanceTimeLock");
    log("----------------------------------------------------");
    log("Deploying GovernorContract and waiting for Confirmations");
    const governorContract = await deploy("GovernorContract", {
        from: deployer,
        args: [
            governanceToken.address,
            governanceTimeLock.address,
            QUORUM_PERCENTAGE,
            VOTING_PERIOD,
            VOTING_DELAY,
        ],
        log: true,
        /* Waiting some Block Confirmation, so on a Testnet or Mainnet it can be verified properly */
        waitConfirmations: networkConfig[network.name].blockConfirmations || 1
    });
    log(`GovernorContract at ${governorContract.address}`);
    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        await verify(governorContract.address, []);
    }
}

export default deployGovernorContract;
deployGovernorContract.tags = ["all", "governor"];
