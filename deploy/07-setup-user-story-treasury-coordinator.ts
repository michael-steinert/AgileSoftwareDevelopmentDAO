import { ethers } from "hardhat";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import {
  UserStoryTreasury,
  UserStoryTreasuryCoordinator,
} from "../typechain-types";

const setupUserStoryTreasuryCoordinator: DeployFunction = async (
  hre: HardhatRuntimeEnvironment
) => {
  const { deployments } = hre;
  const { log, get } = deployments;
  log(
    "Setting up User Story Treasury Coordinator and waiting for Confirmations"
  );
  const UserStoryTreasuryCoordinator = await get(
    "UserStoryTreasuryCoordinator"
  );
  const userStoryTreasuryCoordinator = (await ethers.getContractAt(
    "UserStoryTreasuryCoordinator",
    UserStoryTreasuryCoordinator.address
  )) as UserStoryTreasuryCoordinator;
  const UserStoryTreasury = await get("UserStoryTreasury");
  const userStoryTreasury = (await ethers.getContractAt(
    "UserStoryTreasury",
    UserStoryTreasury.address
  )) as UserStoryTreasury;
  /* Upgrading the current UserStoryTreasury Contract */
  const upgradeTransaction =
    await userStoryTreasuryCoordinator.upgradeUserStoryTreasury(
      userStoryTreasury.address
    );
  await upgradeTransaction.wait(1);
};

export default setupUserStoryTreasuryCoordinator;
setupUserStoryTreasuryCoordinator.tags = [
  "all",
  "setup-user-story-treasury-coordinator",
];
