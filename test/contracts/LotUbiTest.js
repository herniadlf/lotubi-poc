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

});
