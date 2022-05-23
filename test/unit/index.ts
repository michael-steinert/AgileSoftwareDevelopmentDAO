import {deployments, ethers, waffle} from "hardhat";
import {Wallet} from "@ethersproject/wallet";
import {UserStoryTreasury} from "../../typechain-types";
import treasuryShouldStoreUserStory from "./treasury/treasury-should-store-user-story.spec";

interface Voters {
    deployer: Wallet;
    alice: Wallet;
    bob: Wallet;
    eve: Wallet;
    mallory: Wallet;
}

describe("Unit Tests for Contracts", async () => {
    let voters = {} as Voters;
    let userStoryTreasury: UserStoryTreasury;
    before(async () => {
        const wallets = waffle.provider.getWallets();
        /* Setting all Voters */
        voters.deployer = wallets[0];
        voters.alice = wallets[1];
        voters.bob = wallets[2];
        voters.eve = wallets[3];
        voters.mallory = wallets[4];
    });

    describe("Testing User Story Treasury", async () => {
        beforeEach(async () => {
            await deployments.fixture(["deploy-user-story-treasury"]);
            const UserStoryTreasury = await deployments.get("UserStoryTreasury");
            userStoryTreasury = (await ethers.getContractAt("UserStoryTreasury", UserStoryTreasury.address)) as UserStoryTreasury;
        });
        treasuryShouldStoreUserStory(userStoryTreasury, voters);
    });
});
