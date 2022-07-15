// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/* `UserStory` is owned and governed by DAO - new Values for `UserStory` are proposed through the DAO */
contract UserStoryTreasury is Ownable {
    error InvalidUserStory(
        string sentDescription,
        uint256 sentFunctionalComplexity,
        uint256 sentEffortEstimation
    );

    using Counters for Counters.Counter;
    Counters.Counter private userStoryCounter;

    enum UserStoryState {
        NEW,
        APPROVED,
        COMMITTED,
        DONE,
        REMOVED
    }

    uint256 private value;

    struct UserStory {
        address creator;
        uint256 userStoryNumber;
        string description;
        uint256 functionalComplexity;
        uint256 effortEstimation;
        uint256 timestamp;
        bool isDone;
    }

    UserStory[] public userStories;

    /* Event is emitted when the a UserStory was created */
    event UserStoryCreated(
        address indexed creator,
        uint256 userStoryNumber,
        string description,
        uint256 functionalComplexity,
        uint256 effortEstimation,
        uint256 timestamp,
        bool isDone
    );

    /* Only DAO can invoke `storeUserStory` to save a new Value in the Contract */
    function storeUserStory(
        string memory _description,
        uint256 _functionalComplexity,
        uint256 _effortEstimation
    ) public onlyOwner {
        /* Convert String to Byte to check its Length */
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
            userStories.push(
                UserStory(
                    msg.sender,
                    userStoryCounter.current(),
                    _description,
                    _functionalComplexity,
                    _effortEstimation,
                    block.timestamp,
                    false
                )
            );
        }

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
    }

    /* Everyone can invoke `retrieveUserStory` to get the UserStory for a UserStoryNumber */
    function retrieveUserStory(uint256 _userStoryNumber)
        public
        view
        returns (UserStory memory)
    {
        return userStories[_userStoryNumber];
    }

    /* Everyone can invoke `retrieveAllUserStory` to get all UserStories */
    function retrieveAllUserStories() public view returns (UserStory[] memory) {
        return userStories;
    }
}
