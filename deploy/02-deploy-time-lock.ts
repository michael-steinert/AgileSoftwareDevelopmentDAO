import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import {
  developmentChains,
  EXECUTORS,
  MIN_DELAY,
  networkConfig,
  PROPOSERS,
} from '../utils/dao-config';
import verifyContract from '../utils/verify-contract';

const deployTimeLock: DeployFunction = async (
  hre: HardhatRuntimeEnvironment
) => {
  const { getNamedAccounts, deployments, network } = hre;
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  log('----------------------------------------------------');
  log('Deploying Time Lock Controller and waiting for Confirmations');
  const timeLock = await deploy('TimeLock', {
    from: deployer,
    args: [MIN_DELAY, PROPOSERS, EXECUTORS, deployer],
    log: true,
    // Waiting some Block Confirmation in Order to verify properly the Smart Contract
    waitConfirmations: networkConfig[network.name].blockConfirmations || 1,
  });
  if (!developmentChains.includes(network.name)) {
    await verifyContract('TimeLock', timeLock.address, network.name, [
      MIN_DELAY,
      PROPOSERS,
      EXECUTORS,
      deployer,
    ]);
  }
  log(`Time Lock Controller at ${timeLock.address}`);
};

export default deployTimeLock;
deployTimeLock.tags = ['all-scripts', 'deploy-time-lock'];
