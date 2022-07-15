// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

/* Interface to allow the Adapater Pattern for change the current Implementation fo the Smart Contract */
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
    ) public virtual returns (UserStory memory);

    /* Everyone can invoke `retrieveUserStory` to get the UserStory for a UserStoryNumber */
    function retrieveUserStory(uint256 _userStoryNumber)
        public
        view
        virtual
        returns (UserStory memory);

    /* Everyone can invoke `retrieveAllUserStory` to get all UserStories */
    function retrieveAllUserStories()
        public
        view
        virtual
        returns (UserStory[] memory);
}
