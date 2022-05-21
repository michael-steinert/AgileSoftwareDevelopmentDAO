// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/governance/TimelockController.sol";

/* TimeLockController that controls the Time Delay after a Proposal has passed */
/* It waits a Delay Time after a Proposal has passed before performing the Action from the Proposal */
/* TimeLock is a Best Practice for Governance Management, allows Time-delayed Opt-Out Changes in a System */
/* It allows Users to exit the System if they disagree with a Decision before it is executed */
/* TimeLocks let Users exit the System before Decision execution if they disagree with a given Decision */
/* Contract allows to wait for a new Proposal to be executed - this gives Users the Time to check the Proposal (Governance Update) */
/* Contract holds all Funds and Ownerships */
contract TimeLock is TimelockController {
    constructor(
        /* `minDelay` is how long the DAO has to wait before executing the Proposal */
        uint256 minDelay,
        /* The Proposer Role is in Charge of queueing Operations */
        /* The Governor Contract should be granted the Proposer Role, and it should likely be the only Proposer in the system */
        /* List of Addresses that can make a Proposal */
        address[] memory proposers,
        /* The Executor Role is in Charge of Executing already available Operations */
        /* The Executor Role should be assigned to  the special Zero Address to allow anyone to execute */
        /* List of Addresses that can execute a Proposal - only the `GovernorContract` */
        address[] memory executors
    )
    /* The Admin Role can grant and revoke the two Roles Proposer ans Executor */
    /* The Admin Role will be granted automatically to both Deployer and TimeLock itself, but should be renounced by the Deployer after Setup */
    TimelockController(minDelay, proposers, executors) {}
}
