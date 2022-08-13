import { ethers } from "hardhat";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { UserStoryTreasuryProxy } from "../typechain-types";

const updateUserStoryTreasury: DeployFunction = async (
  hre: HardhatRuntimeEnvironment
) => {
  const { deployments } = hre;
  const { log, get } = deployments;
  log("Upgrading User Story Treasury and waiting for Confirmations");
  const UserStoryTreasuryProxy = await get("UserStoryTreasuryProxy");
  const userStoryTreasuryProxy = (await ethers.getContractAt(
    "UserStoryTreasuryProxy",
    UserStoryTreasuryProxy.address
  )) as UserStoryTreasuryProxy;

  /* Getting Transparent Proxy of `UserStoryTreasury` */
  const userStoryTreasuryTransparentProxy = await get(
    "UserStoryTreasury_Proxy"
  );

  /* Upgrading the current UserStoryTreasury Contract */
  const upgradeTransaction = await userStoryTreasuryProxy.upgrade(
    userStoryTreasuryTransparentProxy.address,
    /* Passing Address of new Contract */
    ethers.constants.AddressZero
  );
  await upgradeTransaction.wait(1);
};

export default updateUserStoryTreasury;
updateUserStoryTreasury.tags = ["all", "upgrade-user-story-treasury"];
