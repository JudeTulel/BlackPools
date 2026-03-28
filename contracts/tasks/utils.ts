import * as fs from "fs";
import * as path from "path";
import { ethers } from "hardhat";

export interface DeploymentAddresses {
  testUSDC: string;
  testWETH: string;
  testOracle: string;
  mockPool: string;
  blackPools: string;
  taskManager: string;
}

const DEPLOYMENTS_DIR = path.join(__dirname, "../deployments");

/**
 * Save deployment addresses to file.
 * @param networkName Network name (e.g., "arbitrumSepolia", "localhost").
 * @param addresses Deployment addresses.
 */
export function saveDeployment(networkName: string, addresses: DeploymentAddresses): void {
  if (!fs.existsSync(DEPLOYMENTS_DIR)) {
    fs.mkdirSync(DEPLOYMENTS_DIR, { recursive: true });
  }

  const filePath = path.join(DEPLOYMENTS_DIR, `${networkName}.json`);
  fs.writeFileSync(filePath, JSON.stringify(addresses, null, 2));
  console.log(`✓ Deployment addresses saved to ${filePath}`);
}

/**
 * Load deployment addresses from file.
 * @param networkName Network name.
 * @return Deployment addresses.
 */
export function getDeployment(networkName: string): DeploymentAddresses | null {
  const filePath = path.join(DEPLOYMENTS_DIR, `${networkName}.json`);
  if (!fs.existsSync(filePath)) {
    return null;
  }

  const data = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(data);
}

/**
 * Log deployment summary.
 * @param addresses Deployment addresses.
 */
export function logDeploymentSummary(addresses: DeploymentAddresses): void {
  console.log("\n=== Deployment Summary ===");
  console.log(`Test USDC:   ${addresses.testUSDC}`);
  console.log(`Test WETH:   ${addresses.testWETH}`);
  console.log(`Test Oracle: ${addresses.testOracle}`);
  console.log(`MockPool:    ${addresses.mockPool}`);
  console.log(`BlackPools:  ${addresses.blackPools}`);
  console.log(`BlackPoolsTaskManager: ${addresses.taskManager}`);
  console.log("========================\n");
}

/**
 * Format address for display.
 * @param address Address to format.
 * @return Formatted address (first 6 + last 4 chars).
 */
export function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

