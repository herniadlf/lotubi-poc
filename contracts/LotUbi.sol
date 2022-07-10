//SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.12;

contract LotUbi {
    uint256 private userPickedNumber;
    uint256 public winnerNumber;
    address payable private userAddress;
    mapping (address => uint256) private usersBets;
    address payable[] private userAddresses;

    event NewGame(address creator, uint gameId);
    event TicketCreated(address participant, uint256 number);
    event WinnerNumberSettled(uint256 winnerNumber);
    event UserWon(address participant, uint256 number, uint256 earnedMoney);
    event UserLost(address participant, uint256 number);

    enum GameStatus{
        accepting,
        generating,
        finished
    }

    struct Game{
        uint id;
        GameStatus status;
    }

    struct Ticket{
        uint id;
        address owner;
    }

    Game[] public games;
    mapping(uint => Game) private idToGames;
    uint public currentGameId;

    function newGame() public{
        uint gameId = games.length + 1;
        Game memory game = Game(gameId, GameStatus.accepting);
        games.push(game);
        currentGameId = gameId;

        emit NewGame(msg.sender, gameId);
    }

    function deposit() public payable {

    }

//    function newTicket() payable external {
//        require(msg.value == 0.001 ether, '[ERR-PICK-01] You must pay 0.001 ether');
//
//        uint ticketId = tickets[]
//        Ticket storage ticket = Ticket()
//        address payable userAddressPayable = payable(msg.sender);
//        userAddress = userAddressPayable;
//        usersBets[userAddressPayable] = pickedNumber;
//        userAddresses.push(userAddressPayable);
//        deposit();
//
//        emit TicketCreated(msg.sender, pickedNumber);
//    }

    function balance() external view returns (uint256) {
        return address(this).balance;
    }

    function closeBets() external {
        require(userAddresses.length > 0, '[ERR-CLOSEBET-001] There are no bets yet');
        require(winnerNumber > 0, '[ERR-CLOSEBET-002] There is no winning number');

        address payable[] memory winners = new address payable[](userAddresses.length);
        uint256 winnersSize = 0;
        for (uint i = 0; i < userAddresses.length; i++) {
            address payable userAddressPayable = userAddresses[i];
            if (usersBets[userAddressPayable] == winnerNumber) {
                winners[winnersSize] = userAddressPayable;
                winnersSize++;
            } else {
                emit UserLost(userAddressPayable, winnerNumber);
            }
        }

        if (winnersSize > 0) {
            uint256 earnByWinner = address(this).balance / winnersSize;
            for (uint i = 0; i < winnersSize; i++) {
                address payable userAddressPayable = winners[i];
                userAddressPayable.transfer(earnByWinner);
                emit UserWon(userAddressPayable, winnerNumber, earnByWinner);
            }
        }
    }

    function hasPlacedABet() external view returns (bool) {
        return usersBets[msg.sender] > 0;
    }

    // TODO: This will be retrieved from an oracle and must be retrieved directlye on closeBets.
    function setWinnerNumber(uint256 number) external {
        require(userAddresses.length > 0, '[ERR-WINNERNUMB-001] There are no bets yet');
        winnerNumber = number;
        emit WinnerNumberSettled(number);
    }
}
