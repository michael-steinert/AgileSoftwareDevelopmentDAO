# OpenZeppelin Governor

- Voting Power is determined based on the Number of Tokens delegated to each Address
- This means Users must submit a Delegation Transaction before their Tokens will be included in Governance Votes
- Users may either delegate their Token to a third Party, or self-delegate if they would like to participate in Voting directly

- The basic Unit of Governance is a Proposal, which represents a Package of executable Code to make specific Adjustments to the underlying Protocol
- To prevent Spamming, only Users whose Voting Power exceeds the Proposal Submission Threshold are able to submit Proposals

- An optional Proposal Delay Parameter allows Protocols to delay the Start of Voting for a specified Length of Time after a Proposal is submitted, giving Time for Users to update their Vote Delegation

- Voting takes Place over a predefined Voting Period determined by the underlying Protocol
- When the Voting Period ends, the System first checks if the Number of Votes for the Proposal exceed the Protocol's Quorum Threshold (The Percentage of required Votes of the total Tokens that must be cast to reach the Quorum)

- If the Quorum Threshold has been met and the Vote gains Majority Support, the passed Proposal is then placed into a TimeLock Queue which delays Code (Proposal) Execution
- This Time-lock is intended as a Security Measure, allowing Users to withdraw Funds if they think the Proposal is malicious or otherwise unacceptable
- If the Proposer's Voting Power drops below the Proposal Submission Threshold at any Time from Submission until the Voting or TimeLock Period ends, the Proposal can be cancelled
- Once the entire Process has finished, the Proposal can be executed and relevant Code or Parameter Changes are implemented in the Protocol

### Proposal State Flowchart

- Proposals are executable Code, not Suggestions for a Team or Foundation to implement
- All Proposals are Subject to a 3 Day Voting Period, and any Address with Voting Power can vote for or against the Proposal
- If a Majority, and at least 400,000 Votes are cast for the Proposal, it is queued in the `TimeLock`, and can be implemented after 2 Days

![governance-process](https://user-images.githubusercontent.com/29623199/192141281-fdda1252-a923-46db-96e6-27fdf8d90ebc.png)

## OpenZeppelin TimeLock

- In a Governance System, the TimeLock Controller is in Charge of Introducing a Delay between a Proposal and its Execution
- When the `TimeLock` is set as the Owner of an `ownable` Smart Contract, it enforces a Delay on all `onlyOwner` Maintenance Operations
- When the `TimeLock` is self-governed, it only can execute the `Target Contract` after a Delay
- The Delay gives Time for Users of the controlled `ownable` Contract to exit before a potentially dangerous Maintenance Operation is applied
- It contains the following Roles that can only be granted or revoked by someone with the **Admin Role**
  - **Proposer** is an Address (Smart Contract or EOA) that is in Charge of Scheduling (and Cancelling) Operations
  - **Executor** is an Address (Smart Contract or EOA) that is in Charge of Executing Operations once the `TimeLock` has expired
  - **Admin** is an Address (Smart Contract or EOA) that is in Charge of Granting the Roles of Proposer and Executor
- After deployment of the `TimeLock`, both the `TimeLock` and the Deployer have the **Admin Role** - this helps further Configurations of the `TimeLock` by the Deployer but after the Configuration is done, it is recommended that the Deployer renounces its **Admin Role** and relies on time-locked Operations to perform future Maintenance
- A `TimeLock` Controller is self-governed if only the `TimeLock` holds the **Admin Role**
- When the `TimeLock` is self-governed, a **Proposer** will be able to schedule a Proposal, and will have to wait for the Delay of the `TimeLock` until the Proposal can be executed, at which Point it will actually come into Effect
- When the `TimeLock` is self-governed, it should be ensured when Revoking a **Proposer** or **Executor** that at least one other trusted User is assigned to that Role - otherwise, no one will have the correct Privileges to create or execute Proposals for the `TimeLock` Controller

### OpenZeppelin TimeLock Operation Lifecycle

- An Operation is a Transaction (or a set of Transactions) that is the Subject of the `TimeLock`
- It has to be scheduled by a **Proposer** and executed by an **Executor**
- The `TimeLock` enforces a minimum Delay between the Proposition and the Execution in the following Operation Lifecycle
- **Unset → Pending → Pending + Ready → Done**

  - **Unset**: An Operation that is not Part of the `TimeLock` Mechanism
  - **Pending**: An Operation that has been scheduled, before the Timer expires
  - **Ready**: An Operation that has been scheduled, after the Timer expires
  - **Done**: An Operation that has been executed

- By Calling `schedule()`, a **Proposer** moves the Operation from the **Unset** to the **Pending** State
- This starts a Timer that must be longer than the minimum Delay
- The Timer expires at a Timestamp accessible through the `getTimestamp()`

- Once the Timer expires, the Operation automatically gets the **Ready** State - at this Point, it can be executed

- By Calling `execute()`, an **Executor** triggers the Operation’s underlying Transactions and moves it to the **Done** State
- If the Operation has a Predecessor, it has to be in the **Done** State for this Transition to succeed

- `cancel()` allows **Proposers** to cancel any **Pending** Operation
- This resets the Operation to the **Unset** State
- It is thus possible for a **Proposer** to re-schedule an Operation that has been cancelled - tn this case, the Timer restarts when the Operation is re-scheduled

## Proposal

- A Proposal is a Sequence of Actions that the Governor Contract will perform if it passes
- Each Action consists of a **Target Address**, **Calldata encoding a Function Call**, and an **Amount of Ether** to include
- Additionally, a Proposal includes a human-readable Description

- Once a Proposal is active, Delegates can cast their Vote
- The Delegates carry the Voting Power, that means the if a Token Holder wants to participate:

  - they can set a trusted Representative as their Delegate,
  - or they can become a Delegate themselves by self-delegating their Voting Power

- Once the Voting Period is over, if Quorum was reached (enough Voting Power participated) and the Majority voted in Benefit of the Proposal
- Then the Proposal is considered successful and can proceed to be executed

- A Proposal can be in the following specified Sate:

  - 0: Pending,
  - 1: Active,
  - 2: Canceled,
  - 3: Defeated,
  - 4: Succeeded,
  - 5: Queued,
  - 6: Expired,
  - 7: Executed

- A Vote Type for a Proposal can be in the following specified Sate:
  - 0: Against,
  - 1: For,
  - 2: Abstain

## Events

- **ProposalCreated**(proposalId, proposer, targets, values, signatures, calldata, startBlock, endBlock, description)
- **ProposalCanceled**(proposalId)
- **ProposalExecuted**(proposalId)
- **VoteCast**(voter, proposalId, support, weight, reason)
- **VoteCastWithParams**(voter, proposalId, support, weight, reason, params)
