import {HardhatRuntimeEnvironment} from "hardhat/types";
import {DeployFunction} from "hardhat-deploy/types";
import verify from "../utils/verify";
import {networkConfig, developmentChains} from "../utils/hardhat-config";
import {ethers} from "hardhat";

const deployUserStory: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const {getNamedAccounts, deployments, network} = hre;
    const {deploy, log} = deployments;
    const {deployer} = await getNamedAccounts();
    log("----------------------------------------------------");
    log("Deploying UserStory and waiting for Confirmations");
    /* Deployment Object `UserStory` that can not invoke Function from Contract `Box` */
    const userStory = await deploy("UserStoryContract", {
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
    /* Contract Object `userStory` that can invoke Function from Contract `UserStoryContract` */
    const userStoryContract = await ethers.getContractAt("UserStoryContract", userStory.address);
    const governanceTimeLockContract = await ethers.getContract("GovernanceTimeLock");
    /* Giving Ownership of Contract `UserStoryContract` from `deployer` to Contract `timeLockContract` */
    const transferTransaction = await userStoryContract.transferOwnership(governanceTimeLockContract.address);
    await transferTransaction.wait();
}

export default deployUserStory;
deployUserStory.tags = ["all", "userStory"];
