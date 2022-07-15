// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "./IUserStoryTreasury.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/* `UserStory` is owned and governed by DAO - new Values for `UserStory` are proposed through the DAO */
contract UserStoryTreasuryCoordinator is IUserStoryTreasury, Ownable {
    address public admin;
    IUserStoryTreasury public userStoryTreasury;

    constructor() {
        admin = msg.sender;
    }

    /* Function can only be called externally not internally */
    /* In public Functions an Array of Arguments is immediately copied to Memory */
    /* Instead external Functions can read directly from Calldata */
    /* Memory Allocation is expensive, whereas Reading from Calldata is cheap in Gas */
    function upgradeUserStoryTreasury(address _userStoryTreasury) external {
        require(
            msg.sender == admin,
            "Only Admin can upgrade the UserStoryTreasury"
        );
        userStoryTreasury = IUserStoryTreasury(_userStoryTreasury);
    }

    /* Only DAO can invoke `storeUserStory` to save a new Value in the Contract */
    function storeUserStory(
        string memory _description,
        uint256 _functionalComplexity,
        uint256 _effortEstimation
    ) public override onlyOwner returns (UserStory memory) {
        return
            userStoryTreasury.storeUserStory(
                _description,
                _functionalComplexity,
                _effortEstimation
            );
    }

    /* Everyone can invoke `retrieveUserStory` to get the UserStory for a UserStoryNumber */
    function retrieveUserStory(uint256 _userStoryNumber)
        public
        view
        override
        returns (UserStory memory)
    {
        return userStoryTreasury.retrieveUserStory(_userStoryNumber);
    }

    /* Everyone can invoke `retrieveAllUserStory` to get all UserStories */
    function retrieveAllUserStories()
        public
        view
        override
        returns (UserStory[] memory)
    {
        return userStoryTreasury.retrieveAllUserStories();
    }
}
