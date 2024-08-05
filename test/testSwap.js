const { expect } = require("chai");
const { ethers } = require("hardhat");
const { addressConfig } = require("../utils/addressconfig");
const axios = require("axios");
const qs = require("qs");

describe("SwapWith1inch Contract", function () {
  let deployer, testUser, swapContractInstance, swapContractAddress;
  let wethContract, usdcContract;
  const usdcAmount = ethers.parseUnits("300", 6);
  const impersonatedAddress = "0x264bd8291fae1d75db2c5f573b07faa6715997b5";

  before(async function () {
    [deployer] = await ethers.getSigners();

    // Deploy the SwapWith1inch contract
    const SwapContractFactory = await ethers.getContractFactory(
      "SwapWith1inch"
    );
    swapContractInstance = await SwapContractFactory.deploy();
    swapContractAddress = swapContractInstance.target;
    // Impersonate a user with the specified address for testing
    testUser = await ethers.getImpersonatedSigner(impersonatedAddress);

    // Get contract instances for WETH and USDC
    wethContract = await ethers.getContractAt(
      "IERC20",
      addressConfig[1].WethAddress,
      testUser
    );
    usdcContract = await ethers.getContractAt(
      "IERC20",
      addressConfig[1].UsdcAddress,
      testUser
    );
  });

  it("should swap user funds using smart contract", async function () {
    // Approve the swap contract to spend USDC on behalf of the test user
    const approveUSDC = await usdcContract
      .connect(testUser)
      .approve(swapContractAddress, usdcAmount);
    await approveUSDC.wait();

    // Check the test user's WETH balance before the swap
    const initialWethBalance = await wethContract
      .connect(testUser)
      .balanceOf(testUser.address);
    console.log("Initial WETH Balance:", initialWethBalance.toString());

    // Set the parameters for the swap
    const swapParams = {
      sellToken: addressConfig[1].UsdcAddress,
      buyToken: addressConfig[1].WethAddress,
      sellAmount: usdcAmount,
    };

    // Get the API key from environment variables
    const apiKey = process.env.Ex_API;

    // Call the 0x API to get a quote for the swap
    const response = await axios.get(
      `https://api.0x.org/swap/v1/quote?${qs.stringify(swapParams)}`,
      { headers: { "0x-api-key": apiKey } }
    );

    // Execute the swap using the quote from 0x API
    await swapContractInstance
      .connect(testUser)
      .fillQuote(
        addressConfig[1].UsdcAddress,
        addressConfig[1].WethAddress,
        response.data.to,
        response.data.allowanceTarget,
        response.data.data,
        response.data.sellAmount
      );

    // Check the test user's WETH balance after the swap
    const finalWethBalance = await wethContract
      .connect(testUser)
      .balanceOf(testUser.address);
    console.log("Final WETH Balance:", finalWethBalance.toString());
    expect(finalWethBalance).to.be.gt(initialWethBalance);
  });
  it("should fail if the allowance is not set", async function () {
    const insufficientAllowanceAmount = ethers.parseUnits("1", 6); // Lower than required

    const swapParams = {
      sellToken: addressConfig[1].UsdcAddress,
      buyToken: addressConfig[1].WethAddress,
      sellAmount: usdcAmount,
    };

    const apiKey = process.env.Ex_API;

    const response = await axios.get(
      `https://api.0x.org/swap/v1/quote?${qs.stringify(swapParams)}`,
      { headers: { "0x-api-key": apiKey } }
    );

    await usdcContract
      .connect(testUser)
      .approve(swapContractAddress, insufficientAllowanceAmount);

    await expect(
      swapContractInstance
        .connect(testUser)
        .fillQuote(
          addressConfig[1].UsdcAddress,
          addressConfig[1].WethAddress,
          response.data.to,
          response.data.allowanceTarget,
          response.data.data,
          response.data.sellAmount
        )
    ).to.be.revertedWith("insufficient allowance");
  });
});
