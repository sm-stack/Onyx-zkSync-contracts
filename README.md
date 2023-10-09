# Onyx-zkSync-contracts

This is a collection of contracts used in Seamless, project for [Digital Identity Hackathon](https://www.encode.club/digital-identity-hackathon).

## Deployed Contract Address

|Name | Address | Explanation |
|-----|---------|-------------|
|AAFactory.sol|[0x0ee2ec442E758f55218911f654CfB57f4616aeFA](https://goerli.explorer.zksync.io/address/0x0ee2ec442E758f55218911f654CfB57f4616aeFA#contract)| Factory contract to deploy accounts at Seamless |
|PermissionPaymaster.sol|[0xf0d55f874c85522F20CB873C888fD22B33188b57](https://goerli.explorer.zksync.io/address/0xf0d55f874c85522F20CB873C888fD22B33188b57#contract)| Paymaster Contract that only allows transactions from Seamless frontend, by verifying platform signature |
|SeamlessNFT.sol|[0x65b7dC3bbAf38342d1ee2e1c3b89fD446Dd1f8AE](https://goerli.explorer.zksync.io/address/0x65b7dC3bbAf38342d1ee2e1c3b89fD446Dd1f8AE#contract)| Welcome NFT used in Seamless |
|DIDRegistry.sol|[0xffaA8fA7af33D2CB66D8b78c7680eDab24DF670c](https://goerli.explorer.zksync.io/address/0xffaA8fA7af33D2CB66D8b78c7680eDab24DF670c#contract)| Place to save user DID created at Seamless |

## Project Explanation

[PermissionPaymaster.sol](./contracts/PermissionPaymaster.sol) is a contract that restricts access to prevent external entities to use it. It leverages paymasterInput at `Transaction` structure, which contains platform signature and messageHash. The verification process is done through below process:
    1. Platform wallet sign for the `from` address of transaction. 
    2. Platform compose a paymaster input, which includes signature and corresponding messageHash.   
    3. `PermissionPaymaster` gets `Transaction` struct and decodes `paymasterInput` to extract platform sig and messageHash. 
    4. Paymaster verifies platform signature, and checks the validity of signature and message.

Also there are contracts for account deployment and account itself, example NFT used in the platform, and a DID registry to register user DID for verification.

## Project structure

- `/contracts`: smart contracts.
- `/deploy`: deployment and contract interaction scripts.
- `/test`: test files
- `hardhat.config.ts`: configuration file.

## Commands

- `yarn hardhat compile` will compile the contracts.
- `yarn run deploy` will execute the deployment script `/deploy/deploy-greeter.ts`. Requires [environment variable setup](#environment-variables).
- `yarn test` run tests. You need to configure local test node. **Check test requirements below.**

`yarn run deploy` is configured in the `package.json` file and run `yarn hardhat deploy-zksync`.

### Environment variables

In order to prevent users to leak private keys, this project includes the `dotenv` package which is used to load environment variables. It's used to load the wallet private key, required to run the deploy script.

To use it, rename `.env.example` to `.env` and enter your private key.

```
WALLET_PRIVATE_KEY=123cde574ccff....
```

### Local testing

In order to run test, you need to start the zkSync local environment. Please check [this section of the docs](https://v2-docs.zksync.io/api/hardhat/testing.html#prerequisites) which contains all the details.

If you do not start the zkSync local environment, the tests will fail with error `Error: could not detect network (event="noNetwork", code=NETWORK_ERROR, version=providers/5.7.2)`

## Relevant Links

- [Seamless Website]()
- [zkSync Website](https://zksync.io/)
- [zkSync Documentation](https://v2-docs.zksync.io/dev/)
- [zkSync GitHub](https://github.com/matter-labs)

