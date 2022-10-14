# Tally

- Tally is a full-fledged Application for user-owned on-chain Governance
- It comprises a Voting Dashboard, Proposal Creation Wizard, Real Time Research and Analysis, and Educational Content
- It also allows Users to create Proposals, visualize Voting Power and Advocates, navigate Proposals, and cast Votes

# Decentralized Autonomous Organization (DAO)

- DAOs are Organizations that aim to limit centralized Points of Authority or Control
- They are communally governed through democratic Processes, facilitated through Smart Contracts that lay out a clear and specific Set of Rules for the Organization
- They offer a transparent and decentralized Way to crowd-source Decisions
- A DAO is a collective Entity owned and operated by its Community Members
- Funds are stored in their in the Treasury of the DAO and are governed by Smart Contracts, which means DAOs do not rely on Intermediate to store their Funds
- There is no central Authority within the Organization
- Decisions are executed via Proposals and Voting, this ensures Fairness and Equality amongst its Owners (Community Members)
- DAOs allow everyone to have a Voice within the Proposal and Voting

- DAOs are a new Form of Organization that

  - distributes Decision-Making Power
  - shares Ownership amongst Participants
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

## Description of the Scrum DAO

- `UserStoryTreasury` is owned by the `TimeLock`, therefore its `onlyOwner` Methods can be only called by the `TimeLock`
- This ensures self-governed Automation, and dao-controlled Execution of successful Proposals
- `DaoGovernor` is given Proposer Rights, while the Executor is given to anyone
- The Sprint Backlog is governed and upgraded by Token Holders, using three distinct Smart Contracts; the `GovernanceToken`, `DaoGovernor`, and `TimeLock`
- Together, these Smart Contracts allow the Community to propose, vote, and execute User Stories through the administrative Functions of a `GovernanceToken`
- Token Holders can delegate their Voting Rights to themselves, or an Address of their Choice
- Proposals can create User Stories into the Backlog and be planned into the next Sprint

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

## DAO Usage

1. Run a Node and runs Deployment Scripts: `npm run node`
2. Create a Proposal: `npm run propose:local`
3. Vote for the created Proposal: `npm run vote:local`
4. Queue and execute a for-voted Proposal: `npm run queue-and-execute:local`

## DAO Questions

- Which Users are allowed to create Proposals?
- Do Users need to have a certain Number of Tokens to make Proposals?
- How long do Users have to respond to a voted Proposal before it is executed?
