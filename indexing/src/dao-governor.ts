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
  VotingPeriodSet,
} from "../generated/DaoGovernor/DaoGovernor";
import { Proposal, Vote } from "../generated/schema";

export function handleProposalCreated(event: ProposalCreated): void {
  /* Entities can be loaded from the Store using a String ID */
  /* This ID needs to be unique across all Entities of the same Type */
  let proposalCreated = Proposal.load(event.transaction.from.toHex());

  /* Entities only exist after they have been saved to the Store */
  /* Null Checks allow creating Entities on Demand */
  if (!proposalCreated) {
    proposalCreated = new Proposal(event.transaction.from.toHex());
  }

  /* Entity Fields can be set based on Event Parameters */
  proposalCreated.proposalId = event.params.proposalId;
  /* Type Bytes is used for Type Address in GraphQL */
  proposalCreated.proposer = event.params.proposer;
  proposalCreated.values = event.params.values;
  proposalCreated.startBlock = event.params.startBlock;
  proposalCreated.endBlock = event.params.endBlock;
  proposalCreated.description = event.params.description;

  /* Entities can be written to the Store */
  proposalCreated.save();
}

export function handleVoteCast(event: VoteCast): void {
  /* Entities can be loaded from the Store using a String ID */
  /* This ID needs to be unique across all Entities of the same Type */
  let voteCast = Vote.load(event.transaction.from.toHex());

  /* Entities only exist after they have been saved to the Store */
  /* Null Checks allow creating Entities on Demand */
  if (!voteCast) {
    voteCast = new Vote(event.transaction.from.toHex());
  }

  /* Entity Fields can be set based on Event Parameters */
  /* Type Bytes is used for Type Address in GraphQL */
  voteCast.voter = event.params.voter;
  voteCast.proposalId = event.params.proposalId;
  voteCast.support = event.params.support;
  voteCast.weight = event.params.weight;
  voteCast.reason = event.params.reason;

  /* Entities can be written to the Store */
  voteCast.save();
}

export function handleVoteCastWithParams(event: VoteCastWithParams): void {
  /* Entities can be loaded from the Store using a String ID */
  /* This ID needs to be unique across all Entities of the same Type */
  let voteCastWithParams = Vote.load(event.transaction.from.toHex());

  /* Entities only exist after they have been saved to the Store */
  /* Null Checks allow creating Entities on Demand */
  if (!voteCastWithParams) {
    voteCastWithParams = new Vote(event.transaction.from.toHex());
  }

  /* Entity Fields can be set based on Event Parameters */
  /* Type Bytes is used for Type Address in GraphQL */
  voteCastWithParams.voter = event.params.voter;
  voteCastWithParams.proposalId = event.params.proposalId;
  voteCastWithParams.support = event.params.support;
  voteCastWithParams.weight = event.params.weight;
  voteCastWithParams.reason = event.params.reason;

  /* Entities can be written to the Store */
  voteCastWithParams.save();
}

export function handleProposalExecuted(event: ProposalExecuted): void {
  /* Entities can be loaded from the Store using a String ID */
  /* This ID needs to be unique across all Entities of the same Type */
  let proposalExecuted = Proposal.load(event.transaction.from.toHex());

  /* Entities only exist after they have been saved to the Store */
  /* Null Checks allow creating Entities on Demand */
  if (!proposalExecuted) {
    proposalExecuted = new Proposal(event.transaction.from.toHex());
  }

  /* Entity Fields can be set based on Event Parameters */
  proposalExecuted.proposalId = event.params.proposalId;

  /* Entities can be written to the Store */
  proposalExecuted.save();
}

export function handleProposalQueued(event: ProposalQueued): void {
  /* Entities can be loaded from the Store using a String ID */
  /* This ID needs to be unique across all Entities of the same Type */
  let proposalQueued = Proposal.load(event.transaction.from.toHex());

  /* Entities only exist after they have been saved to the Store */
  /* Null Checks allow creating Entities on Demand */
  if (!proposalQueued) {
    proposalQueued = new Proposal(event.transaction.from.toHex());
  }

  /* Entity Fields can be set based on Event Parameters */
  proposalQueued.proposalId = event.params.proposalId;
  proposalQueued.eta = event.params.eta;

  /* Entities can be written to the Store */
  proposalQueued.save();
}

export function handleProposalCanceled(event: ProposalCanceled): void {
  /* Entities can be loaded from the Store using a String ID */
  /* This ID needs to be unique across all Entities of the same Type */
  let proposalCanceled = Proposal.load(event.transaction.from.toHex());

  /* Entities only exist after they have been saved to the Store */
  /* Null Checks allow creating Entities on Demand */
  if (!proposalCanceled) {
    proposalCanceled = new Proposal(event.transaction.from.toHex());
  }

  /* Entity Fields can be set based on Event Parameters */
  proposalCanceled.proposalId = event.params.proposalId;

  /* Entities can be written to the Store */
  proposalCanceled.save();
}

export function handleProposalThresholdSet(event: ProposalThresholdSet): void {}

export function handleQuorumNumeratorUpdated(
  event: QuorumNumeratorUpdated
): void {}

export function handleTimelockChange(event: TimelockChange): void {}

export function handleVotingDelaySet(event: VotingDelaySet): void {}

export function handleVotingPeriodSet(event: VotingPeriodSet): void {}
