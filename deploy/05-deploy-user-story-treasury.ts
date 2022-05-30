import {HardhatRuntimeEnvironment} from "hardhat/types";
import {DeployFunction} from "hardhat-deploy/types";
import verify from "../utils/verify";
import {networkConfig, developmentChains} from "../utils/hardhat-config";
import {deployments, ethers} from "hardhat";
import {UserStoryTreasury} from "../typechain-types";

const deployUserStoryTreasury: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const {getNamedAccounts, deployments, network} = hre;
    const {deploy, log} = deployments;
    const {deployer} = await getNamedAccounts();
    log("Deploying User Story Treasury and waiting for Confirmations");
    /* Deployment of `UserStoryTreasury` */
    await deploy("UserStoryTreasury", {
        from: deployer,
        args: [],
        log: true,
        /* Waiting some Block Confirmation, so on a Testnet or Mainnet it can be verified properly */
        waitConfirmations: networkConfig[network.name].blockConfirmations || 1
    });
    const UserStoryTreasury = await deployments.get("UserStoryTreasury");
    const userStoryTreasury = (await ethers.getContractAt("UserStoryTreasury", UserStoryTreasury.address)) as UserStoryTreasury;
    log(`UserStoryTreasury at ${userStoryTreasury.address}`);
    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        await verify(userStoryTreasury.address, []);
    }
    /* Contract Object `userStory` that can invoke Function from Contract `UserStoryTreasury` */
    const TimeLock = await deployments.get("TimeLock");
    /* Giving Ownership of Contract `UserStoryContract` from `deployer` to Contract `TimeLockController` */
    const transferTransaction = await userStoryTreasury.transferOwnership(TimeLock.address);
    await transferTransaction.wait();
}

export default deployUserStoryTreasury;
deployUserStoryTreasury.tags = ["all", "deploy-user-story-treasury"];
