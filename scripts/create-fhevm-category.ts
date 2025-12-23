#!/usr/bin/env ts-node

/**
 * create-fhevm-category - CLI tool to generate FHEVM projects with multiple examples from a category
 *
 * Usage: ts-node scripts/create-fhevm-category.ts <category> [output-dir]
 *
 * Example: ts-node scripts/create-fhevm-category.ts compliance ./output/compliance-examples
 */

import * as fs from 'fs';
import * as path from 'path';

// Color codes for terminal output
enum Color {
  Reset = '\x1b[0m',
  Green = '\x1b[32m',
  Blue = '\x1b[34m',
  Yellow = '\x1b[33m',
  Red = '\x1b[31m',
  Cyan = '\x1b[36m',
  Magenta = '\x1b[35m',
}

function log(message: string, color: Color = Color.Reset): void {
  console.log(`${color}${message}${Color.Reset}`);
}

function error(message: string): never {
  log(`❌ Error: ${message}`, Color.Red);
  process.exit(1);
}

function success(message: string): void {
  log(`✅ ${message}`, Color.Green);
}

function info(message: string): void {
  log(`ℹ️  ${message}`, Color.Blue);
}

// Contract item interface
interface ContractItem {
  path: string;
  test: string;
  fixture?: string;
  additionalFiles?: string[];
}

// Category configuration interface
interface CategoryConfig {
  name: string;
  description: string;
  contracts: ContractItem[];
  additionalDeps?: Record<string, string>;
}

// Category definitions
const CATEGORIES: Record<string, CategoryConfig> = {
  compliance: {
    name: 'Privacy Compliance Examples',
    description: 'Privacy-preserving compliance and audit systems using FHEVM',
    contracts: [
      { path: 'contracts/PrivacyComplianceAudit.sol', test: 'test/PrivacyComplianceAudit.test.ts' },
    ],
  },
  basic: {
    name: 'Basic FHEVM Examples',
    description: 'Fundamental FHEVM operations including encryption, decryption, and basic FHE operations',
    contracts: [
      { path: 'contracts/FHECounter.sol', test: 'test/FHECounter.test.ts' },
      { path: 'contracts/FHEAdd.sol', test: 'test/FHEAdd.test.ts' },
      { path: 'contracts/FHEEq.sol', test: 'test/FHEEq.test.ts' },
    ],
  },
};

function copyDirectoryRecursive(source: string, destination: string, excludeDirs: string[] = []): void {
  if (!fs.existsSync(destination)) {
    fs.mkdirSync(destination, { recursive: true });
  }

  const items = fs.readdirSync(source);

  items.forEach(item => {
    const sourcePath = path.join(source, item);
    const destPath = path.join(destination, item);
    const stat = fs.statSync(sourcePath);

    if (stat.isDirectory()) {
      if (excludeDirs.includes(item)) {
        return;
      }
      copyDirectoryRecursive(sourcePath, destPath, excludeDirs);
    } else {
      fs.copyFileSync(sourcePath, destPath);
    }
  });
}

function getContractName(contractPath: string): string | null {
  const content = fs.readFileSync(contractPath, 'utf-8');
  const match = content.match(/^\s*contract\s+(\w+)(?:\s+is\s+|\s*\{)/m);
  return match ? match[1] : null;
}

function generateCategoryReadme(category: CategoryConfig, contractNames: string[]): string {
  return `# ${category.name}

${category.description}

## Included Examples

${contractNames.map(name => `- **${name}**: See \`contracts/${name}.sol\``).join('\n')}

## Quick Start

### Prerequisites

- **Node.js**: Version 20 or higher
- **npm**: Package manager

### Installation

1. **Install dependencies**

   \`\`\`bash
   npm install
   \`\`\`

2. **Set up environment variables**

   \`\`\`bash
   npx hardhat vars set MNEMONIC
   npx hardhat vars set INFURA_API_KEY
   # Optional: Set Etherscan API key for contract verification
   npx hardhat vars set ETHERSCAN_API_KEY
   \`\`\`

3. **Compile and test**

   \`\`\`bash
   npm run compile
   npm run test
   \`\`\`

## Testing

Run all tests:

\`\`\`bash
npm run test
\`\`\`

For Sepolia testnet testing:

\`\`\`bash
npm run test:sepolia
\`\`\`

## Deployment

Deploy to local network:

\`\`\`bash
npx hardhat node
npx hardhat deploy --network localhost
\`\`\`

Deploy to Sepolia:

\`\`\`bash
npx hardhat deploy --network sepolia
npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
\`\`\`

## Documentation

- [FHEVM Documentation](https://docs.zama.ai/fhevm)
- [FHEVM Examples](https://docs.zama.org/protocol/examples)
- [FHEVM Hardhat Plugin](https://docs.zama.ai/protocol/solidity-guides/development-guide/hardhat)

## License

This project is licensed under the BSD-3-Clause-Clear License.

---

**Built with FHEVM by Zama**
`;
}

