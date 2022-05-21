import {HardhatRuntimeEnvironment} from "hardhat/types";
import {DeployFunction} from "hardhat-deploy/types";
import verify from "../utils/verify";
import {networkConfig, developmentChains, MIN_DELAY} from "../utils/hardhat-config";

const deployTimeLockController: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const {getNamedAccounts, deployments, network} = hre;
    const {deploy, log} = deployments;
    const {deployer} = await getNamedAccounts();
    log("----------------------------------------------------");
    log("Deploying Time Lock Controller and waiting for Confirmations");
    const timeLockController = await deploy("TimeLock", {
        from: deployer,
        /* args: minDelay, proposers, executors */
        args: [
            MIN_DELAY,
            [],
            []
        ],
        log: true,
        /* Waiting some Block Confirmation, so on a Testnet or Mainnet it can be verified properly */
        waitConfirmations: networkConfig[network.name].blockConfirmations || 1
    });
    log(`Time Lock Controller at ${timeLockController.address}`);
    /*
    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        await verify(timeLockController.address, [
            MIN_DELAY,
            [],
            []
        ]);
    }
    */
}

export default deployTimeLockController;
deployTimeLockController.tags = ["all", "deploy-time-lock-controller"];
