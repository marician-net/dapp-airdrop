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

    /**  whiteListed : Le tableau d'adresses que vous souhaitez inclure dans l'arbre Merkle.
      ["address"] : C'est un tableau qui indique le type de données contenues dans chaque élément de la liste. 
      Ici, cela spécifie que chaque élément est une adresse Ethereum.
      {sortLeaves: true} : Cette option indique que les feuilles (les hachages des adresses) doivent être triées avant de créer l'arbre Merkle. 
      Cela permet d'avoir un arbre Merkle standardisé, ce qui est important pour que les preuves de Merkle soient cohérentes.*/
    
    merkleTree = StandardMerkleTree.of(whiteListed, ["address"], {sortLeaves: true}); 

    /** ethers.getContractFactory est une méthode fournie par ethers.js. 
    Elle est utilisée pour créer une instance d'une "factory" pour un contrat intelligent. 
    Une "factory" est un objet qui est utilisé pour déployer de nouveaux contrats intelligents sur la blockchain.*/

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

    it('should NOT mint tokens if tokens already minted', async function () {
      const {contract, merkleTree, owner, addr1, addr2} = await loadFixture(deployContractFixture);
      const proof = merkleTree.getProof([addr1.address]);
      await contract.connect(addr1).mint(addr1.address, proof);
      await expect(contract.connect(addr1).mint(addr1.address,proof)).to.be.rejectedWith('Tokens already minted');
    }) 

    it('should mint tokens if user is whitelisted and has not mintes yet', async function () {
      const {contract, merkleTree, owner, addr1, addr2} = await loadFixture(deployContractFixture);
      const proof = merkleTree.getProof([addr1.address]);
      await contract.connect(addr1).mint(addr1.address, proof);

      let balance = await contract.balanceOf(addr1.address);
      let expectedBalance = ethers.parseEther('2');

      assert(balance === expectedBalance);
    })    

  });

  // Set Merkle root
  describe('setMerkleRoot', function() {
    it('should NOT set the merkle root if the caller is NOT the owner', async function () {
      const {contract, merkleTree, owner, addr1, addr2} = await loadFixture(deployContractFixture);     
      await expect(contract.connect(addr1).setMerkleRoot(merkleTree.root)).to.be.revertedWithCustomError(
        contract,
        "OwnableUnauthorizedAccount"
      ).withArgs(
        addr1.address
      );
    })

    it('should set the merkle root if the caller is the owner', async function () {
      const {contract, merkleTree, owner, addr1, addr2} = await loadFixture(deployContractFixture);
      let newMerkleRoot = "0xed316a3591e8b4d42cb27e2ddf685f361c0abedabfd7bbf7b1451949d309b218";
      await contract.setMerkleRoot(newMerkleRoot);
      let contractMerkleRoot = await contract.merkleRoot();
      assert(newMerkleRoot === contractMerkleRoot);   
    })

  });


});