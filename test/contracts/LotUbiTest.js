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
        it('Should initialize empty', async function () {
           expect(await lotUbiInstance.balance()).to.equal(ethers.constants.Zero);
        });
    });

    describe('Pick a number', function () {
        it('Should fail because an invalid number param', async function () {
            [owner, addr1] = await ethers.getSigners();

            try{
                await lotUbiInstance.pickANumber(-1);
            } catch (err) {
                expect(err).to.be.instanceOf(Error)
            }
        });

        it('Should select a number with valid amount', async function () {
            [owner, participant] = await ethers.getSigners();

            const transaction = await lotUbiInstance.connect(participant).pickANumber(1, {value: baseAmount});

            await expect(transaction)
              .to.emit(lotUbiInstance, 'PickedNumber')
              .withArgs(participant.address, 1);
            expect(await lotUbiInstance.balance())
              .to.equal(baseAmount);
        });

        it('Should allow two different participants to pick the same number', async function () {
            [owner, firstParticipant, secondParticipant] = await ethers.getSigners();

            const numberToPick = 5;
            const firstParticipantTransaction = await lotUbiInstance
              .connect(firstParticipant)
              .pickANumber(numberToPick, {value: baseAmount});
            const secondParticipantTransaction = await lotUbiInstance
              .connect(secondParticipant)
              .pickANumber(numberToPick, {value: baseAmount});

            await expect(firstParticipantTransaction)
              .to.emit(lotUbiInstance, 'PickedNumber')
              .withArgs(firstParticipant.address, numberToPick);
            await expect(secondParticipantTransaction)
              .to.emit(lotUbiInstance, 'PickedNumber')
              .withArgs(secondParticipant.address, numberToPick);

            expect(await lotUbiInstance.balance())
              .to.equal(baseAmount * 2);
        });

        it('Should allow two different participants to pick the different numbers', async function () {
            [owner, firstParticipant, secondParticipant] = await ethers.getSigners();

            const firstParticipantNumber = 5;
            const secondParticipantNumber = 9;

            const firstParticipantTransaction = await lotUbiInstance
              .connect(firstParticipant)
              .pickANumber(firstParticipantNumber, {value: baseAmount});
            const secondParticipantTransaction = await lotUbiInstance
              .connect(secondParticipant)
              .pickANumber(secondParticipantNumber, {value: baseAmount});

            await expect(firstParticipantTransaction)
              .to.emit(lotUbiInstance, 'PickedNumber')
              .withArgs(firstParticipant.address, firstParticipantNumber);
            await expect(secondParticipantTransaction)
              .to.emit(lotUbiInstance, 'PickedNumber')
              .withArgs(secondParticipant.address, secondParticipantNumber);

            expect(await lotUbiInstance.balance())
              .to.equal(baseAmount * 2);
        });

        it('Should fail because the user has already placed a bet', async function () {
            [owner, participant] = await ethers.getSigners();

            const firstBetTransaction = await lotUbiInstance.connect(participant).pickANumber(2, {value: baseAmount});
            const secondBetTransaction = lotUbiInstance.connect(participant).pickANumber(5, {value: baseAmount});

            await expect(firstBetTransaction)
              .to.emit(lotUbiInstance, 'PickedNumber')
              .withArgs(participant.address, 2);
            await expect(secondBetTransaction)
              .to.be.revertedWith('ERR-PICK-03')
        });

        it('Should select a number with invalid amount', async function () {
            [owner, participant] = await ethers.getSigners();

            await expect(
                lotUbiInstance.connect(participant).pickANumber(1)
            ).to.be.revertedWith('ERR-PICK-01');

        });

        it('Should fail for number less than 0', async function () {
            [owner, participant] = await ethers.getSigners();

            await expect(
              lotUbiInstance.connect(participant).pickANumber(0, {value: baseAmount})
            ).to.be.revertedWith('ERR-PICK-02');
        });

        it('Should fail for number greater than than 10', async function () {
            [owner, participant] = await ethers.getSigners();

            await expect(
              lotUbiInstance.connect(participant).pickANumber(11, {value: baseAmount})
            ).to.be.revertedWith('ERR-PICK-02');
        });
    });

    describe('Bet has been placed', function () {
        it('Should return false because user has not placed a bet', async function () {
            [owner, participant] = await ethers.getSigners();

            expect(await lotUbiInstance.connect(participant).hasPlacedABet()).to.equal(false);
        });

        it('Should return true because user has placed a bet', async function () {
            [owner, participant] = await ethers.getSigners();

            await lotUbiInstance.connect(participant).pickANumber(1, {value: baseAmount});
            expect(await lotUbiInstance.connect(participant).hasPlacedABet()).to.equal(true);
        });

        it('Should return false because the bet has been placed by another user', async function () {
            [owner, firstParticipant, secondParticipant] = await ethers.getSigners();

            await lotUbiInstance.connect(firstParticipant).pickANumber(1, {value: baseAmount});
            expect(await lotUbiInstance.connect(secondParticipant).hasPlacedABet()).to.equal(false);
        });
    });

    describe('Close bets', function() {
        const winnerNumber = 5;

        it('Should fails because there are no bets', async function () {
            await expect(
              lotUbiInstance.closeBets()
            ).to.be.revertedWith('ERR-CLOSEBET-001');
        });

        it('Should fails because there are no winning number', async function () {
            [owner, participant] = await ethers.getSigners();

            await lotUbiInstance.connect(participant).pickANumber(winnerNumber, {value: baseAmount});
            const closeBetTransaction = lotUbiInstance.connect(owner).closeBets();

            await expect(closeBetTransaction).to.be.revertedWith('ERR-CLOSEBET-002');
        });

        it('One lucky participant should be the winner', async function () {
            [owner, firstParticipant] = await ethers.getSigners();

            await lotUbiInstance.connect(firstParticipant).pickANumber(winnerNumber, {value: baseAmount});
            const firstParticipantBalanceAfterBet = await ethers.provider.getBalance(firstParticipant.address);

            const treasuryAfterBets = await lotUbiInstance.balance();
            await lotUbiInstance.setWinnerNumber(winnerNumber);
            const closeBetTransaction = await lotUbiInstance.connect(owner).closeBets();

            const winnerNewBalance = await ethers.provider.getBalance(firstParticipant.address);

            await expect(closeBetTransaction)
              .to.emit(lotUbiInstance, 'UserWon')
              .withArgs(firstParticipant.address, winnerNumber, treasuryAfterBets);
            expect(await lotUbiInstance.balance()).to.equal(ethers.constants.Zero);
            expect(winnerNewBalance).to.equal(firstParticipantBalanceAfterBet.add(treasuryAfterBets));
        });

        it('Two participants, first should be the winner', async function () {
            [owner, firstParticipant, secondParticipant] = await ethers.getSigners();

            const noWinnerNumber = 2;

            await lotUbiInstance.connect(firstParticipant).pickANumber(winnerNumber, {value: baseAmount});
            const firstParticipantBalanceAfterBet = await ethers.provider.getBalance(firstParticipant.address);
            await lotUbiInstance.connect(secondParticipant).pickANumber(noWinnerNumber, {value: baseAmount});
            const secondParticipantBalanceAfterBet = await ethers.provider.getBalance(secondParticipant.address);

            const treasuryAfterBets = await lotUbiInstance.balance();
            await lotUbiInstance.setWinnerNumber(winnerNumber);
            const closeBetTransaction = await lotUbiInstance.connect(owner).closeBets();

            const winnerNewBalance = await ethers.provider.getBalance(firstParticipant.address);
            const looserNewBalance = await ethers.provider.getBalance(secondParticipant.address);

            await expect(closeBetTransaction)
              .to.emit(lotUbiInstance, 'UserWon')
              .withArgs(firstParticipant.address, winnerNumber, treasuryAfterBets)
              .and.emit(lotUbiInstance, 'UserLost')
              .withArgs(secondParticipant.address, winnerNumber);
            expect(await lotUbiInstance.balance()).to.equal(ethers.constants.Zero);
            expect(winnerNewBalance).to.equal(firstParticipantBalanceAfterBet.add(treasuryAfterBets));
            expect(looserNewBalance).to.equal(secondParticipantBalanceAfterBet);
        });

        it('Three participants, first two should be the winner and split the reward', async function () {
            [owner, firstParticipant, secondParticipant, thirdParticipant] = await ethers.getSigners();

            const noWinnerNumber = 2;

            await lotUbiInstance.connect(firstParticipant).pickANumber(winnerNumber, {value: baseAmount});
            const firstParticipantBalanceAfterBet = await ethers.provider.getBalance(firstParticipant.address);
            await lotUbiInstance.connect(secondParticipant).pickANumber(winnerNumber, {value: baseAmount});
            const secondParticipantBalanceAfterBet = await ethers.provider.getBalance(secondParticipant.address);
            await lotUbiInstance.connect(thirdParticipant).pickANumber(noWinnerNumber, {value: baseAmount});
            const thirdParticipantBalanceAfterBet = await ethers.provider.getBalance(thirdParticipant.address);

            const treasuryAfterBets = await lotUbiInstance.balance();
            await lotUbiInstance.setWinnerNumber(winnerNumber);
            const closeBetTransaction = await lotUbiInstance.connect(owner).closeBets();

            const firstParticipantNewBalance = await ethers.provider.getBalance(firstParticipant.address);
            const secondParticipantNewBalance = await ethers.provider.getBalance(secondParticipant.address);
            const thirdParticipantNewBalance = await ethers.provider.getBalance(thirdParticipant.address);

            const treasurySplit = treasuryAfterBets / 2;

            await expect(closeBetTransaction)
              .to.emit(lotUbiInstance, 'UserWon')
              .withArgs(firstParticipant.address, winnerNumber, treasurySplit)
              .and.emit(lotUbiInstance, 'UserWon')
              .withArgs(secondParticipant.address, winnerNumber, treasurySplit)
              .and.emit(lotUbiInstance, 'UserLost')
              .withArgs(thirdParticipant.address, winnerNumber);
            expect(await lotUbiInstance.balance()).to.equal(ethers.constants.Zero);
            expect(firstParticipantNewBalance).to.equal(firstParticipantBalanceAfterBet.add(treasurySplit));
            expect(secondParticipantNewBalance).to.equal(secondParticipantBalanceAfterBet.add(treasurySplit));
            expect(thirdParticipantNewBalance).to.equal(thirdParticipantBalanceAfterBet);
        });

        it('Should be no winner', async function () {
            [owner, firstParticipant, secondParticipant] = await ethers.getSigners();

            await lotUbiInstance.connect(firstParticipant).pickANumber(1, {value: baseAmount});
            await lotUbiInstance.connect(secondParticipant).pickANumber(8, {value: baseAmount});
            await lotUbiInstance.setWinnerNumber(winnerNumber);
            const closeBetTransaction = await lotUbiInstance.connect(owner).closeBets();

            await expect(closeBetTransaction)
              .to.emit(lotUbiInstance, 'UserLost')
              .withArgs(firstParticipant.address, winnerNumber)
              .and.emit(lotUbiInstance, 'UserLost')
              .withArgs(secondParticipant.address, winnerNumber);
        });

    })

    describe('Set winner number (must be removed for a seriuos lottery...)', function() {

        it('Should fail because there are no bets', async function () {
            await expect(lotUbiInstance.setWinnerNumber(3)).to.be.revertedWith('ERR-WINNERNUMB-001');
        });

        it('Should set a winner number because there are some bets presents', async function () {
            [owner, participant] = await ethers.getSigners();

            await lotUbiInstance.connect(participant).pickANumber(3, {value: baseAmount});
            await lotUbiInstance.setWinnerNumber(3);

            await expect(lotUbiInstance.setWinnerNumber(3))
              .to.emit(lotUbiInstance, 'WinnerNumberSettled')
              .withArgs(3);
        });

    })

});
