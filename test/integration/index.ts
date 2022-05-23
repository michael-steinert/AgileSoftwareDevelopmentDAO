import {waffle} from "hardhat";
import {Wallet} from "@ethersproject/wallet";
import daoIntegration from "./dao/dao-integration";

interface Voters {
    deployer: Wallet;
    alice: Wallet;
    bob: Wallet;
    eve: Wallet;
    mallory: Wallet;
}

describe("Unit Tests for Contracts", async () => {
    let voters = {} as Voters;
    before(async function () {
        const wallets = waffle.provider.getWallets();
        /* Setting all Voters */
        voters.deployer = wallets[0];
        voters.alice = wallets[1];
        voters.bob = wallets[2];
        voters.eve = wallets[3];
        voters.mallory = wallets[4];
    });

    describe("Testing DAO Integration", async () => {
        beforeEach(async () => {
            /* TODO */
        });
        daoIntegration();
    });
});
