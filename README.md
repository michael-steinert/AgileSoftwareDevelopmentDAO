# TODOs

- Front End reacts on emitted Events (hardhat) from Smart Contracts
- Front End using a Poll to vote (npm: react-polls)

# Tally

- Tally allows Users to create Proposals, visualize Voting Power and Advocates, navigate Proposals, and cast Votes

# Decentralized autonomous Organization

- A decentralized autonomous Organization (DAO) is a collective Entity owned and operated by its Community Members
- Funds are stored in their in the Treasury of the DAO and are governed by Smart Contracts, which means DAOs do not have to rely on Intermediate (like Banks) to store their Funds
- There is no central Authority within the Organization
- Decisions are executed via Proposals and Voting, this ensures Fairness and Equality amongst its Owners (Community Members)
- DAOs allow everyone to have a Voice within the Proposal and Voting

- DAOs are a new Form of Organization that

  - distributes Decision-Making Power
  - shares Ownership amongst Participants
  - automates exception to Decisions
  - are cryptographically secured and transparent

- Smart Contracts are a Computer Programs that run on the Blockchain, they are executed once pre-determined Conditions are met
- They represent the Laws of the DAO - this Rules Set in the Smart Contract will govern the Entity
- This Rules Set is defined in Code therefore there is no Need for an Intermediary to facilitate Trust and execute Decisions

## Smart Contract

- Smart Contracts are superior digital Agreements
  - **Security**: Smart Contract are tamper-proof digital Agreements that can not be influenced by a single Party
  - **Guaranteed Execution**: Execution and Enforcement of the Agreements is performed by an always-on decentralized Network (Blockchain)
  - **Transparency**: Transparency of the Agreements and their Enforcement us unavoidably built-in the Blockchain
  - **Trust Minimization**: Smart Contracts reduce the Counter-Party Risk due to neither Party having Control over them to execute or enforce their Agreements
  - **Efficiency**: Smart Contracts provide an Opportunity to migrate existing manual Processes to be automated

## Description of the DAO

- `UserStoryTreasury` is owned by the `TimeLock` and therefore it can only be called by the `TimeLock`
- This ensures Automation, and dao-controlled Execution of successful Proposals
- `DaoGovernor` is given Proposer Rights, while the Executor is given to anyone

### Structure On-Chain Voting

- **Governance Token**: The Governance Token gives Voting Power for each Account
- **Governor**: The Governor contains the Logic and Mechanics to propose, vote and execute Proposals
- **Time Lock**: The Time Lock is a Queue to enforce Time Gap between the Passing and Execution of a Proposal
- **Target Contract**: The Target Contract is that Smart Contract on that the DAO is going to make Decisions

### Time-related Concepts

- **votingDelay (Governor)** is a Time Interval (in Number of Blocks) between Submitting a Proposal and when Voting Power is fixed. It can be used to enforce a Delay after a Proposal is published for Users to un-stake Tokens or delegate their Votes
- **votingPeriod (Governor)** is the Time Slot when Voting is open. It starts after votingDelay, als in Number of Blocks
- **minDelay (TimeLock)** is the Delay Period before a passed Proposal is executed. When it is active the Proposal is queued. It gives the Users the Opportunity to exit the DAO if they disagree with the Proposal

## Governance

- Governance is all the Processes of Interaction over a Social System
- It is done by the Government of a State, by a Market or by a Network
- The Goal of Governance to allow a Group of People to make generally accepted Decisions

## Decentralized Governance

- Decentralized Governance manages collective Action and common Resources outside the existing Legal System
- The Rules of decentralized Organizations are enforced by Code
- These gives decentralized Systems greater Predictability as changing Laws or Governments do not impact the Organization
- But it also requires greater Care in designing Governance Mechanisms, as Token Holders can not rely on the Courts to protect their Needs

- Token Holders can vote on Executive Actions and Parameter Changes instead of delegating their Voting Power to a Board of Directors and Executive Officers
- This empowers Participants, but can also lead to Voter Apathy and less organizational Agility due to the sheer Volume of Issues to review

## Advantages of DAOs

- There is no Need for a DAO to store Funds with traditional Banks
- This avoids any Read Tapes and Regulation preventing the DAO from opening Bank Accounts, because it already has its own Bank (Treasury)

- Decisions that impact the DAO are not exclusively carried out by a small Group of People
- Each Member of the Collective (DAO) has the Opportunity to propose Decisions that can shape the entire Organization (DAO)

- Decentralized Governance vests Power directly with Token Holders, removing Executive Teams that could become Targets of Censorship, Manipulation, or Corruption
- Relying on Code for Executing Agreements also reduces reliance on external Legal Systems

## Types of Governance

- DAO is a Organization where a Treasury is controlled by the collective Decision of the Token Holders of a Project, and all Actions are executed via Proposals enforced by On-Chain Votes

### On-Chain Voting

- On-Chain Voting refers to Governance Systems where individual Votes are submitted as Transactions, and recorded directly on the Blockchain
- Submitting on-chain requires Users to pay a Transaction Fee for each Vote
- Smart Contracts can be designed to execute Proposals automatically based on the Outcome of on-chain Votes, removing the Need for a trusted third Party to enact Vote Results

