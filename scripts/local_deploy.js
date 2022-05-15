async function main() {
    const factory = await ethers.getContractFactory('LotUbi');
    const lotUbiInstance = await factory.deploy();
    await lotUbiInstance.deployed();

    console.log('LotUbi Contract address ' + lotUbiInstance.address);

    saveFrontendFiles(lotUbiInstance);
}

function saveFrontendFiles(lotUbiInstance) {
    const fileSystem = require('fs');
    const contractDirectory = __dirname + '/../ui/src/contracts';

    if (!fileSystem.existsSync(contractDirectory)) {
        fileSystem.mkdirSync(contractDirectory);
    }

    fileSystem.writeFileSync(
        contractDirectory + '/contract-address.json',
        JSON.stringify({LotUbi: lotUbiInstance.address}, undefined, 2)
    );

    const lotUbiArtifact = artifacts.readArtifactSync("LotUbi");

    fileSystem.writeFileSync(
        contractDirectory + '/LotUbi.json',
        JSON.stringify(lotUbiArtifact, null, 2)
    );
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    })
