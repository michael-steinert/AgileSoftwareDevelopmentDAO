import {network} from "hardhat";

export async function moveBlocks(amount: number) {
    console.log("Moving Blocks");
    for (let index = 0; index < amount; index++) {
        /* Moving Blocks on Development Network forward */
        await network.provider.request({
            method: "evm_mine",
            params: []
        });
    }
    console.log(`Moved ${amount} Blocks`);
}
