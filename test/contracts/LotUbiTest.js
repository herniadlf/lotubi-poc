const { expect } = require('chai');
const { ethers } = require('hardhat');


describe('LotUbi', function () {

    let lotUbiContract;
    let lotUbiInstance;

    beforeEach(async function () {
        lotUbiContract = await ethers.getContractFactory("LotUbi");
        lotUbiInstance = await lotUbiContract.deploy();

        await lotUbiInstance.deployed();
    });

    describe('Deployment', function () {
        it('Should initialize empty', async function () {
           expect(await lotUbiInstance.userChoice()).to.equal(ethers.constants.Zero);
           expect(await lotUbiInstance.userAddress()).to.equal(ethers.constants.AddressZero);
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

            const amount = ethers.utils.parseEther("0.001");
            const transaction = await lotUbiInstance.connect(someUserAddress).chooseNumber(1, {value: amount});

            await expect(transaction)
                .to.emit(lotUbiInstance, "NumberChoose").withArgs(someUserAddress.address, 1);
            expect(await lotUbiInstance.userChoice()).to.equal(1);
            expect(await lotUbiInstance.userAddress()).to.equal(someUserAddress.address);
            expect(await lotUbiInstance.balance()).to.equal(amount);
        });

        it('Should select a number with invvalid amount', async function () {
            [owner, someUserAddress] = await ethers.getSigners();

            await expect(
                lotUbiInstance.connect(someUserAddress).chooseNumber(1)
            ).to.be.revertedWith('You must pay 0.001 ether');

        });
    });

});