function createCategory(categoryName: string, outputDir: string): void {
  const rootDir = process.cwd();

  // Check if category exists
  if (!CATEGORIES[categoryName]) {
    error(`Unknown category: ${categoryName}\n\nAvailable categories:\n${Object.keys(CATEGORIES).map(k => `  - ${k}: ${CATEGORIES[k].name}`).join('\n')}`);
  }

  const category = CATEGORIES[categoryName];

  info(`Creating FHEVM category: ${categoryName}`);
  info(`Output directory: ${outputDir}`);

  // Step 1: Create output directory
  log('\n📋 Step 1: Creating project structure...', Color.Cyan);
  if (fs.existsSync(outputDir)) {
    error(`Output directory already exists: ${outputDir}`);
  }
  fs.mkdirSync(outputDir, { recursive: true });
  const contractsDir = path.join(outputDir, 'contracts');
  const testDir = path.join(outputDir, 'test');
  fs.mkdirSync(contractsDir, { recursive: true });
  fs.mkdirSync(testDir, { recursive: true });
  success('Project structure created');

  // Step 2: Copy contracts and tests
  log('\n📄 Step 2: Copying contracts and tests...', Color.Cyan);
  const contractNames: string[] = [];

  category.contracts.forEach((item, index) => {
    const contractPath = path.join(rootDir, item.path);
    const testPath = path.join(rootDir, item.test);

    if (!fs.existsSync(contractPath)) {
      log(`⚠️  Warning: Contract not found: ${item.path}`, Color.Yellow);
      return;
    }

    const contractName = getContractName(contractPath);
    if (!contractName) {
      log(`⚠️  Warning: Could not extract contract name from ${item.path}`, Color.Yellow);
      return;
    }

    contractNames.push(contractName);

    // Copy contract
    const destContractPath = path.join(contractsDir, `${contractName}.sol`);
    fs.copyFileSync(contractPath, destContractPath);
    log(`  ✓ Copied contract: ${contractName}.sol`, Color.Green);

    // Copy test if exists
    if (fs.existsSync(testPath)) {
      const destTestPath = path.join(testDir, path.basename(testPath));
      fs.copyFileSync(testPath, destTestPath);
      log(`  ✓ Copied test: ${path.basename(testPath)}`, Color.Green);
    }

    // Copy fixture if exists
    if (item.fixture) {
      const fixturePath = path.join(rootDir, item.fixture);
      if (fs.existsSync(fixturePath)) {
        const destFixturePath = path.join(testDir, path.basename(item.fixture));
        fs.copyFileSync(fixturePath, destFixturePath);
        log(`  ✓ Copied fixture: ${path.basename(item.fixture)}`, Color.Green);
      }
    }

    // Copy additional files if any
    if (item.additionalFiles) {
      item.additionalFiles.forEach(filePath => {
        const additionalFilePath = path.join(rootDir, filePath);
        if (fs.existsSync(additionalFilePath)) {
          const destAdditionalPath = path.join(testDir, path.basename(filePath));
          fs.copyFileSync(additionalFilePath, destAdditionalPath);
          log(`  ✓ Copied additional file: ${path.basename(filePath)}`, Color.Green);
        }
      });
    }
  });

  success(`Copied ${contractNames.length} contracts and tests`);

  // Step 3: Generate README
  log('\n📝 Step 3: Generating README...', Color.Cyan);
  const readme = generateCategoryReadme(category, contractNames);
  fs.writeFileSync(path.join(outputDir, 'README.md'), readme);
  success('README.md generated');

  // Final summary
  log('\n' + '='.repeat(60), Color.Green);
  success(`FHEVM category "${categoryName}" created successfully!`);
  log('='.repeat(60), Color.Green);

  log('\n📦 Next steps:', Color.Yellow);
  log(`  cd ${path.relative(process.cwd(), outputDir)}`);
  log('  npm install');
  log('  npm run compile');
  log('  npm run test');

  log('\n🎉 Happy coding with FHEVM!', Color.Cyan);
}

// Main execution
function main(): void {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    log('FHEVM Category Generator', Color.Cyan);
    log('\nUsage: ts-node scripts/create-fhevm-category.ts <category> [output-dir]\n');
    log('Available categories:', Color.Yellow);
    Object.entries(CATEGORIES).forEach(([name, info]) => {
      log(`  ${name}`, Color.Green);
      log(`    ${info.description}`, Color.Reset);
      log(`    Contracts: ${info.contracts.length}`, Color.Reset);
    });
    log('\nExample:', Color.Yellow);
    log('  ts-node scripts/create-fhevm-category.ts compliance ./output/compliance-examples\n');
    process.exit(0);
  }

  const categoryName = args[0];
  const outputDir = args[1] || path.join(process.cwd(), 'output', `fhevm-category-${categoryName}`);

  createCategory(categoryName, outputDir);
}

main();
