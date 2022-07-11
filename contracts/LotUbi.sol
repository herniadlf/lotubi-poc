//SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.9;
//
contract LotUbi {
    event NewGame(address creator, uint gameId);

    event TicketCreated(address player, uint quantity, uint amount);

    enum LotteryStatus{
        open,
        drawing,
        closed
    }

    struct Ticket {
        uint id;
        address owner;
    }

    struct Game{
        uint id;
        uint winner;
        uint treasury;
    }

    address payable[] private userAddresses;
    Game[] public games;

    LotteryStatus public lotteryStatus;
    uint public currentGameId;
    mapping(uint => Ticket) private idToTicket;
    Ticket[] private tickets;

//    Luego ver como usar depositos por "donaciones" para que se reparta en la loteria
//    function deposit() public payable {
//
//    }

    function newGame() public {
        require(games.length == 0 || lotteryStatus == LotteryStatus.closed, "[ERR_GAME_01] Invalid lottery status for game creation");
        uint gameId = games.length + 1;
        games.push(Game(gameId, 0, 0));
        currentGameId = gameId;

        emit NewGame(msg.sender, gameId);
    }

    function generateTickets(uint quantity) public payable {
        require(currentGameId > 0 && lotteryStatus == LotteryStatus.open, "[ERR_TICKET_01] Cannot ask for tickets with status=open");
        require(quantity > 0, '[ERR_TICKET_02] Quantity must be greater than 0');
        require(msg.value == 0.001 ether * quantity, '[ERR_TICKET_03] You must pay 0.001 ether for each ticket');

        Game storage game = games[currentGameId - 1];
        for (uint i=0; i < quantity; i++) {
            uint ticketId = tickets.length + 1;
            Ticket memory ticket = Ticket(ticketId, msg.sender);
            tickets.push(ticket);
            idToTicket[ticketId] = ticket;
        }

        game.treasury = game.treasury + msg.value;
        emit TicketCreated(msg.sender, quantity, msg.value);
    }

    function getGameTreasury(uint gameId) public view returns(uint) {
        return games[gameId-1].treasury;
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

//    function balance() external view returns (uint256) {
//        return address(this).balance;
//    }
//
//    function closeBets() external {
//        require(userAddresses.length > 0, '[ERR-CLOSEBET-001] There are no bets yet');
//        require(winnerNumber > 0, '[ERR-CLOSEBET-002] There is no winning number');
//
//        address payable[] memory winners = new address payable[](userAddresses.length);
//        uint256 winnersSize = 0;
//        for (uint i = 0; i < userAddresses.length; i++) {
//            address payable userAddressPayable = userAddresses[i];
//            if (usersBets[userAddressPayable] == winnerNumber) {
//                winners[winnersSize] = userAddressPayable;
//                winnersSize++;
//            } else {
//                emit UserLost(userAddressPayable, winnerNumber);
//            }
//        }
//
//        if (winnersSize > 0) {
//            uint256 earnByWinner = address(this).balance / winnersSize;
//            for (uint i = 0; i < winnersSize; i++) {
//                address payable userAddressPayable = winners[i];
//                userAddressPayable.transfer(earnByWinner);
//                emit UserWon(userAddressPayable, winnerNumber, earnByWinner);
//            }
//        }
//    }
//
//    function hasPlacedABet() external view returns (bool) {
//        return usersBets[msg.sender] > 0;
//    }
//
//    // TODO: This will be retrieved from an oracle and must be retrieved directlye on closeBets.
//    function setWinnerNumber(uint256 number) external {
//        require(userAddresses.length > 0, '[ERR-WINNERNUMB-001] There are no bets yet');
//        winnerNumber = number;
//        emit WinnerNumberSettled(number);
//    }
}
