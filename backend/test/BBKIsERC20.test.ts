import {   
    loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";  
import { expect, assert } from "chai";
import { ethers} from "hardhat";
  
// Types
import { BBKIsERC20 } from "../typechain-types";  
import type { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { StandardMerkleTree } from "@openzeppelin/merkle-tree";

// whitelisted addresses
import { whiteListed } from "../utils/whiteListed";

describe("BBKIsERC20 Tests", function() {
  let contract: BBKIsERC20;

  let owner: SignerWithAddress;
  let addr1: SignerWithAddress;
  let addr2: SignerWithAddress;

  let merkleTree: StandardMerkleTree<string[]>

  async function deployContractFixture() {
    const [owner, addr1, addr2] = await ethers.getSigners();

    merkleTree = StandardMerkleTree.of(whiteListed, ["address"], {sortLeaves: true});

    const contractFactory = await ethers.getContractFactory("BBKIsERC20");
    const contract = await contractFactory.deploy(owner.address, merkleTree.root);

    return { contract, merkleTree, owner, addr1, addr2};
  }

  //deployment 
  describe('Deployment', function() {
    it("Should deploy the smart contract", async function() {
        const {contract, merkleTree, owner, addr1, addr2} = await loadFixture(deployContractFixture);
        let contractMerkleTreeRoot = await contract.merkleRoot();
        assert(contractMerkleTreeRoot === merkleTree.root);
        let contractOwner = await contract.owner();
        assert(contractOwner === owner.address);
      }
    )
  });

  // mint
  describe("Mint", function () {
    it('should NOT mint NOT whitelisted | @openzeppelin/merkle-tree library Test',
      async function () {
        const {contract, merkleTree, owner, addr1, addr2} = await loadFixture(deployContractFixture);
        try{
          const proof = merkleTree.getProof([addr2.address]);
          expect.fail("Expected an error 'Error: Leaf not in tree but none was thrown.");
        }catch(error){
          const err = error as Error;
          expect(err.message).to.include('Leaf is not in tree');
        }      
      }      
    )

    it('should NOT mint NOT whitelisted | contract Test', async function () {
      const {contract, merkleTree, owner, addr1, addr2} = await loadFixture(deployContractFixture);
      const proof: string[] = [];
      await expect(contract.connect(addr2).mint(addr2.address, proof)).to.be.revertedWith('Not whitelisted');
      
    })
  });



});