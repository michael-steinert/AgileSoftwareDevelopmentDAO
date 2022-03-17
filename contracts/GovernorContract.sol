// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "@openzeppelin/contracts/governance/Governor.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorCountingSimple.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotes.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotesQuorumFraction.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorTimelockControl.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";

/* Contract `Governor` is designed to require minimal Use of Storage for more Gas-efficient Operations */
contract GovernorContract is
    Governor,
    /* `GovernorCountingSimple` offers three Options to Voters: For, Against, and Abstain, and where only For and Abstain Votes are counted towards Quorum */
    GovernorCountingSimple,
    /* `GovernorVotes` hooks to an ERC20Votes Instance to determine the Voting Power of an Account based on the Token Balance they hold when a Proposal becomes active */
    GovernorVotes,
    /* `GovernorVotesQuorumFraction` works together with `ERC20Votes` to define Quorum as a Percentage of the Total Supply at the Block a Proposal’s Voting Power is retrieved */
    GovernorVotesQuorumFraction,
    GovernorTimelockControl {
    /* How long after a Proposal is created should Voting Power be fixed - Parameters is specified in Number of Blocks */
    /* A large Voting Delay gives Users Time to un-stake Tokens if necessary */
    uint256 public s_votingDelay;
    /* How long does a Proposal remain open to Votes - Parameters is specified in Number of Blocks */
    uint256 public s_votingPeriod;

    constructor(
        /* Token to govern the DAO that asserts the Voting Power */
        ERC20Votes _token,
        /* DAO does not executed any Proposal before the Timelock Controller has been executed */
        TimelockController _timelock,
        /* Percentage of how much People (from the total Supply) have to vote on the Proposal to be accepted */
        uint256 _quorumPercentage,
        /* After how much Blocks the Voting is ending */
        uint256 _votingPeriod,
        /* After how much Blocks the Voting beginning */
        uint256 _votingDelay
    ) Governor("GovernorContract") GovernorVotes(_token) GovernorVotesQuorumFraction(_quorumPercentage) GovernorTimelockControl(_timelock) {
        s_votingDelay = _votingDelay;
        s_votingPeriod = _votingPeriod;
    }

    function votingDelay() public view override returns (uint256) {
        return s_votingDelay;
    }

    function votingPeriod() public view override returns (uint256) {
        /* 45818 Blocks correspond to one Week on Ethereum */
        return s_votingPeriod;
    }

    function quorum(uint256 blockNumber) public view override(IGovernor, GovernorVotesQuorumFraction) returns (uint256) {
        return super.quorum(blockNumber);
    }

    /* Getting Votes (Voting Power) of Addresses on specific Blocks */
    function getVotes(address account, uint256 blockNumber) public view override(IGovernor, GovernorVotes) returns (uint256) {
        return super.getVotes(account, blockNumber);
    }

    /* Checking State of Proposal on given ID*/
    function state(uint256 proposalId) public view override(Governor, GovernorTimelockControl) returns (ProposalState) {
        return super.state(proposalId);
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

    function _executor() internal view override(Governor, GovernorTimelockControl) returns (address) {
        return super._executor();
    }

    /* Execute can execute a queued Proposal */
    function supportsInterface(bytes4 interfaceId) public view override(Governor, GovernorTimelockControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
