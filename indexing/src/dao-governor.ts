import {
    DaoGovernor,
    ProposalCanceled,
    ProposalCreated,
    ProposalExecuted,
    ProposalQueued,
    ProposalThresholdSet,
    QuorumNumeratorUpdated,
    TimelockChange,
    VoteCast,
    VoteCastWithParams,
    VotingDelaySet,
    VotingPeriodSet
} from "../generated/DaoGovernor/DaoGovernor";
import {Proposal} from "../generated/schema";

export function handleProposalCreated(event: ProposalCreated): void {
    /* Entities can be loaded from the Store using a String ID */
    /* This ID needs to be unique across all Entities of the same Type */
    let proposal = Proposal.load(event.transaction.from.toHex());

    /* Entities only exist after they have been saved to the Store */
    /* Null Checks allow creating Entities on Demand */
    if (!proposal) {
        proposal = new Proposal(event.transaction.from.toHex());
    }

    /* Entity Fields can be set based on Event Parameters */
    proposal.proposalId = event.params.proposalId;
    /* Type Bytes is used for Type Address in GraphQL */
    proposal.proposer = event.params.proposer;
    proposal.values = event.params.values;
    proposal.startBlock = event.params.startBlock;
    proposal.endBlock = event.params.endBlock;
    proposal.description = event.params.description;

    /* Entities can be written to the Store */
    proposal.save();
}

export function handleProposalExecuted(event: ProposalExecuted): void {
}

export function handleProposalQueued(event: ProposalQueued): void {
}

export function handleProposalCanceled(event: ProposalCanceled): void {
}

export function handleProposalThresholdSet(event: ProposalThresholdSet): void {
}

export function handleQuorumNumeratorUpdated(event: QuorumNumeratorUpdated): void {
}

export function handleTimelockChange(event: TimelockChange): void {
}

export function handleVoteCast(event: VoteCast): void {
}

export function handleVoteCastWithParams(event: VoteCastWithParams): void {
}

export function handleVotingDelaySet(event: VotingDelaySet): void {
}

export function handleVotingPeriodSet(event: VotingPeriodSet): void {
}
