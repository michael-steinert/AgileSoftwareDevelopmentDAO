import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import {
  developmentChains,
  EXECUTORS,
  MIN_DELAY,
  networkConfig,
  PROPOSERS,
} from '../utils/hardhat-config';
import verify from '../utils/verify';

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
    args: [MIN_DELAY, PROPOSERS, EXECUTORS],
    log: true,
    /* Waiting some Block Confirmation, so on a Testnet or Mainnet it can be verified properly */
    waitConfirmations: networkConfig[network.name].blockConfirmations || 1,
  });
  if (!developmentChains.includes(network.name)) {
    await verify('TimeLock', timeLock.address, network.name, [
      MIN_DELAY,
      PROPOSERS,
      EXECUTORS,
    ]);
  }
  log(`Time Lock Controller at ${timeLock.address}`);
};

export default deployTimeLock;
deployTimeLock.tags = ['all', 'deploy-time-lock'];
