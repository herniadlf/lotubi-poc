//SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.10;

contract LotUbi {
    uint256 public userChoice;
    address public userAddress;

    event NumberChoose(address numberOwner, uint256 number);

    constructor() payable {

    }

    function deposit() public payable {

    }

    function chooseNumber(uint256 number) payable external {
        require(msg.value == 0.001 ether, 'You must pay 0.001 ether');
        userChoice = number;
        userAddress = msg.sender;
        deposit();

        emit NumberChoose(msg.sender, number);
    }

    function balance() external view returns (uint256) {
        return address(this).balance;
    }
}
