interface IProposal {
  proposalId: number;
  proposer: string;
  targets: any;
  signatures: any;
  calldata: any;
  startBlock: number;
  endBlock: number;
  description: string;
}
