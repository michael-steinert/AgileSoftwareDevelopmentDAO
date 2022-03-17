import {HardhatRuntimeEnvironment} from "hardhat/types";
import {DeployFunction} from "hardhat-deploy/types";
import verify from "../utils/verify";
import {networkConfig, developmentChains, MIN_DELAY} from "../utils/hardhat-config";

const deployTimeLock: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const {getNamedAccounts, deployments, network} = hre;
    const {deploy, log} = deployments;
    const {deployer} = await getNamedAccounts();
    log("----------------------------------------------------");
    log("Deploying TimeLock and waiting for Confirmations");
    const governanceTimeLock = await deploy("GovernanceTimeLock", {
        from: deployer,
        /* args: minDelay, proposers, executors */
        args: [MIN_DELAY, [], []],
        log: true,
        /* Waiting some Block Confirmation, so on a Testnet or Mainnet it can be verified properly */
        waitConfirmations: networkConfig[network.name].blockConfirmations || 1
    });
    log(`TimeLock at ${governanceTimeLock.address}`);
    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        await verify(governanceTimeLock.address, []);
    }
}

export default deployTimeLock;
deployTimeLock.tags = ["all", "timelock"];
