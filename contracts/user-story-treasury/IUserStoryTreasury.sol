// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

// Interface for Smart Contract `UserStoryTreasury`
abstract contract IUserStoryTreasury {
    struct UserStory {
        address creator;
        uint256 userStoryNumber;
        string description;
        uint256 functionalComplexity;
        uint256 effortEstimation;
        uint256 timestamp;
        bool isDone;
    }

    enum UserStoryState {
        NEW,
        APPROVED,
        COMMITTED,
        DONE,
        REMOVED
    }

    // Event is emitted when the a User Story was created
    event UserStoryCreated(
        address indexed creator,
        uint256 userStoryNumber,
        string description,
        uint256 functionalComplexity,
        uint256 effortEstimation,
        uint256 timestamp,
        bool isDone
    );

    // Only DAO can invoke `storeUserStory()` to save a new Value in the Target Contract
    function storeUserStory(
        string memory _description,
        uint256 _functionalComplexity,
        uint256 _effortEstimation
    ) public virtual returns (UserStory memory);

    // Everyone can invoke `retrieveUserStory()` to get the User Story for a User Story Number
    function retrieveUserStory(uint256 _userStoryNumber)
        public
        view
        virtual
        returns (UserStory memory);

    // Everyone can invoke `retrieveAllUserStory()` to get all User Stories
    function retrieveAllUserStories()
        public
        view
        virtual
        returns (UserStory[] memory);
}
