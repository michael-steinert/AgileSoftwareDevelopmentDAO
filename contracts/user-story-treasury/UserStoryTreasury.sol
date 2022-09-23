// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "./IUserStoryTreasury.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

// `UserStoryTreasury` is owned and governed by DAO - new Values for `UserStory` are proposed through the DAO
contract UserStoryTreasury is IUserStoryTreasury, Ownable {
    error InvalidUserStory(
        string sentDescription,
        uint256 sentFunctionalComplexity,
        uint256 sentEffortEstimation
    );

    using Counters for Counters.Counter;
    Counters.Counter private userStoryCounter;

    uint256 private value;

    UserStory[] public userStories;

    // Only DAO can invoke `storeUserStory()` to save a new Value in the Target Contract
    function storeUserStory(
        string memory _description,
        uint256 _functionalComplexity,
        uint256 _effortEstimation
    ) public override onlyOwner returns (UserStory memory) {
        // Convert String to Byte to check its Length
        bytes memory descriptionAsByte = bytes(_description);
        if (
            descriptionAsByte.length == 0 ||
            _functionalComplexity == 0 ||
            _effortEstimation == 0
        ) {
            revert InvalidUserStory({
                sentDescription: _description,
                sentFunctionalComplexity: _functionalComplexity,
                sentEffortEstimation: _effortEstimation
            });
        } else {
            UserStory memory userStory = UserStory(
                msg.sender,
                userStoryCounter.current(),
                _description,
                _functionalComplexity,
                _effortEstimation,
                block.timestamp,
                false
            );
            userStories.push(userStory);
            emit UserStoryCreated(
                msg.sender,
                userStoryCounter.current(),
                _description,
                _functionalComplexity,
                _effortEstimation,
                block.timestamp,
                false
            );
            userStoryCounter.increment();
            return userStory;
        }
    }

    // Everyone can invoke `retrieveUserStory()` to get the User Story for a User Story Number
    function retrieveUserStory(uint256 _userStoryNumber)
        public
        view
        override
        returns (UserStory memory)
    {
        return userStories[_userStoryNumber];
    }

    // Everyone can invoke `retrieveAllUserStory()` to get all User Stories
    function retrieveAllUserStories()
        public
        view
        override
        returns (UserStory[] memory)
    {
        return userStories;
    }
}
