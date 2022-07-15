import { ethers } from "hardhat";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { UserStoryTreasuryCoordinator } from "../typechain-types";
import { developmentChains, networkConfig } from "../utils/hardhat-config";
import verify from "../utils/verify";

const deployUserStoryTreasuryCoordinator: DeployFunction = async (
  hre: HardhatRuntimeEnvironment
) => {
  const { getNamedAccounts, deployments, network } = hre;
  const { deploy, log, get } = deployments;
  const { deployer } = await getNamedAccounts();
  log(
    "Deploying User Story Treasury Coordinator and waiting for Confirmations"
  );
  /* Deployment of `UserStoryTreasuryCoordinator` */
  await deploy("UserStoryTreasuryCoordinator", {
    from: deployer,
    args: [],
    log: true,
    /* Waiting some Block Confirmation, so on a Testnet or Mainnet it can be verified properly */
    waitConfirmations: networkConfig[network.name].blockConfirmations || 1,
  });
  const UserStoryTreasuryCoordinator = await get(
    "UserStoryTreasuryCoordinator"
  );
  const userStoryTreasuryCoordinator = (await ethers.getContractAt(
    "UserStoryTreasuryCoordinator",
    UserStoryTreasuryCoordinator.address
  )) as UserStoryTreasuryCoordinator;
  log(
    `UserStoryTreasuryCoordinator at ${userStoryTreasuryCoordinator.address}`
  );
  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    await verify(
      "UserStoryTreasuryCoordinator",
      userStoryTreasuryCoordinator.address,
      network.name,
      []
    );
  }
  const TimeLock = await deployments.get("TimeLock");
  /* Giving Ownership of Contract `UserStoryTreasuryCoordinator` from `deployer` to Contract `TimeLockController` */
  const transferTransaction =
    await userStoryTreasuryCoordinator.transferOwnership(TimeLock.address);
  await transferTransaction.wait(1);
};

export default deployUserStoryTreasuryCoordinator;
deployUserStoryTreasuryCoordinator.tags = [
  "all",
  "deploy-user-story-treasury-coordinator",
];
