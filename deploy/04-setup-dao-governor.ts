import { ethers } from 'hardhat';
import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';

const setupDaoGovernor: DeployFunction = async (
  hre: HardhatRuntimeEnvironment
) => {
  const { deployments, getNamedAccounts } = hre;
  const { log } = deployments;
  const { deployer } = await getNamedAccounts();
  const TimeLockController = await deployments.get('TimeLock');
  const timeLockController = await ethers.getContractAt(
    'TimeLock',
    TimeLockController.address
  );
  const DaoGovernor = await deployments.get('DaoGovernor');
  const daoGovernor = await ethers.getContractAt(
    'DaoGovernor',
    DaoGovernor.address
  );
  log('----------------------------------------------------');
  /* A Role can only be granted or revoked by someone with the Admin Role */
  /* Upon Deployment of the Time Lock Controller, both the Time Lock Controller and the Deployer of the Smart Contract have this Privilege */
  log('Setting up Time Lock Controller with new Roles');
  /* Proposer is an Address (Smart Contract or EOA) responsible for Scheduling (and Cancelling) Operations */
  const proposerRole = await timeLockController.PROPOSER_ROLE();
  /* Executor is an Address (Smart Contract or EOA) responsible for Executing Operations once the Time Lock has expired */
  const executorRole = await timeLockController.EXECUTOR_ROLE();
  /* Admin is an Address (Smart Contract or EOA) that is in Charge of Granting the Roles of Proposer and Executor */
  const adminRole = await timeLockController.TIMELOCK_ADMIN_ROLE();
  /* `deployer` owns the Contract `timeLockContract` so he can change the Roles */
  /* Only Contract `governorContract` can create a Proposal */
  const proposerTransaction = await timeLockController.grantRole(
    proposerRole,
    daoGovernor.address
  );
  await proposerTransaction.wait();
  /* Everyone can execute a Proposal after the TimeLock Period */
  const executorTransaction = await timeLockController.grantRole(
    executorRole,
    ethers.constants.AddressZero
  );
  await executorTransaction.wait();
  /* `deployer` does not own the Contract `timeLockContract` anymore, so he can not change the Roles */
  const revokeTransaction = await timeLockController.revokeRole(
    adminRole,
    deployer
  );
  /* Now, every Action that the Contract TimeLock wants to do has to go through the Governance Process */
  /* Giving Users this Level of Control will lead to unique and imaginative Governance Use Cases */
  await revokeTransaction.wait();
};

export default setupDaoGovernor;
setupDaoGovernor.tags = ['all', 'setup-dao-governor'];
