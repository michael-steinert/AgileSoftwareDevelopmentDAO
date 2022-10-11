// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/governance/Governor.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorSettings.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorCountingSimple.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotes.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotesQuorumFraction.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorTimelockControl.sol";

/* 
`DaoGovernor` is designed to require minimal Use of Storage for more Gas-efficient Operations
`Governor` is the core Contract that contains all the Logic and Primitives - It is abstract and requires choosing one of each of the Modules
`GovernorSettings` manages Settings Voting Delay, Voting Period Duration and Proposal Threshold in a way that can be updated through a Governance Proposal, without requiring an Upgrade
`GovernorCountingSimple` offers three Options to Voters: For, Against, and Abstain, and where only For and Abstain Votes are counted towards Quorum
`GovernorVotes` hooks to an ERC20Votes Instance `IVotes` to determine the Voting Power of an Account based on the Token Balance they hold when a Proposal becomes active
`GovernorVotesQuorumFraction` works together with `ERC20Votes` to define Quorum as a Percentage of the Total Supply at the Block a Proposal’s Voting Power is retrieved
`GovernorTimelockControl` connects with an Instance of TimelockController - it allows multiple Proposers and Executors, in addition to the Governor itself
*/
contract DaoGovernor is
    Governor,
    GovernorSettings,
    GovernorCountingSimple,
    GovernorVotes,
    GovernorVotesQuorumFraction,
    GovernorTimelockControl
{
    constructor(
        // Token to govern the DAO that asserts the Voting Power
        IVotes _token,
        // DAO does not executed any Proposal before the Timelock Controller has been executed
        TimelockController _timeLockController,
        /*
        After how much Blocks after the Creation of the Proposal the Voting Power should be fixed
        A Delay since Proposal is created until Voting begins - A large Voting Delay gives Users Time to unstake Tokens if necessary
        `_votingDelay` is a Delay since the Proposal is created and Voting starts
        */
        uint256 _votingDelay,
        // After how much Blocks the Voting is ending - Length of Period during which People can cast their Vote resp. the Porposal remains open to Votes
        uint256 _votingPeriod,
        // Minimum Number of Votes an Account must have to create a Proposal - it restricts Proposal Creation to Accounts who have enough Voting Power
        uint256 _threshold,
        // Percentage of how much People (from the Total Supply) have to vote on the Proposal to be accepted
        uint256 _quorumPercentage
    )
        Governor("Scrum DAO Governor")
        GovernorSettings(_votingDelay, _votingPeriod, _threshold)
        GovernorVotes(_token)
        GovernorVotesQuorumFraction(_quorumPercentage)
        GovernorTimelockControl(_timeLockController)
    {}

    // Returns a Delay (in Number of Blocks) since the Proposal is submitted until Voting Power is fixed and Voting starts
    function votingDelay()
        public
        view
        override(IGovernor, GovernorSettings)
        returns (uint256)
    {
        // `votingDelay` can be used to enforce a Delay after a Proposal is published for Users to get Tokens, or delegate their Votes
        return super.votingDelay();
    }

    // Returns a Delay (in Number of Blocks) since the Proposal starts until Voting ends
    function votingPeriod()
        public
        view
        override(IGovernor, GovernorSettings)
        returns (uint256)
    {
        return super.votingPeriod();
    }

    // Returns the Quorum required for a Proposal to be successful
    function quorum(uint256 blockNumber)
        public
        view
        override(IGovernor, GovernorVotesQuorumFraction)
        returns (uint256)
    {
        return super.quorum(blockNumber);
    }

    // Returns the State of a Proposal on given Proposal ID
    function state(uint256 proposalId)
        public
        view
        override(Governor, GovernorTimelockControl)
        returns (ProposalState)
    {
        /*
        0: Pending,
        1: Active,
        2: Canceled,
        3: Defeated,
        4: Succeeded,
        5: Queued,
        6: Expired,
        7: Executed
        */
        return super.state(proposalId);
    }

    // Minimum Number of Votes an Account must have to create a Proposal
    function proposalThreshold()
        public
        view
        override(Governor, GovernorSettings)
        returns (uint256)
    {
        return super.proposalThreshold();
    }

    /*
    Create a new Proposal
    Vote start `IGovernor.votingDelay` Blocks after the Proposal is created and ends `IGovernor.votingPeriod` Blocks after the Voting starts
    */
    function propose(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        string memory description
    ) public override(Governor, IGovernor) returns (uint256) {
        return super.propose(targets, values, calldatas, description);
    }

    // The Functions below are Overrides required by Solidity
    /*
    Execute a successful Proposal after a Delay from `TimelockController`
    This requires the Quorum to be reached, the Vote to be successful, and the Deadline to be reached
    */
    function _execute(
        uint256 proposalId,
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) internal override(Governor, GovernorTimelockControl) {
        super._execute(proposalId, targets, values, calldatas, descriptionHash);
    }

    // Cancel a Proposal
    function _cancel(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) internal override(Governor, GovernorTimelockControl) returns (uint256) {
        return super._cancel(targets, values, calldatas, descriptionHash);
    }

    // Executor can execute a queued Proposal
    function _executor()
        internal
        view
        override(Governor, GovernorTimelockControl)
        returns (address)
    {
        return super._executor();
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(Governor, GovernorTimelockControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    // Returns the Balance of Votes for an Account as of the current Block that equals the Voting Power of an Account at a specific Block Number
    function getVotes(address account, uint256 blockNumber)
        public
        view
        override(IGovernor, Governor)
        returns (uint256)
    {
        return super.getVotes(account, blockNumber);
    }
}
