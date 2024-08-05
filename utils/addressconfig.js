const { ethers } = require("hardhat");

const addressConfig = {
  //Mainnet
  1: {
    WethAddress: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    chainlinkFeed: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
    forwarder: "0x84a0856b038eaAd1cC7E297cF34A7e72685A8693",
    fee: ethers.parseEther("0.0001"),
    UsdcAddress: "0x6c3ea9036406852006290770BEdFcAbA0e23A0e8",
    LinkAddress: "0x514910771AF9Ca656af840dff83E8264EcF986CA",
    WbtcAddress: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
  },
};
module.exports = { addressConfig };
