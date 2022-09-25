import { run } from 'hardhat';

const verifyContract = async (
  contractName: string,
  contractAddress: string,
  networkName: string,
  args: any[]
) => {
  console.log('Verifying Smart Contract');
  if (
    (networkName.includes('rinkeby') && process.env.ETHERSCAN_API_KEY) ||
    (networkName.includes('mumbai') && process.env.POLYGONSCAN_API_KEY)
  ) {
    try {
      await run('verify:verify', {
        address: contractAddress,
        constructorArguments: args,
        contract: `contracts/${contractName}.sol:${contractName}`,
      });
    } catch (error: any) {
      if (error.message.toLowerCase().includes('already verified')) {
        console.log(`Smart Contract ${contractName} already verified`);
      } else {
        console.error(error);
      }
    }
  }
};

export default verifyContract;
