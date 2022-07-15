import { assert, expect } from "chai";
import { BigNumberish } from "ethers/lib/ethers";
import { deployments, ethers } from "hardhat";
import { TimeLock, UserStoryTreasury } from "../../../typechain-types";

const treasuryShouldStoreUserStory = async (): Promise<void> => {
  let timeLock: TimeLock;
  let userStoryTreasury: UserStoryTreasury;
  describe("Testing User Story Treasury", async () => {
    beforeEach(async () => {
      await deployments.fixture([
        "deploy-time-lock",
        // TODO: Fix deploy-user-story-treasury-coordinator
        "deploy-user-story-treasury",
      ]);
      const TimeLock = await deployments.get("TimeLock");
      timeLock = (await ethers.getContractAt(
        "TimeLock",
        TimeLock.address
      )) as TimeLock;
      const UserStoryTreasury = await deployments.get("UserStoryTreasury");
      userStoryTreasury = (await ethers.getContractAt(
        "UserStoryTreasury",
        UserStoryTreasury.address
      )) as UserStoryTreasury;
    });

    context("Testing Function storeUserStory()", async () => {
      it("should only allow Owner to store a new User Story", async () => {
        const description: string = "New User Story";
        const functionalComplexity: BigNumberish = "42";
        const effortEstimation: BigNumberish = "21";
        await expect(
          userStoryTreasury.storeUserStory(
            description,
            functionalComplexity,
            effortEstimation
          )
        ).to.be.revertedWith("Ownable: caller is not the owner");
      });

      it.skip("should store a new User Story", async () => {
        const description: string = "New User Story";
        const functionalComplexity: BigNumberish = "42";
        const effortEstimation: BigNumberish = "21";
        const timeLockSigner = timeLock.signer;
        await userStoryTreasury
          .connect(timeLockSigner)
          .storeUserStory(description, functionalComplexity, effortEstimation);
        const result = await userStoryTreasury.retrieveAllUserStories();
        assert(result.length === 1, "User Story was not stored in Treasury");
      });
    });
  });
};

export default treasuryShouldStoreUserStory;
