// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/proxy/transparent/ProxyAdmin.sol";

/* `UserStoryTreasuryProxy` is owned and governed by DAO - it allwo to upgrade the Logic of `UserStoryTreasury` */
contract UserStoryTreasuryProxy is ProxyAdmin {
    constructor(address) ProxyAdmin() {}
}
