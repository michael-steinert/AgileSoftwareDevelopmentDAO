import {run} from "hardhat";

const verify = async (contractAddress: string, networkName: string, args: any[]) => {
    console.log("Verifying Smart Contract");
    if ((networkName.includes("rinkeby") && process.env.ETHERSCAN_API_KEY) ||
        (networkName.includes("mumbai") && process.env.POLYGONSCAN_API_KEY)) {
        try {
            await run("verify:verify", {
                address: contractAddress,
                constructorArguments: args,
            });
        } catch (error: any) {
            if (error.message.toLowerCase().includes("already verified")) {
                console.log("Already verified!");
            } else {
                console.error(error);
            }
        }
    }
}

export default verify;
