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

    describe('Choose number', function () {
        it('Should fail because an invalid number param', async function () {
            [owner, addr1] = await ethers.getSigners();

            try{
                await lotUbiInstance.chooseNumber(-1);
            } catch (err) {
                expect(err).to.be.instanceOf(Error)
            }
        });

        it('Should select a number with valid amount', async function () {
            [owner, someUserAddress] = await ethers.getSigners();

            const transaction = await lotUbiInstance.connect(someUserAddress).chooseNumber(1, {value: baseAmount});

            expect(transaction)
              .to.emit(lotUbiInstance, "NumberChoose").withArgs(someUserAddress.address, 1);
            expect(await lotUbiInstance.balance())
              .to.equal(baseAmount);
        });

        it('Should select a number with invalid amount', async function () {
            [owner, someUserAddress] = await ethers.getSigners();

            await expect(
                lotUbiInstance.connect(someUserAddress).chooseNumber(1)
            ).to.be.revertedWith('You must pay 0.001 ether');

        });

        it('Should fail for number less than 0', async function () {
            [owner, someUserAddress] = await ethers.getSigners();

            await expect(
              lotUbiInstance.connect(someUserAddress).chooseNumber(0, {value: baseAmount})
            ).to.be.revertedWith('The number must be between 1 and 10');
        });

        it('Should fail for number greater than than 10', async function () {
            [owner, someUserAddress] = await ethers.getSigners();

            await expect(
              lotUbiInstance.connect(someUserAddress).chooseNumber(11, {value: baseAmount})
            ).to.be.revertedWith('The number must be between 1 and 10');
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

            await lotUbiInstance.connect(participant).chooseNumber(winnerNumber, {value: baseAmount});
            const closeBetTransaction = lotUbiInstance.connect(owner).closeBets();

            await expect(closeBetTransaction).to.be.revertedWith('There is no winning number');
        });

        it('Should be a winner that receives the treasury', async function () {
            [owner, participant] = await ethers.getSigners();

            await lotUbiInstance.setWinnerNumber(winnerNumber);
            await lotUbiInstance.connect(participant).chooseNumber(winnerNumber, {value: baseAmount});
            const treasuryAfterBet = await lotUbiInstance.balance();
            const balanceAfterBet = await ethers.provider.getBalance(participant.address);

            const closeBetTransaction = await lotUbiInstance.connect(owner).closeBets();

            const newParticipantBalance = await ethers.provider.getBalance(participant.address);

            expect(closeBetTransaction)
              .to.emit(lotUbiInstance, "Winner")
              .withArgs(participant.address, winnerNumber);
            expect(await lotUbiInstance.balance())
              .to.equal(ethers.constants.Zero);
            expect(newParticipantBalance)
              .to.equal(balanceAfterBet.add(treasuryAfterBet));
        });

        it('Should be no winner', async function () {
            [owner, participant] = await ethers.getSigners();

            await lotUbiInstance.setWinnerNumber(winnerNumber);
            await lotUbiInstance.connect(participant).chooseNumber(1, {value: baseAmount});
            const closeBetTransaction = await lotUbiInstance.connect(owner).closeBets();

            expect(closeBetTransaction)
              .to.emit(lotUbiInstance, "NoWinner").withArgs(winnerNumber);
        });

    })

});
