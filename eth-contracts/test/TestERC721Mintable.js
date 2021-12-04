var RealEstatePropertyToken = artifacts.require('RealEstatePropertyToken');
const {
    BN,           // Big Number support
    constants,    // Common constants, like the zero address and largest integers
    expectEvent,  // Assertions for emitted events
    expectRevert, // Assertions for transactions that should fail
} = require('@openzeppelin/test-helpers');

contract('TestERC721Mintable', async (accounts) => {

    const account_one = accounts[0];
    const account_two = accounts[1];

    describe('match erc721 spec', function () {
        beforeEach(async function () {
            this.contract = await RealEstatePropertyToken.new({ from: account_one });

            // TODO: mint multiple tokens. Mint 5 tokens each for 5 accounts
            for (let i = 5; i < 10; i++) {
                for (let j = 0; j < 5; j++) {
                    let tokenId = i * 1000 + j;
                    await this.contract.mint(accounts[i], tokenId);
                }
            }
        })

        it('should return total supply', async function () {
            let totalSupply = await this.contract.totalSupply();
            assert.equal(totalSupply, 25, `Total of 25 tokens should have been minted. Actual minted: ` + totalSupply);
        })

        it('should get token balance', async function () {
            for (let i = 5; i < 10; i++) {
                let tokenBalance = await this.contract.balanceOf(accounts[i]);
                assert.equal(tokenBalance, 5, `the balance is:${tokenBalance} instead of 5`);
            }
        })

        // token uri should be complete i.e: https://s3-us-west-2.amazonaws.com/udacity-blockchain/capstone/1
        it('should return token uri', async function () {
            let uri = await this.contract.tokenURI(9001);
            let URI = "https://s3-us-west-2.amazonaws.com/udacity-blockchain/capstone/";
            assert.equal(uri, URI + "9001", `token URI should be ${URI + 9001}`);
        })

        it('should transfer token from one owner to another', async function () {
            let result = await this.contract.transferFrom(accounts[9], account_two, 9001, {from: accounts[9]});
            
            await expectEvent(result, "Transfer", {
                from: accounts[9],
                to: account_two,
                tokenId: "9001"
            });
            
            let newOwner = await this.contract.ownerOf(9001);
            assert.equal(newOwner, account_two, `Owner should be ${account_two}`);
        })
    });

    describe('have ownership properties', function () {
        beforeEach(async function () {
            this.contract = await RealEstatePropertyToken.new({ from: account_two });
        })

        it('should fail when minting when address is not contract owner', async function () {
            await expectRevert(
                this.contract.mint(accounts[3], 42, { from: account_one }),
                "Caller should be the owner of this contract"
            );
        })

        it('should return contract owner', async function () {
            let owner = await this.contract.getOwner();
            assert.equal(owner, account_two, "Contract owner should be " + account_two);
        })

    });
})