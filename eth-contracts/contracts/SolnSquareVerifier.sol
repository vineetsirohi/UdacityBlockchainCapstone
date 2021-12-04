pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

// TODO define a contract call to the zokrates generated solidity contract <Verifier> or <renamedVerifier>
import "./verifier.sol";
import "./ERC721Mintable.sol";

// TODO define another contract named SolnSquareVerifier that inherits from your ERC721Mintable class
contract SolnSquareVerifier is RealEstatePropertyToken {
    Verifier verifier;

    // TODO define a solutions struct that can hold an index & an address
    struct Solution {
        uint256 index;
        address addr;
    }

    
    // TODO define an array of the above struct
    Solution[] solutions;

    // TODO define a mapping to store unique solutions submitted
    mapping(bytes32 => address) uniqueSols;

    // TODO Create an event to emit when a solution is added
    event SolutionAdded(uint256 index, address addr);

    constructor(address verifierAddr) public {
        verifier = Verifier(verifierAddr);
    }

    // TODO Create a function to add the solutions to the array and emit the event
    function addSolution(uint256 index, address addr1) external {
        solutions.push(Solution(index, addr1));
        emit SolutionAdded(index, addr1);
    }

    // TODO Create a function to mint new NFT only after the solution has been verified
    //  - make sure the solution is unique (has not been used before)
    //  - make sure you handle metadata as well as tokenSuplly
    function verfirySolutionAndMintNFT(address to, Verifier.Proof calldata proof, uint256[2] calldata input) external returns(bool){
        require(verifier.verifyTx(proof, input), "Solution is not verified");

        bytes32 key = keccak256(abi.encodePacked(proof.a.X, proof.a.Y, proof.b.X, proof.b.Y, proof.c.X, proof.c.Y, input));
        require(uniqueSols[key] == address(0), "Solution already used");

        uniqueSols[key] = to;
        this.addSolution(solutions.length, to);
        return this.mint(to, solutions.length);
    }
}
