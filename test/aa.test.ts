import { expect } from 'chai';
import { Wallet, Provider, Contract, utils} from 'zksync-web3';
import * as hre from 'hardhat';
import { Deployer } from '@matterlabs/hardhat-zksync-deploy';
import { ethers, BytesLike } from 'ethers';
import { getGeneralPaymasterInput } from 'zksync-web3/build/src/paymaster-utils';
import { GeneralPaymasterInput } from 'zksync-web3/build/src/types';
import dotenv from "dotenv";
dotenv.config();

const RICH_WALLET_PK =
  '0x7726827caac94a7f9e1b160f7ea819f172f7b6f9d2a97f992c38edeab82d4110';
const PLATFORM_PRIVATE_KEY = process.env.PLATFORM_PRIVATE_KEY || "";
if (!PLATFORM_PRIVATE_KEY) throw "⛔️ Private key not detected! Add it to the .env file!";

async function deployGreeter(deployer: Deployer): Promise<Contract> {
  const artifact = await deployer.loadArtifact('Greeter');
  return await deployer.deploy(artifact, ['Hi']);
}

type Address = string;

interface PaymasterInput {
  paymasterInput: BytesLike;
}

type PaymasterParams = {
  paymaster: Address;
  paymasterInput: BytesLike;
};


describe('deploy', function () {
  let aaFactoryaddress: string;
  let paymasteraddress: string;
  let factory: Contract;
  it ('Should be deployed without an error | AAFactory', async function () {
    const provider = Provider.getDefaultProvider();
    // Initialize the wallet.
    const wallet = new Wallet(RICH_WALLET_PK, provider);
    // Create deployer object and load the artifact of the contract you want to deploy.
    const deployer = new Deployer(hre, wallet);
    const factoryArtifact = await deployer.loadArtifact("AAFactory");
    const aaArtifact = await deployer.loadArtifact("Account");
    factory = await deployer.deploy(factoryArtifact, [utils.hashBytecode(aaArtifact.bytecode)], undefined, [aaArtifact.bytecode]);
  
    // Show the contract info.
    const aaFactoryaddress = factory.address;
    console.log(`${factoryArtifact.contractName} was deployed to ${aaFactoryaddress}`);
  
  
  })
  it ('Should be deployed without an error | Paymaster', async function () {
    const provider = Provider.getDefaultProvider();
    // Initialize the wallet.
    const wallet = new Wallet(RICH_WALLET_PK, provider);

    // Create deployer object and load the artifact of the contract you want to deploy.
    const deployer = new Deployer(hre, wallet);
    const paymasterArtifact = await deployer.loadArtifact("PermissionPaymaster");
    const paymaster = await deployer.deploy(paymasterArtifact, ['0xeED5c5CDf2e9Ade31E95FE6a3EfCa74b75300deA']);
    // Create a transaction object
    let tx = {
        to: paymaster.address,
        // Convert currency unit from ether to wei
        value: ethers.utils.parseEther("1.0")
    }
    // Send a transaction
    wallet.sendTransaction(tx)
    .then((txObj) => {
      console.log('txHash', txObj.hash)
      // => 0x9c172314a693b94853b49dc057cf1cb8e529f29ce0272f451eea8f5741aa9b58
      // A transaction result can be checked in a etherscan with a transaction hash which can be obtained here.
    })
    // Show the contract info.
    paymasteraddress = paymaster.address;
    console.log(`${paymaster.contractName} was deployed to ${paymasteraddress}`);

  
  })
  it("Should be deployed without an error | Account", async function () {
    const provider = Provider.getDefaultProvider();
    const wallet = new Wallet(RICH_WALLET_PK, provider);
    const deployer = new Deployer(hre, wallet);

    const platformWallet = new Wallet(PLATFORM_PRIVATE_KEY, provider);
    const owner = await wallet.getAddress();
    const message = ethers.utils.arrayify(ethers.utils.id(owner));
    const sig = await platformWallet.signMessage(message);
    const input: GeneralPaymasterInput = {
      type: 'General',
      innerInput: ethers.utils.hexConcat([sig, message]),
    }

    const paymasterParams = getGeneralPaymasterInput(input);
    const factoryArtifact = await deployer.loadArtifact("AAFactory");
    const aaArtifact = await deployer.loadArtifact("Account");
    const salt = ethers.utils.formatBytes32String("example@google.com");
    
    await (
        await factory.deployAccount(salt, owner, {
            // paymaster info
            customData: {
                paymasterParams: paymasterParams,
                gasPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
            },
            }
        )
    ).wait();
    const abiCoder = new ethers.utils.AbiCoder();
    const accountAddress = utils.create2Address(
        aaFactoryaddress,
        await factory.aaBytecodeHash(),
        salt,
        abiCoder.encode(["address"], [owner])
    );
    console.log(`Account deployed on address ${accountAddress}`);
    
  });
});
