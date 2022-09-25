import { ethers, network } from 'hardhat';

export async function moveBlocks(amount: number) {
  console.log(
    `Current Block before Moving is ${await ethers.provider.getBlockNumber()}`
  );
  console.log('Moving Blocks');
  for (let index = 0; index < amount; index++) {
    // Moving Blocks forward on Development Network
    await network.provider.request({
      method: 'evm_mine',
      params: [],
    });
  }
  console.log(`Moved ${amount} Blocks`);
  console.log(
    `Current Block after Moving is ${await ethers.provider.getBlockNumber()}`
  );
}
