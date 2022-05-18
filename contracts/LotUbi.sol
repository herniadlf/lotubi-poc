//SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.12;

contract LotUbi {
    uint256 private userPickedNumber;
    uint256 public winnerNumber;
    address payable private userAddress;
    mapping (address => uint256) private usersBets;

    event PickedNumber(address numberOwner, uint256 number);
    event UserWon(address numberOwner, uint256 number);
    event UserLost(uint256 number);

    function deposit() public payable {

    }

    function pickANumber(uint256 pickedNumber) payable external {
        require(msg.value == 0.001 ether, '[ERR-PICK-01] You must pay 0.001 ether');
        require(0 < pickedNumber, '[ERR-PICK-02] The number must be between 1 and 10');
        require(pickedNumber <= 10, '[ERR-PICK-02] The number must be between 1 and 10');
        require(usersBets[msg.sender] == 0, '[ERR-PICK-03] A bet has already been placed from this address');

        userPickedNumber = pickedNumber;
        address payable userAddressPayable = payable(msg.sender);
        userAddress = userAddressPayable;
        usersBets[userAddressPayable] = pickedNumber;
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

    function hasPlacedABet() external view returns (bool) {
        return usersBets[msg.sender] > 0;
    }

    // TODO: This will be retrieved from an oracle.
    function setWinnerNumber(uint256 number) external {
        winnerNumber = number;
    }
}
