import {HardhatRuntimeEnvironment} from "hardhat/types";
import {DeployFunction} from "hardhat-deploy/types";
import verify from "../utils/verify";
import {networkConfig, developmentChains} from "../utils/hardhat-config";
import {ethers} from "hardhat";

const deployUserStoryTreasury: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const {getNamedAccounts, deployments, network} = hre;
    const {deploy, log} = deployments;
    const {deployer} = await getNamedAccounts();
    log("----------------------------------------------------");
    log("Deploying User Story Treasury and waiting for Confirmations");
    /* Deployment Object `UserStory` that can not invoke Function from Contract `Box` */
    const userStory = await deploy("UserStoryTreasury", {
        from: deployer,
        args: [],
        log: true,
        /* Waiting some Block Confirmation, so on a Testnet or Mainnet it can be verified properly */
        waitConfirmations: networkConfig[network.name].blockConfirmations || 1
    })
    log(`UserStory at ${userStory.address}`);
    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        await verify(userStory.address, []);
    }
    /* Contract Object `userStory` that can invoke Function from Contract `UserStoryTreasury` */
    const userStoryTreasury = await ethers.getContractAt("UserStoryTreasury", userStory.address);
    const TimeLockController = await deployments.get("TimeLock");
    const timeLockController = await ethers.getContractAt("TimeLock", TimeLockController.address);
    /* Giving Ownership of Contract `UserStoryContract` from `deployer` to Contract `TimeLockController` */
    const transferTransaction = await userStoryTreasury.transferOwnership(timeLockController.address);
    await transferTransaction.wait();
}

export default deployUserStoryTreasury;
deployUserStoryTreasury.tags = ["all", "deploy-user-story-treasury"];
