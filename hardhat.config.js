require("dotenv").config();
require("hardhat-deploy");
require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-ethers");

const ankr_api = process.env.Ankr_API;

const MAINNET_RPC_URL = `https://rpc.ankr.com/eth/${ankr_api}`;

module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      forking: {
        url: MAINNET_RPC_URL,
      },
      allowUnlimitedContractSize: true,
    },
    localhost: {
      chainId: 31337,
    },
    eth: {
      url: MAINNET_RPC_URL,
      chainId: 1,
      blockConfirmations: 6,
    },
  },
  solidity: {
    compilers: [
      {
        version: "0.8.20",
        settings: {
          optimizer: {
            enabled: true,
            runs: 1000,
          },
        },
      },
    ],
  },
  etherscan: {
    apiKey: {
      polygon: "M72KYXSB62ZTFGD58APVIJ76VEYQ9H97VY",
    },
    customChains: [],
  },
  gasReporter: {
    enabled: true,
    currency: "USD",
    // outputFile: "gas-report.txt",
    // noColors: true,
    coinmarketcap: "c96f5ab9-4629-4ec0-b6dd-68275f6bd483",
  },
  namedAccounts: {
    deployer: {
      default: 0, // here this will by default take the first account as deployer
      1: 0, // similarly on mainnet it will take the first account as deployer. Note though that depending on how hardhat network are configured, the account 0 on one network can be different than on another
    },
  },
  mocha: {
    timeout: 1000000000,
  },
};
