
const SolnSquareVerifier = artifacts.require('SolnSquareVerifier')
const Verifier = artifacts.require('Verifier')
const {
    BN,           // Big Number support
    constants,    // Common constants, like the zero address and largest integers
    expectEvent,  // Assertions for emitted events
    expectRevert, // Assertions for transactions that should fail
} = require('@openzeppelin/test-helpers');
const { proof, inputs } = require('../../zokrates/code/square/proof')


contract('SolnSquareVerifier Tests', async (accounts) => {

    const account_one = accounts[0];
    const account_two = accounts[1];

    describe('SolnSquareVerifier', function () {

        beforeEach(async function () {
            let verifier = await Verifier.new({ from: account_one });
            this.contract = await SolnSquareVerifier.new(verifier.address, { from: account_one });
        })

        // Test if a new solution can be added for contract - SolnSquareVerifier
        it("can add a new sollution to the SolnSquareVerifier", async function () {

            let result = await this.contract.addSolution(9001, accounts[9]);

            await expectEvent(result, "SolutionAdded", {
                index: "9001",
                addr: accounts[9]
            });
        })

        // Test if an ERC721 token can be minted for contract - SolnSquareVerifier
        it("can mint an ERC721 token for SolnSquareVerifier", async function () {
            await expectRevert(
                this.contract.mintNFTAfterVerification(1, accounts[9], proof, inputs, { from: account_two }),
                "Caller should be the owner of this contract"
            );

            let result = await (await this.contract.mintNFTAfterVerification(1, accounts[9], proof, inputs, {from: account_one}));
            await expectEvent(result, "Transfer", {
                from: "0x0000000000000000000000000000000000000000",
                to: accounts[9],
                tokenId: "1"
            });
            

        })
    })
})