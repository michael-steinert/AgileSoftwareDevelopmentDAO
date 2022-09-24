// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

/*
ERC20 Extension that allows to take Snapshots
It has a Tally of how many Users hold how many Tokens on different Blocks - this prevents Flash Loans
*/
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";

/*
The ERC20Votes is an Token Extension that keeps track of Votes and Vote Delegation, therefore it provides Voting Capabilities
`ERC20Votes` allows to take Snapshot of Tokens that Users have at a Checkpoint (certain Block)
`ERC20Votes` will keep Track of historical Balances so that Voting Power is retrieved from past Snapshots rather than current Balance, which is an important Protection that prevents Double Voting
Snapshots prevent before that someone knows a popular Proposal is coming up, so they just buy lot Tokens, and then they dum it after the Proposal
*/
contract GovernanceToken is ERC20Votes {
    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply
    ) ERC20(name, symbol) ERC20Permit(name) {
        _mint(msg.sender, initialSupply);
    }

    // Issue new Governance Token for User to vote
    function issueToken(address to, uint256 amount) public {
        _mint(to, amount);
    }

    // Update Balances to know how many Votes the Users have depending on the Checkpoint (certain Block)
    function _afterTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override(ERC20Votes) {
        // `_afterTokenTransfer` of `ERC20Votes`
        super._afterTokenTransfer(from, to, amount);
    }

    function _mint(address to, uint256 amount) internal override(ERC20Votes) {
        // `_afterTokenTransfer` of `ERC20Votes`
        super._mint(to, amount);
    }

    function _burn(address account, uint256 amount)
        internal
        override(ERC20Votes)
    {
        super._burn(account, amount);
    }
}
