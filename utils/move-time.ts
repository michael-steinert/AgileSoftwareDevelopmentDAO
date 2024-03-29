import { network } from "hardhat";

export async function moveTime(amount: number) {
  console.log('Moving Blocks');
  // Moving Time forward on Development Network
  await network.provider.send('evm_increaseTime', [amount]);
  console.log(`Moved forward in Time ${amount} Seconds`);
}
