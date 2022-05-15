//SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.12;

contract LotUbi {
    uint256 private userPickedNumber;
    uint256 public winnerNumber;
    address payable private userAddress;

    event PickedNumber(address numberOwner, uint256 number);
    event UserWon(address numberOwner, uint256 number);
    event UserLost(uint256 number);

    function deposit() public payable {

    }

    function pickANumber(uint256 pickedNumber) payable external {
        require(msg.value == 0.001 ether, 'You must pay 0.001 ether');
        require(0 < pickedNumber, 'The number must be between 1 and 10');
        require(pickedNumber <= 10, 'The number must be between 1 and 10');
        userPickedNumber = pickedNumber;
        userAddress = payable(msg.sender);
        deposit();

        emit PickedNumber(msg.sender, pickedNumber);
    }

    function balance() external view returns (uint256) {
        return address(this).balance;
    }

    function closeBets() external {
        require(userPickedNumber > 0, 'There are no bets yet');
        require(winnerNumber > 0, 'There is no winning number');

        if (userPickedNumber == winnerNumber) {
            userAddress.transfer(address(this).balance);
            emit UserWon(userAddress, winnerNumber);
        } else {
            emit UserLost(winnerNumber);
        }
    }

    // TODO: This will be retrieved from an oracle.
    function setWinnerNumber(uint256 number) external {
        winnerNumber = number;
    }
}
