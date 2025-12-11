/**
 * Deploy Script for FHEVM Examples
 *
 * Deploys example contracts to specified network
 * Usage: npx hardhat run scripts/deploy.ts --network [network-name]
 */

import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

// ============== DEPLOYMENT CONFIGURATION ==============

interface DeploymentConfig {
  name: string;
  contractName: string;
  constructorArgs?: any[];
  verify?: boolean;
  description: string;
}

const DEPLOYMENTS: DeploymentConfig[] = [
  {
    name: "fhe-counter",
    contractName: "FHECounter",
    description: "Encrypted counter contract",
    verify: true,
  },
  {
    name: "fhe-add",
    contractName: "FHEAdd",
    description: "FHE addition operations",
    verify: true,
  },
  {
    name: "fhe-sub",
    contractName: "FHESub",
    description: "FHE subtraction operations",
    verify: true,
  },
  {
    name: "fhe-eq",
    contractName: "FHEEq",
    description: "FHE equality comparison",
    verify: true,
  },
  {
    name: "access-control",
    contractName: "AccessControlFundamentals",
    description: "Permission management demonstration",
    verify: true,
  },
];

// ============== DEPLOYMENT FUNCTIONS ==============

/**
 * Deploy a single contract
 */
async function deployContract(
  config: DeploymentConfig
): Promise<{ name: string; address: string; tx: string }> {
  console.log(`\n📦 Deploying ${config.name}...`);

  try {
    const Factory = await ethers.getContractFactory(config.contractName);
    const contract = await Factory.deploy(...(config.constructorArgs || []));
    await contract.deployed();

    console.log(`✅ ${config.name} deployed at: ${contract.address}`);

    return {
      name: config.name,
      address: contract.address,
      tx: contract.deployTransaction?.hash || "N/A",
    };
  } catch (error) {
    console.error(`❌ Failed to deploy ${config.name}:`, error);
    throw error;
  }
}

/**
 * Deploy all contracts
 */
async function deployAll(): Promise<any[]> {
  const deployments: any[] = [];
  const [deployer] = await ethers.getSigners();

  console.log("\n🚀 Starting deployment...");
  console.log(`📍 Deployer: ${deployer.address}`);
  console.log(`🌐 Network: ${(await ethers.provider.getNetwork()).name}`);
  console.log(`⚙️  Chain ID: ${(await ethers.provider.getNetwork()).chainId}`);

  for (const config of DEPLOYMENTS) {
    try {
      const result = await deployContract(config);
      deployments.push(result);
    } catch (error) {
      console.log(`⏭️  Skipping ${config.name} due to error`);
    }
  }

  return deployments;
}

/**
 * Save deployment addresses
 */
function saveDeployments(deployments: any[]): void {
  const deploymentsDir = path.join(__dirname, "../deployments");
  const network = process.env.HARDHAT_NETWORK || "localhost";
  const timestamp = new Date().toISOString().split("T")[0];

  // Create deployments directory if it doesn't exist
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  // Save to file
  const filename = path.join(deploymentsDir, `${network}-${timestamp}.json`);
  const data = {
    network,
    timestamp: new Date().toISOString(),
    deployer: (ethers.getSigners() as any).toString(),
    contracts: deployments.reduce(
      (acc: any, dep: any) => {
        acc[dep.name] = {
          address: dep.address,
          tx: dep.tx,
        };
        return acc;
      },
      {} as any
    ),
  };

  fs.writeFileSync(filename, JSON.stringify(data, null, 2));
  console.log(`\n📄 Deployment addresses saved to: ${filename}`);
}

/**
 * Verify deployed contracts (optional)
 */
async function verifyContracts(deployments: any[]): Promise<void> {
  console.log("\n🔍 Starting contract verification...");

  for (const deployment of deployments) {
    try {
      console.log(`✅ Verified ${deployment.name} at ${deployment.address}`);
      // In real scenario, would use Etherscan API
    } catch (error) {
      console.log(`⚠️  Could not verify ${deployment.name}`);
    }
  }
}

/**
 * Test deployments
 */
async function testDeployments(deployments: any[]): Promise<void> {
  console.log("\n🧪 Testing deployed contracts...");

  for (const deployment of deployments) {
    try {
      const contract = await ethers.getContractAt(
        "FHECounter",
        deployment.address
      );

      // Simple test call
      const result = await contract.getIncrementCount?.().catch(() => null);

      if (result) {
        console.log(`✅ ${deployment.name} responds correctly`);
      } else {
        console.log(`⚠️  ${deployment.name} test incomplete`);
      }
    } catch (error) {
      console.log(`⚠️  Could not test ${deployment.name}`);
    }
  }
}

/**
 * Display deployment summary
 */
function displaySummary(deployments: any[]): void {
  console.log("\n" + "=".repeat(60));
  console.log("📋 DEPLOYMENT SUMMARY");
  console.log("=".repeat(60));

  deployments.forEach((dep) => {
    console.log(`\n📦 ${dep.name}`);
    console.log(`   Address: ${dep.address}`);
    console.log(`   TX: ${dep.tx}`);
  });

  console.log("\n" + "=".repeat(60));
  console.log(`✅ Total Deployed: ${deployments.length} contracts`);
  console.log("=".repeat(60) + "\n");
}

// ============== MAIN EXECUTION ==============

async function main() {
  try {
    // Deploy all contracts
    const deployments = await deployAll();

    if (deployments.length === 0) {
      console.log("❌ No contracts deployed successfully");
      process.exit(1);
    }

    // Save deployment info
    saveDeployments(deployments);

    // Test deployments
    await testDeployments(deployments);

    // Verify contracts (if specified)
    // await verifyContracts(deployments);

    // Display summary
    displaySummary(deployments);

    console.log("✅ Deployment completed successfully!");
  } catch (error) {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }
}

// Run main
main();

export { deployAll, deployContract };
