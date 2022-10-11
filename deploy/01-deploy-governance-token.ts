import { ethers } from 'hardhat';
import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import {
  developmentChains,
  TOKEN_INITIAL_SUPPLY,
  networkConfig,
  TOKEN_NAME,
  TOKEN_SYMBOL,
} from '../utils/dao-config';
import verifyContract from '../utils/verify-contract';

const deployGovernanceToken: DeployFunction = async (
  hre: HardhatRuntimeEnvironment
) => {
  const { getNamedAccounts, deployments, network } = hre;
  const { deploy, log } = deployments;
  // Getting from `hardhat.config.ts` the `deployer` Account which is the Account with Index 0
  const { deployer } = await getNamedAccounts();
  log('----------------------------------------------------');
  log('Deploying Governance Token and waiting for Confirmations');
  const governanceToken = await deploy('GovernanceToken', {
    from: deployer,
    args: [TOKEN_NAME, TOKEN_SYMBOL, TOKEN_INITIAL_SUPPLY],
    log: true,
    // Waiting some Block Confirmation in Order to verify properly the Smart Contract
    waitConfirmations: networkConfig[network.name].blockConfirmations || 1,
  });
  log(`Governance Token at ${governanceToken.address}`);
  if (!developmentChains.includes(network.name)) {
    await verifyContract(
      'GovernanceToken',
      governanceToken.address,
      network.name,
      [TOKEN_NAME, TOKEN_SYMBOL, TOKEN_INITIAL_SUPPLY]
    );
  }
  log(`Delegating to ${deployer} in Process`);
  await delegate(governanceToken.address, deployer);
  log('Governance Token delegated');
};

// Delegating a Vote from one User to another User
const delegate = async (
  governanceTokenAddress: string,
  delegatedAccount: string
) => {
  const governanceToken = await ethers.getContractAt(
    'GovernanceToken',
    governanceTokenAddress
  );
  const delegateTransaction = await governanceToken.delegate(delegatedAccount);
  // Transaction will be confirmed by one Block
  await delegateTransaction.wait();
  /*
  `numCheckpoints()` from `ERC20Votes` keep a Mapping over how many Checkpoints an Address (User) has
  Votes are based on Checkpoints - every Time a Vote Token is delegated (or transferred) a Checkpoint is created
  Each Checkpoint represent how much Vote Tokens (Voting Power) each User has
  Updating Checkpoints is much cheaper than updating Blocks
  */
  console.log(
    `Checkpoints: ${await governanceToken.numCheckpoints(delegatedAccount)}`
  );
};

export default deployGovernanceToken;
deployGovernanceToken.tags = ['all-scripts', 'deploy-governance-token'];
