import { ethers } from 'hardhat';
import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { UserStoryTreasury } from '../typechain-types';
import { developmentChains, networkConfig } from '../utils/hardhat-config';
import verify from '../utils/verify';

const deployUserStoryTreasury: DeployFunction = async (
  hre: HardhatRuntimeEnvironment
) => {
  const { getNamedAccounts, deployments, network } = hre;
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  log('Deploying User Story Treasury and waiting for Confirmations');
  /* Deployment of `UserStoryTreasury` */
  await deploy('UserStoryTreasury', {
    from: deployer,
    args: [],
    log: true,
    /* Waiting some Block Confirmation, so on a Testnet or Mainnet it can be verified properly */
    waitConfirmations: networkConfig[network.name].blockConfirmations || 1,
  });
  const UserStoryTreasury = await deployments.get('UserStoryTreasury');
  const userStoryTreasury = (await ethers.getContractAt(
    'UserStoryTreasury',
    UserStoryTreasury.address
  )) as UserStoryTreasury;
  log(`User Story Treasury at ${userStoryTreasury.address}`);
  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    await verify(
      'UserStoryTreasury',
      userStoryTreasury.address,
      network.name,
      []
    );
  }
  /* Giving Ownership of Contract `UserStoryTreasury` from Deployer to Contract `TimeLock` */
  /* TimeLock will have the Power to execute Operations on the Contract */
  const TimeLock = await deployments.get('TimeLock');
  log(
    `Transfer Ownership of User Story Treasury to TimeLock at ${TimeLock.address}`
  );
  const transferOwnershipTransaction =
    await userStoryTreasury.transferOwnership(TimeLock.address);
  await transferOwnershipTransaction.wait(1);
};

export default deployUserStoryTreasury;
deployUserStoryTreasury.tags = ['all-scripts', 'deploy-user-story-treasury'];
