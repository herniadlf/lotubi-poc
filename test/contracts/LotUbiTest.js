const { expect } = require('chai');
const { ethers } = require('hardhat');


describe('LotUbi', function () {

    let lotUbiContract;
    let lotUbiInstance;
    const baseAmount = ethers.utils.parseEther('0.001');

    beforeEach(async function () {
        lotUbiContract = await ethers.getContractFactory('LotUbi');
        lotUbiInstance = await lotUbiContract.deploy();

        await lotUbiInstance.deployed();
    });

    describe('Deployment', function () {
        it('Should initialize empty without a game', async function () {
           expect(await lotUbiInstance.currentGameId()).to.equal(ethers.constants.Zero);
        });
    });

    describe('New Game', function() {
       it('Should create a new game with id 1', async function () {
           [owner] = await ethers.getSigners();
           const newGameTransaction = await lotUbiInstance.newGame();

           expect(await lotUbiInstance.currentGameId()).to.equal(ethers.constants.One);
           await expect(newGameTransaction)
               .to.emit(lotUbiInstance, 'NewGame')
               .withArgs(owner.address, 1);
       });

        it('Should fail if there is a current game not finished', async function () {
            [owner] = await ethers.getSigners();
            await lotUbiInstance.newGame();

            await expect(lotUbiInstance.newGame())
                .to.be.revertedWith('ERR_GAME_01');
        });
    });

    describe('Generate tickets', function() {
        it('Should fail if there is no current game open', async function () {
            await expect(lotUbiInstance.generateTickets(1))
                .to.be.revertedWith('ERR_TICKET_01');
        });

        it('Should fail if there is quantity=0', async function () {
            await lotUbiInstance.newGame();

            await expect(lotUbiInstance.generateTickets(0))
                .to.be.revertedWith('ERR_TICKET_02');
        });

        it('Should fail if there is no amount', async function () {
            await lotUbiInstance.newGame();

            await expect(lotUbiInstance.generateTickets(1))
                .to.be.revertedWith('ERR_TICKET_03');
        });

        it('Should fail if there is not enough amount for quantity=1', async function () {
            await lotUbiInstance.newGame();

            await expect(lotUbiInstance.generateTickets(1, {value: ethers.utils.parseEther('0.0001')}))
                .to.be.revertedWith('ERR_TICKET_03');
        });

        it('Should fail if there is not enough amount for quantity=2', async function () {
            await lotUbiInstance.newGame();

            await expect(lotUbiInstance.generateTickets(2, {value: baseAmount}))
                .to.be.revertedWith('ERR_TICKET_03');
        });

        it('Should create 1 ticket and update the treasury', async function () {
            await lotUbiInstance.newGame();
            const gameId = await lotUbiInstance.currentGameId();

            [owner, player] = await ethers.getSigners();
            const generateTickets = await lotUbiInstance.connect(player).generateTickets(1, {value: baseAmount});
            await expect(generateTickets)
                .to.emit(lotUbiInstance, 'TicketCreated')
                .withArgs(player.address, 1, baseAmount);
            expect(await lotUbiInstance.getGameTreasury(gameId))
                .to.equal(baseAmount);
        });

        it('Should create 2 tickets for the same player and update the treasury', async function () {
            await lotUbiInstance.newGame();
            const gameId = await lotUbiInstance.currentGameId();

            [owner, player] = await ethers.getSigners();
            const generateTickets = await lotUbiInstance.connect(player).generateTickets(2, {value: baseAmount * 2});
            await expect(generateTickets)
                .to.emit(lotUbiInstance, 'TicketCreated')
                .withArgs(player.address, 2, baseAmount * 2);
            expect(await lotUbiInstance.getGameTreasury(gameId))
                .to.equal(baseAmount * 2);
        });

        it('Should create 1 ticket for different players and update the treasury', async function () {
            await lotUbiInstance.newGame();
            const gameId = await lotUbiInstance.currentGameId();

            [owner, player1, player2] = await ethers.getSigners();
            const generatePlayer1Tickets = await lotUbiInstance.connect(player1).generateTickets(1, {value: baseAmount});
            await expect(generatePlayer1Tickets)
                .to.emit(lotUbiInstance, 'TicketCreated')
                .withArgs(player1.address, 1, baseAmount);
            const generatePlayer2Tickets = await lotUbiInstance.connect(player2).generateTickets(1, {value: baseAmount});
            await expect(generatePlayer2Tickets)
                .to.emit(lotUbiInstance, 'TicketCreated')
                .withArgs(player2.address, 1, baseAmount);
            expect(await lotUbiInstance.getGameTreasury(gameId))
                .to.equal(baseAmount*2);
        });

        it('Should create 1 ticket for player1 and 2 tickets for player 2', async function () {
            await lotUbiInstance.newGame();
            const gameId = await lotUbiInstance.currentGameId();

            [owner, player1, player2] = await ethers.getSigners();
            const generatePlayer1Tickets = await lotUbiInstance.connect(player1).generateTickets(1, {value: baseAmount});
            await expect(generatePlayer1Tickets)
                .to.emit(lotUbiInstance, 'TicketCreated')
                .withArgs(player1.address, 1, baseAmount);
            const generatePlayer2Tickets = await lotUbiInstance.connect(player2).generateTickets(2, {value: baseAmount*2});
            await expect(generatePlayer2Tickets)
                .to.emit(lotUbiInstance, 'TicketCreated')
                .withArgs(player2.address, 2, baseAmount*2);
            expect(await lotUbiInstance.getGameTreasury(gameId))
                .to.equal(baseAmount*3);
        });

    });

    // describe('New Ticket', function () {
    //     it('Should select a number with valid amount', async function () {
    //         [owner, participant] = await ethers.getSigners();
    //
    //         const transaction = await lotUbiInstance.connect(participant).newTicket({value: baseAmount});
    //
    //         await expect(transaction)
    //           .to.emit(lotUbiInstance, 'NewTicket')
    //           .withArgs(participant.address, 1, 1);
    //         expect(await lotUbiInstance.balance())
    //           .to.equal(baseAmount);
    //     });
    //
    //     it('Should allow two different players in the game', async function () {
    //         [owner, firstParticipant, secondParticipant] = await ethers.getSigners();
    //
    //         const firstParticipantTransaction = await lotUbiInstance
    //           .connect(firstParticipant)
    //           .newTicket({value: baseAmount});
    //         const secondParticipantTransaction = await lotUbiInstance
    //           .connect(secondParticipant)
    //           .newTicket({value: baseAmount});
    //
    //         await expect(firstParticipantTransaction)
    //           .to.emit(lotUbiInstance, 'TicketCreated')
    //           .withArgs(firstParticipant.address, 1, 1);
    //         await expect(secondParticipantTransaction)
    //           .to.emit(lotUbiInstance, 'TicketCreated')
    //           .withArgs(secondParticipant.address, 1, 2);
    //
    //         expect(await lotUbiInstance.balance())
    //           .to.equal(baseAmount * 2);
    //     });
    //
    //     it('Should allow two tickets creation for the same player', async function () {
    //         [owner, participant] = await ethers.getSigners();
    //
    //         const firstBetTransaction = await lotUbiInstance.connect(participant).newTicket({value: baseAmount});
    //         const secondBetTransaction = lotUbiInstance.connect(participant).newTicket({value: baseAmount});
    //
    //         await expect(firstBetTransaction)
    //           .to.emit(lotUbiInstance, 'TicketCreated')
    //           .withArgs(participant.address, 1, 1);
    //         await expect(secondBetTransaction)
    //             .to.emit(lotUbiInstance, 'TicketCreated')
    //             .withArgs(participant.address, 1, 2);
    //     });
    //
    //     it('Should fail because there is no amount in message', async function () {
    //         [owner, participant] = await ethers.getSigners();
    //
    //         await expect(
    //             lotUbiInstance.connect(participant).newTicket()
    //         ).to.be.revertedWith('ERR-PICK-01');
    //
    //     });
    //
    // });

    // describe('Bet has been placed', function () {
    //     it('Should return false because user has not placed a bet', async function () {
    //         [owner, participant] = await ethers.getSigners();
    //
    //         expect(await lotUbiInstance.connect(participant).hasPlacedABet()).to.equal(false);
    //     });
    //
    //     it('Should return true because user has placed a bet', async function () {
    //         [owner, participant] = await ethers.getSigners();
    //
    //         await lotUbiInstance.connect(participant).newTicket(1, {value: baseAmount});
    //         expect(await lotUbiInstance.connect(participant).hasPlacedABet()).to.equal(true);
    //     });
    //
    //     it('Should return false because the bet has been placed by another user', async function () {
    //         [owner, firstParticipant, secondParticipant] = await ethers.getSigners();
    //
    //         await lotUbiInstance.connect(firstParticipant).newTicket(1, {value: baseAmount});
    //         expect(await lotUbiInstance.connect(secondParticipant).hasPlacedABet()).to.equal(false);
    //     });
    // });
    //
    // describe('Close bets', function() {
    //     const winnerNumber = 5;
    //
    //     it('Should fails because there are no bets', async function () {
    //         await expect(
    //           lotUbiInstance.closeBets()
    //         ).to.be.revertedWith('ERR-CLOSEBET-001');
    //     });
    //
    //     it('Should fails because there are no winning number', async function () {
    //         [owner, participant] = await ethers.getSigners();
    //
    //         await lotUbiInstance.connect(participant).newTicket(winnerNumber, {value: baseAmount});
    //         const closeBetTransaction = lotUbiInstance.connect(owner).closeBets();
    //
    //         await expect(closeBetTransaction).to.be.revertedWith('ERR-CLOSEBET-002');
    //     });
    //
    //     it('One lucky participant should be the winner', async function () {
    //         [owner, firstParticipant] = await ethers.getSigners();
    //
    //         await lotUbiInstance.connect(firstParticipant).newTicket(winnerNumber, {value: baseAmount});
    //         const firstParticipantBalanceAfterBet = await ethers.provider.getBalance(firstParticipant.address);
    //
    //         const treasuryAfterBets = await lotUbiInstance.balance();
    //         await lotUbiInstance.setWinnerNumber(winnerNumber);
    //         const closeBetTransaction = await lotUbiInstance.connect(owner).closeBets();
    //
    //         const winnerNewBalance = await ethers.provider.getBalance(firstParticipant.address);
    //
    //         await expect(closeBetTransaction)
    //           .to.emit(lotUbiInstance, 'UserWon')
    //           .withArgs(firstParticipant.address, winnerNumber, treasuryAfterBets);
    //         expect(await lotUbiInstance.balance()).to.equal(ethers.constants.Zero);
    //         expect(winnerNewBalance).to.equal(firstParticipantBalanceAfterBet.add(treasuryAfterBets));
    //     });
    //
    //     it('Two participants, first should be the winner', async function () {
    //         [owner, firstParticipant, secondParticipant] = await ethers.getSigners();
    //
    //         const noWinnerNumber = 2;
    //
    //         await lotUbiInstance.connect(firstParticipant).newTicket(winnerNumber, {value: baseAmount});
    //         const firstParticipantBalanceAfterBet = await ethers.provider.getBalance(firstParticipant.address);
    //         await lotUbiInstance.connect(secondParticipant).newTicket(noWinnerNumber, {value: baseAmount});
    //         const secondParticipantBalanceAfterBet = await ethers.provider.getBalance(secondParticipant.address);
    //
    //         const treasuryAfterBets = await lotUbiInstance.balance();
    //         await lotUbiInstance.setWinnerNumber(winnerNumber);
    //         const closeBetTransaction = await lotUbiInstance.connect(owner).closeBets();
    //
    //         const winnerNewBalance = await ethers.provider.getBalance(firstParticipant.address);
    //         const looserNewBalance = await ethers.provider.getBalance(secondParticipant.address);
    //
    //         await expect(closeBetTransaction)
    //           .to.emit(lotUbiInstance, 'UserWon')
    //           .withArgs(firstParticipant.address, winnerNumber, treasuryAfterBets)
    //           .and.emit(lotUbiInstance, 'UserLost')
    //           .withArgs(secondParticipant.address, winnerNumber);
    //         expect(await lotUbiInstance.balance()).to.equal(ethers.constants.Zero);
    //         expect(winnerNewBalance).to.equal(firstParticipantBalanceAfterBet.add(treasuryAfterBets));
    //         expect(looserNewBalance).to.equal(secondParticipantBalanceAfterBet);
    //     });
    //
    //     it('Three participants, first two should be the winner and split the reward', async function () {
    //         [owner, firstParticipant, secondParticipant, thirdParticipant] = await ethers.getSigners();
    //
    //         const noWinnerNumber = 2;
    //
    //         await lotUbiInstance.connect(firstParticipant).newTicket(winnerNumber, {value: baseAmount});
    //         const firstParticipantBalanceAfterBet = await ethers.provider.getBalance(firstParticipant.address);
    //         await lotUbiInstance.connect(secondParticipant).newTicket(winnerNumber, {value: baseAmount});
    //         const secondParticipantBalanceAfterBet = await ethers.provider.getBalance(secondParticipant.address);
    //         await lotUbiInstance.connect(thirdParticipant).newTicket(noWinnerNumber, {value: baseAmount});
    //         const thirdParticipantBalanceAfterBet = await ethers.provider.getBalance(thirdParticipant.address);
    //
    //         const treasuryAfterBets = await lotUbiInstance.balance();
    //         await lotUbiInstance.setWinnerNumber(winnerNumber);
    //         const closeBetTransaction = await lotUbiInstance.connect(owner).closeBets();
    //
    //         const firstParticipantNewBalance = await ethers.provider.getBalance(firstParticipant.address);
    //         const secondParticipantNewBalance = await ethers.provider.getBalance(secondParticipant.address);
    //         const thirdParticipantNewBalance = await ethers.provider.getBalance(thirdParticipant.address);
    //
    //         const treasurySplit = treasuryAfterBets / 2;
    //
    //         await expect(closeBetTransaction)
    //           .to.emit(lotUbiInstance, 'UserWon')
    //           .withArgs(firstParticipant.address, winnerNumber, treasurySplit)
    //           .and.emit(lotUbiInstance, 'UserWon')
    //           .withArgs(secondParticipant.address, winnerNumber, treasurySplit)
    //           .and.emit(lotUbiInstance, 'UserLost')
    //           .withArgs(thirdParticipant.address, winnerNumber);
    //         expect(await lotUbiInstance.balance()).to.equal(ethers.constants.Zero);
    //         expect(firstParticipantNewBalance).to.equal(firstParticipantBalanceAfterBet.add(treasurySplit));
    //         expect(secondParticipantNewBalance).to.equal(secondParticipantBalanceAfterBet.add(treasurySplit));
    //         expect(thirdParticipantNewBalance).to.equal(thirdParticipantBalanceAfterBet);
    //     });
    //
    //     it('Should be no winner', async function () {
    //         [owner, firstParticipant, secondParticipant] = await ethers.getSigners();
    //
    //         await lotUbiInstance.connect(firstParticipant).newTicket(1, {value: baseAmount});
    //         await lotUbiInstance.connect(secondParticipant).newTicket(8, {value: baseAmount});
    //         await lotUbiInstance.setWinnerNumber(winnerNumber);
    //         const closeBetTransaction = await lotUbiInstance.connect(owner).closeBets();
    //
    //         await expect(closeBetTransaction)
    //           .to.emit(lotUbiInstance, 'UserLost')
    //           .withArgs(firstParticipant.address, winnerNumber)
    //           .and.emit(lotUbiInstance, 'UserLost')
    //           .withArgs(secondParticipant.address, winnerNumber);
    //     });
    //
    // })
    //
    // describe('Set winner number (must be removed for a seriuos lottery...)', function() {
    //
    //     it('Should fail because there are no bets', async function () {
    //         await expect(lotUbiInstance.setWinnerNumber(3)).to.be.revertedWith('ERR-WINNERNUMB-001');
    //     });
    //
    //     it('Should set a winner number because there are some bets presents', async function () {
    //         [owner, participant] = await ethers.getSigners();
    //
    //         await lotUbiInstance.connect(participant).newTicket(3, {value: baseAmount});
    //         await lotUbiInstance.setWinnerNumber(3);
    //
    //         await expect(lotUbiInstance.setWinnerNumber(3))
    //           .to.emit(lotUbiInstance, 'WinnerNumberSettled')
    //           .withArgs(3);
    //     });
    //
    // })

});
