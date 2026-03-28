import { ethers } from "hardhat";
import { getDeployment, formatAddress } from "./utils";

/**
 * E2E demo script for Black Pools.
 * Demonstrates:
 * - Market creation
 * - Supply (with encrypted shares)
 * - Collateral supply
 * - Borrow (with collateral check)
 * - Repay
 * - Interest accrual
 *
 * TODO: Integrate with cofhejs for real FHE encryption/decryption.
 */
async function main() {
  console.log("🎬 Black Pools E2E Demo\n");

  const [deployer, user1] = await ethers.getSigners();
  console.log(`Deployer: ${formatAddress(deployer.address)}`);
  console.log(`User1:    ${formatAddress(user1.address)}\n`);

  // Load deployment addresses
  const network = (await ethers.provider.getNetwork()).name;
  const deployment = getDeployment(network);
  if (!deployment) {
    throw new Error(`No deployment found for network ${network}`);
  }

  // Get contract instances
  const TestERC20 = await ethers.getContractFactory("TestERC20");
  const usdc = TestERC20.attach(deployment.testUSDC);
  const weth = TestERC20.attach(deployment.testWETH);

  const BlackPools = await ethers.getContractFactory("BlackPools");
  const blackPools = BlackPools.attach(deployment.blackPools);

  console.log("📝 Step 1: Mint test tokens to user1");
  await usdc.mint(user1.address, ethers.parseUnits("1000", 6));
  await weth.mint(user1.address, ethers.parseUnits("100", 18));
  console.log(`✓ Minted 1000 USDC and 100 WETH to ${formatAddress(user1.address)}\n`);

  console.log("📝 Step 2: Create a lending market");
  const marketParams = {
    loanToken: deployment.testUSDC,
    collateralToken: deployment.testWETH,
    oracle: deployment.testOracle,
    lltv: 8000, // 80% LLTV
  };

  const tx1 = await blackPools.createMarket(marketParams);
  await tx1.wait();

  const marketId = ethers.keccak256(
    ethers.AbiCoder.defaultAbiCoder().encode(
      ["address", "address", "address", "uint128"],
      [marketParams.loanToken, marketParams.collateralToken, marketParams.oracle, marketParams.lltv]
    )
  );

  console.log(`✓ Market created with ID: ${formatAddress(marketId)}`);
  console.log(`  - Loan token:      ${formatAddress(deployment.testUSDC)}`);
  console.log(`  - Collateral token: ${formatAddress(deployment.testWETH)}`);
  console.log(`  - LLTV:             8000 bp (80%)\n`);

  console.log("📝 Step 3: User1 supplies collateral");
  // TODO: Implement with FHE encryption
  console.log(`⚠️  TODO: Integrate cofhejs for FHE encryption\n`);

  console.log("📝 Step 4: User1 supplies loan tokens");
  // TODO: Implement with FHE encryption
  console.log(`⚠️  TODO: Integrate cofhejs for FHE encryption\n`);

  console.log("📝 Step 5: User1 borrows against collateral");
  // TODO: Implement with FHE encryption and collateral check
  console.log(`⚠️  TODO: Implement collateral check with FHE.gte and FHE.select\n`);

  console.log("📝 Step 6: Accrue interest");
  // TODO: Implement with FHE encryption
  console.log(`⚠️  TODO: Integrate cofhejs for FHE encryption\n`);

  console.log("📝 Step 7: User1 repays debt");
  // TODO: Implement with FHE encryption
  console.log(`⚠️  TODO: Integrate cofhejs for FHE encryption\n`);

  console.log("✅ Demo complete!");
  console.log("\nNext steps:");
  console.log("1. Integrate cofhejs SDK for FHE encryption/decryption");
  console.log("2. Implement collateral sufficiency check with FHE operations");
  console.log("3. Add interest rate calculation");
  console.log("4. Test liquidation flow");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
