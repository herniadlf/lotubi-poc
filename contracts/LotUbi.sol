//SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.7.0;

contract LotUbi {
    uint256 public userChoice;
    address public userAddress;

    constructor() {

    }

    function chooseNumber(uint256 number) external {
        userChoice = number;
        userAddress = msg.sender;
    }
}
