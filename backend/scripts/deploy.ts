import { ethers} from "hardhat";

// Types
import { BBKIsERC20 } from "../typechain-types";  
import type { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { StandardMerkleTree } from "@openzeppelin/merkle-tree";

// whitelisted addresses
import { whiteListed } from "../utils/whiteListed";

async function main() {
    let contract: BBKIsERC20;
    let merkleTree: StandardMerkleTree<string[]>

    merkleTree = StandardMerkleTree.of(whiteListed, ["address"], {sortLeaves: true}); 

    // utilise la destructuration pour extraire le premier élément de la liste retournée par ethers.getSigners().
    const [owner] = await ethers.getSigners();

    contract = await ethers.deployContract("BBKIsERC20",[owner.address, merkleTree.root]);

    await contract.waitForDeployment();

    console.log(`BBKIsERC20 deployed to ${contract.target} with merkleRoot ${merkleTree.root}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
})