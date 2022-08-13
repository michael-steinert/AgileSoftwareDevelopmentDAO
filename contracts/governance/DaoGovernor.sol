// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/governance/Governor.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorSettings.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorCountingSimple.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotes.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotesQuorumFraction.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorTimelockControl.sol";

/* Contract `DaoGovernor` is designed to require minimal Use of Storage for more Gas-efficient Operations */
contract DaoGovernor is
    Governor,
    GovernorSettings,
    /* `GovernorCountingSimple` offers three Options to Voters: For, Against, and Abstain, and where only For and Abstain Votes are counted towards Quorum */
    GovernorCountingSimple,
    /* `GovernorVotes` hooks to an ERC20Votes Instance to determine the Voting Power of an Account based on the Token Balance they hold when a Proposal becomes active */
    GovernorVotes,
    /* `GovernorVotesQuorumFraction` works together with `ERC20Votes` to define Quorum as a Percentage of the Total Supply at the Block a Proposal’s Voting Power is retrieved */
    GovernorVotesQuorumFraction,
    GovernorTimelockControl
{
    constructor(
        /* Token to govern the DAO that asserts the Voting Power */
        IVotes _token,
        /* DAO does not executed any Proposal before the Timelock Controller has been executed */
        TimelockController _timeLockController,
        /* After how much Blocks the Voting beginning - Delay since Proposal is created until Voting starts (in Block Time ~ 13.2 Seconds) */
        uint256 _votingDelay,
        /* After how much Blocks the Voting is ending - Length of Period during which People can cast their Vote */
        uint256 _votingPeriod,
        /* Minimum Number of Votes an Account must have to create a proposal */
        uint256 _threshold,
        /* Percentage of how much People (from the total Supply) have to vote on the Proposal to be accepted */
        uint256 _quorumPercentage
    )
        Governor("Governor")
        /* Voting Delay: Delay since proposal is created until voting starts. Blocks correspond to one Week on Ethereum  */
        GovernorSettings(_votingDelay, _votingPeriod, _threshold)
        GovernorVotes(_token)
        GovernorVotesQuorumFraction(_quorumPercentage)
        GovernorTimelockControl(_timeLockController)
    {}

    function votingDelay()
        public
        view
        override(IGovernor, GovernorSettings)
        returns (uint256)
    {
        return super.votingDelay();
    }

    function votingPeriod()
        public
        view
        override(IGovernor, GovernorSettings)
        returns (uint256)
    {
        return super.votingPeriod();
    }

    function quorum(uint256 blockNumber)
        public
        view
        override(IGovernor, GovernorVotesQuorumFraction)
        returns (uint256)
    {
        return super.quorum(blockNumber);
    }

    /* Checking State of Proposal on given ID */
    function state(uint256 proposalId)
        public
        view
        override(Governor, GovernorTimelockControl)
        returns (ProposalState)
    {
        return super.state(proposalId);
    }

    /* Minimum Number of Votes an Account must have to create a Proposal */
    function proposalThreshold()
        public
        view
        override(Governor, GovernorSettings)
        returns (uint256)
    {
        return super.proposalThreshold();
    }

    /* Starting a Proposal */
    function propose(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        string memory description
    ) public override(Governor, IGovernor) returns (uint256) {
        return super.propose(targets, values, calldatas, description);
    }

    /* Executing a Proposal */
    function _execute(
        uint256 proposalId,
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) internal override(Governor, GovernorTimelockControl) {
        super._execute(proposalId, targets, values, calldatas, descriptionHash);
    }

    /* Canceling a Proposal */
    function _cancel(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) internal override(Governor, GovernorTimelockControl) returns (uint256) {
        return super._cancel(targets, values, calldatas, descriptionHash);
    }

    function _executor()
        internal
        view
        override(Governor, GovernorTimelockControl)
        returns (address)
    {
        return super._executor();
    }

    /* Execute can execute a queued Proposal */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(Governor, GovernorTimelockControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function getVotes(address account, uint256 blockNumber)
        public
        view
        override(IGovernor, Governor)
        returns (uint256)
    {
        return super.getVotes(account, blockNumber);
    }
}
