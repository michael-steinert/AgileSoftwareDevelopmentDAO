// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/governance/TimelockController.sol";

/*
TimeLockController that controls the Time Delay after a Proposal has passed
It will execute Proposals and thus the TimeLock that should hold any Funds, Ownership, and Access Control Roles
It waits a Delay Time after a Proposal has passed before performing the Action from the Proposal
TimeLock is a Best Practice for Governance Management, allows Time-delayed Opt-Out Changes in a System
It allows Users to exit the System if they disagree with a Decision before it is executed
TimeLocks let Users exit the System before Decision execution if they disagree with a given Decision
Contract allows to wait for a new Proposal to be executed - this gives Users the Time to check the Proposal (Governance Update)
Contract holds all Funds and Ownerships
*/
contract TimeLock is TimelockController {
    constructor(
        // `minDelay` is how long the DAO has to wait before executing the Proposal - a Delay for an Operation to become valid
        uint256 minDelay,
        /*
        The Proposer Role is in Charge of queueing Operations
        The Governor Contract should be granted the Proposer Role, and it should likely be the only Proposer in the System
        List of Addresses that can make a Proposal
        */
        address[] memory proposers,
        /*
        The Executor Role is in Charge of Executing already available Operations
        The Executor Role should be assigned to  the special Zero Address to allow anyone to execute
        List of Addresses that can execute a Proposal - only the `GovernorContract`
        The Admin Role can grant and revoke the two Roles Proposer ans Executor
        The Admin Role will be granted automatically to both Deployer and TimeLock itself, but should be renounced by the Deployer after Setup
        */
        address[] memory executors,
        /*
        Optional Account to be granted Admin Role
        The optional Admin can help with the initial Configuration of Roles after Deployment without causing Delays
        This Role should be later renounced in Favour of Administration through timelocked Proposals
        */
        address admin
    ) TimelockController(minDelay, proposers, executors, admin) {
        /*
        The Proposer Role is in Charge of Queueing Operations - this is the Role the Governor Contract should be granted, and it should likely be the only Proposer in the System
        The Executor Role is in Charge of Executing already available Operations - this Role can be assigned to the Zero Address to allow anyone to execute Proposals
        If Operations can be particularly time-sensitive, the Governor should be made Executor instead
        The Admin Role can grant and revoke the two previous Roles - this is a sensitive Role that will be granted automatically to both Deployer and TimeLock itself
        It should be renounced by the Deployer after Setup so that the DAO becomes self-governed
      */
    }
}
