import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import {
  developmentChains,
  networkConfig,
  QUORUM_PERCENTAGE,
  THRESHOLD,
  VOTING_DELAY,
  VOTING_PERIOD,
} from '../utils/dao-config';
import verifyContract from '../utils/verify-contract';

const deployDaoGovernor: DeployFunction = async (
  hre: HardhatRuntimeEnvironment
) => {
  const { getNamedAccounts, deployments, network } = hre;
  const { deploy, log, get } = deployments;
  const { deployer } = await getNamedAccounts();
  // Getting existing Instance of Contract `GovernanceToken`
  const governanceToken = await get('GovernanceToken');
  // Getting existing Instance of Contract `TimeLockController`
  const timeLockController = await get('TimeLock');
  log('----------------------------------------------------');
  log('Deploying DAO Governor and waiting for Confirmations');
  const daoGovernor = await deploy('DaoGovernor', {
    from: deployer,
    args: [
      governanceToken.address,
      timeLockController.address,
      QUORUM_PERCENTAGE,
      VOTING_PERIOD,
      VOTING_DELAY,
      THRESHOLD,
    ],
    log: true,
    // Waiting some Block Confirmation in Order to verify properly the Smart Contract
    waitConfirmations: networkConfig[network.name].blockConfirmations || 1,
  });
  log(`DAO Governor at ${daoGovernor.address}`);
  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    await verifyContract('DaoGovernor', daoGovernor.address, network.name, [
      governanceToken.address,
      timeLockController.address,
      QUORUM_PERCENTAGE,
      VOTING_PERIOD,
      VOTING_DELAY,
      THRESHOLD,
    ]);
  }
};

export default deployDaoGovernor;
deployDaoGovernor.tags = ['all-scripts', 'deploy-dao-governor'];
