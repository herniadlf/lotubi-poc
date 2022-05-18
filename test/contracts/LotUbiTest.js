const { expect } = require('chai');
const { ethers } = require('hardhat');


describe('LotUbi', function () {

    let lotUbiContract;
    let lotUbiInstance;
    const baseAmount = ethers.utils.parseEther("0.001");

    beforeEach(async function () {
        lotUbiContract = await ethers.getContractFactory("LotUbi");
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
              .to.emit(lotUbiInstance, "PickedNumber")
              .withArgs(participant.address, 1);
            expect(await lotUbiInstance.balance())
              .to.equal(baseAmount);
        });

        it('Should fail because the user has already placed a bet', async function () {
            [owner, participant] = await ethers.getSigners();

            const firstBetTransaction = await lotUbiInstance.connect(participant).pickANumber(2, {value: baseAmount});
            const secondBetTransaction = lotUbiInstance.connect(participant).pickANumber(5, {value: baseAmount});

            await expect(firstBetTransaction)
              .to.emit(lotUbiInstance, "PickedNumber")
              .withArgs(participant.address, 2);
            await expect(secondBetTransaction)
              .to.be.revertedWith('A bet has already been placed from this address')
        });

        it('Should select a number with invalid amount', async function () {
            [owner, participant] = await ethers.getSigners();

            await expect(
                lotUbiInstance.connect(participant).pickANumber(1)
            ).to.be.revertedWith('You must pay 0.001 ether');

        });

        it('Should fail for number less than 0', async function () {
            [owner, participant] = await ethers.getSigners();

            await expect(
              lotUbiInstance.connect(participant).pickANumber(0, {value: baseAmount})
            ).to.be.revertedWith('The number must be between 1 and 10');
        });

        it('Should fail for number greater than than 10', async function () {
            [owner, participant] = await ethers.getSigners();

            await expect(
              lotUbiInstance.connect(participant).pickANumber(11, {value: baseAmount})
            ).to.be.revertedWith('The number must be between 1 and 10');
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
    });

    describe('Close bets', function() {
        const winnerNumber = 5;

        it('Should fails because there are no bets', async function () {
            await expect(
              lotUbiInstance.closeBets()
            ).to.be.revertedWith('There are no bets yet');
        });

        it('Should fails because there are no winning number', async function () {
            [owner, participant] = await ethers.getSigners();

            await lotUbiInstance.connect(participant).pickANumber(winnerNumber, {value: baseAmount});
            const closeBetTransaction = lotUbiInstance.connect(owner).closeBets();

            await expect(closeBetTransaction).to.be.revertedWith('There is no winning number');
        });

        it('Should be a winner that receives the treasury', async function () {
            [owner, participant] = await ethers.getSigners();

            await lotUbiInstance.setWinnerNumber(winnerNumber);
            await lotUbiInstance.connect(participant).pickANumber(winnerNumber, {value: baseAmount});
            const treasuryAfterBet = await lotUbiInstance.balance();
            const balanceAfterBet = await ethers.provider.getBalance(participant.address);

            const closeBetTransaction = await lotUbiInstance.connect(owner).closeBets();

            const newParticipantBalance = await ethers.provider.getBalance(participant.address);

            await expect(closeBetTransaction)
              .to.emit(lotUbiInstance, "UserWon")
              .withArgs(participant.address, winnerNumber);
            expect(await lotUbiInstance.balance())
              .to.equal(ethers.constants.Zero);
            expect(newParticipantBalance)
              .to.equal(balanceAfterBet.add(treasuryAfterBet));
        });

        it('Should be no winner', async function () {
            [owner, participant] = await ethers.getSigners();

            await lotUbiInstance.setWinnerNumber(winnerNumber);
            await lotUbiInstance.connect(participant).pickANumber(1, {value: baseAmount});
            const closeBetTransaction = await lotUbiInstance.connect(owner).closeBets();

            await expect(closeBetTransaction)
              .to.emit(lotUbiInstance, "UserLost")
              .withArgs(winnerNumber);
        });

    })

});
