import { Wallet, utils } from "zksync-web3";
import * as ethers from "ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { Deployer } from "@matterlabs/hardhat-zksync-deploy";

// load env file
import dotenv from "dotenv";
dotenv.config();

// load wallet private key from env file
const PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY || "";

if (!PRIVATE_KEY) throw "⛔️ Private key not detected! Add it to the .env file!";

// An example of a deploy script that will deploy and call a simple contract.
export default async function (hre: HardhatRuntimeEnvironment) {
  console.log(`Running deploy script for the Paymaster contract`);

  // Initialize the wallet.
  const wallet = new Wallet(PRIVATE_KEY);

  // Create deployer object and load the artifact of the contract you want to deploy.
  const deployer = new Deployer(hre, wallet);
  const paymasterArtifact = await deployer.loadArtifact("PermissionPaymaster");
  const paymaster = await deployer.deploy(paymasterArtifact, ['0xeED5c5CDf2e9Ade31E95FE6a3EfCa74b75300deA']);

  // Show the contract info.
  const contractAddress = paymaster.address;
  console.log(`${paymaster.contractName} was deployed to ${contractAddress}`);

  // verify contract for testnet & mainnet
  if (process.env.NODE_ENV != "test") {
    // Contract MUST be fully qualified name (e.g. path/sourceName:contractName)
    const contractFullyQualifedName = "contracts/PermissionPaymaster.sol:PermissionPaymaster";

    // Verify contract programmatically
    const verificationId = await hre.run("verify:verify", {
      address: contractAddress,
      contract: contractFullyQualifedName,
      constructorArguments: ['0xeED5c5CDf2e9Ade31E95FE6a3EfCa74b75300deA'],
      bytecode: paymasterArtifact.bytecode,
    });
  } else {
    console.log(`Contract not verified, deployed locally.`);
  }
}
