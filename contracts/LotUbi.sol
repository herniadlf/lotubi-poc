//SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.12;

contract LotUbi {
    uint256 private userChoice;
    uint256 public winnerNumber;
    address payable private userAddress;

    event NumberChoose(address numberOwner, uint256 number);
    event Winner(address numberOwner, uint256 number);
    event NoWinner(uint256 number);

    function deposit() public payable {

    }

    function chooseNumber(uint256 number) payable external {
        require(msg.value == 0.001 ether, 'You must pay 0.001 ether');
        require(0 < number, 'The number must be between 1 and 10');
        require(number <= 10, 'The number must be between 1 and 10');
        userChoice = number;
        userAddress = payable(msg.sender);
        deposit();

        emit NumberChoose(msg.sender, number);
    }

    function balance() external view returns (uint256) {
        return address(this).balance;
    }

    function closeBets() external {
        require(userChoice > 0, 'There are no bets yet');
        require(winnerNumber > 0, 'There is no winning number');

        if (userChoice == winnerNumber) {
            userAddress.transfer(address(this).balance);
            emit Winner(userAddress, winnerNumber);
        } else {
            emit NoWinner(winnerNumber);
        }
    }

    // TODO: This will be retrieved from an oracle.
    function setWinnerNumber(uint256 number) external {
        winnerNumber = number;
    }
}
