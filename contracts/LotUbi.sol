//SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.10;

contract LotUbi {
    uint256 public userChoice;
    address public userAddress;

    constructor() payable {

    }

    function deposit() public payable {

    }

    function chooseNumber(uint256 number) payable external {
        require(msg.value > 0, 'You must pay something');
        userChoice = number;
        userAddress = msg.sender;
        deposit();
    }

    function balance() external view returns (uint256) {
        return address(this).balance;
    }
}
