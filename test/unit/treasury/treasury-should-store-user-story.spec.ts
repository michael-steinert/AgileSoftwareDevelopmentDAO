import {assert} from "chai";
import {Wallet} from "@ethersproject/wallet";
import {UserStoryTreasury} from "../../../typechain-types";
import {BigNumberish} from "ethers/lib/ethers";

interface Voters {
    deployer: Wallet;
    alice: Wallet;
    bob: Wallet;
    eve: Wallet;
    mallory: Wallet;
}

const treasuryShouldStoreUserStory = async (userStoryTreasury: UserStoryTreasury, voters: Voters): Promise<void> => {
    context("Testing Function deposit()", async function () {
        it("should store a new User Story", async () => {
            const description: string = "New User Story";
            const functionalComplexity: BigNumberish = "42";
            const effortEstimation: BigNumberish = "21";
            await userStoryTreasury.storeUserStory(description, functionalComplexity, effortEstimation);

            const result = await userStoryTreasury.retrieveAllUserStories();

            await assert(result.length === 1, "User Story was not stored in Treasury");
        });
    });
};

export default treasuryShouldStoreUserStory;