### Off-Chain Voting

- Off-Chain Voting refers to Governance Systems where individual Votes are not submitted as Blockchain Transactions
- No Transaction Fees are necessary for off-chain Votes
- In Token weighted Voting Schemes, Users are prompted to sign Messages with their Wallet to vote, and the resulting Data is stored via a decentralized File Storage System
- While this Storage Mechanism reduces Risk of Vote Tampering, a trusted third Party is still needed to count the Votes and enact the Results on-chain using Admin Privileges

### On-Chain vs. Off-Chain Voting

| Off-Chain Governance                                                                                         | On-Chain Governance                                           |
| ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------- |
| A Person (EOA) or a Group of Persons (Multi-Signature\*) is in Control                                       | Specific Governor Contract is in Control                      |
| Community Members can express their Opinions                                                                 | Community Members Vote are submitted to the Governor Contract |
| Vote Results are non-binding (so the Person with Control could execute an Action without approved by a Vote) | Actions can only be executed if they are approved by a Vote   |
| Passed Proposals are executed by a third Party with Admin Privileges                                         | Passed Proposals can be executed automatically                |

- \*Multi-Signature: Control over the Smart Contract is split between several individual Signers, and a specific Number of all Signers are required to approve any Transactions from the Multi-Signature

## Vote Delegation

- Vote Delegation lets Token Holders transfer their Voting Power to another User, without giving up Control of the underlying Asset
- Vote Delegation can be withdrawn at any Time, which helps ensure that Protocol Advocates remain aligned with their Supporters

- Vote Delegation lowers the Cost of Participating in Governance
- By Delegating to another User, Token Holders can avoid the Time involved in Reviewing each individual Proposal as well as the Transaction Fee required to submit on-chain Votes
- Vote Delegation also allows smaller Token Holders to aggregate their Stakes to gain a bigger Voice in Governance Discussions

## OpenZeppelin Governor

- Voting Power is determined based on the Number of Tokens delegated to each Address
- This means Users must submit a Delegation Transaction before their Tokens will be included in Governance Votes
- Users may either delegate to a third Party, or self-delegate if they would like to participate in Voting directly

- The basic Unit of Governance is a Proposal, which represents a Package of executable Code to make specific Adjustments to the underlying Protocol
- To prevent Spamming, only Users whose Voting Power exceeds the Proposal Submission Threshold are able to submit Proposals

- An optional Proposal Delay Parameter allows Protocols to delay the Start of Voting for a specified Length of Time after a Proposal is submitted, giving Time for Users to update their Vote Delegation

- Voting takes Place over a predefined Voting Period determined by the underlying Protocol
- When the Voting Period ends, the System first checks if the Number of Votes for the Proposal exceed the Protocol's Quorum Threshold (The Percentage of required Votes of the total Tokens that must be cast to reach the Quorum)

- If the Quorum Threshold has been met and the Vote gains Majority Support, the passed Proposal is then placed into a Time-lock Queue which delays Code (Proposal) Execution
- This Time-lock is intended as a Security Measure, allowing Users to withdraw Funds if they think the Proposal is malicious or otherwise unacceptable
- If the Proposer's Voting Power drops below the Proposal Submission Threshold at any Time from Submission until the Voting or Time-lock Period ends, the Proposal can be cancelled
- Once the entire Process has finished, the Proposal can be executed and relevant Code or Parameter Changes are implemented in the Protocol

![governance-workflow](https://user-images.githubusercontent.com/29623199/157656041-2ad35235-c26e-45d9-93d9-33d43047ae90.png)

### OpenZeppelin Governor Modules

- There are Modules to make the Governance modular
- User can vote for, against or abstain a Proposal

#### Required Modules

- Votes: Where do the Users get their Voting Power from?
- Counting: What Opinions do Users have when Voting, and how are Votes counted?

#### Optional Modules

- TimeLock: Perform Operations (queued Proposal) through a TimeLock Contract (Time Lapse)
- Threshold: Limit some Operation (Proposal) to Users with enough Tokens

### Proposal

- A Proposal is a Sequence of Actions that the Governor Contract will perform if it passes
- Each Action consists of a Target Address, Calldata encoding a Function Call, and an Amount of Ether to include
- Additionally, a Proposal includes a human-readable Description
- A Proposal can be in the following specified Sate:
  - 0: Pending,
  - 1: Active,
  - 2: Canceled,
  - 3: Defeated,
  - 4: Succeeded,
  - 5: Queued,
  - 6: Expired,
  - 7: Executed

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

## DAO Usage

1. Run a Node and runs Deployment Scripts: `npm run node`
2. Create a Proposal: `npm run propose:local`
3. Vote for the created Proposal: `npm run vote:local`
4. Queue and execute a for-voted Proposal: `npm run queue-and-execute:local`

## DAO Questions

- Which Users are allowed to create Proposals?
- Do Users need to have a certain Number of Tokens to make Proposals?
- How long do Users have to respond to a voted Proposal before it is executed?
