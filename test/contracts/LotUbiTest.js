const { expect } = require('chai');


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

        it('Should set selected number', async function () {
            [owner, someUserAddress] = await ethers.getSigners();

            await lotUbiInstance.connect(someUserAddress).chooseNumber(1);
            expect(await lotUbiInstance.userChoice()).to.equal(1);
            expect(await lotUbiInstance.userAddress()).to.equal(someUserAddress.address);
        });
    });

});
