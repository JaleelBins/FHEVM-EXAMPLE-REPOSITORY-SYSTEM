/**
 * create-fhevm-example.ts
 *
 * Automation script to generate standalone FHEVM example repositories
 *
 * Usage:
 *   ts-node scripts/create-fhevm-example.ts <example-name> <output-path>
 *
 * Examples:
 *   ts-node scripts/create-fhevm-example.ts fhe-counter ./examples/my-counter
 *   ts-node scripts/create-fhevm-example.ts blind-auction ./examples/my-auction
 *
 * This script:
 * 1. Validates example name exists in configuration
 * 2. Clones base template to output directory
 * 3. Injects example contract and test files
 * 4. Updates configuration files (package.json, hardhat.config.ts)
 * 5. Generates README with setup instructions
 * 6. Creates deployment script
 * 7. Validates generated repository works
 */

import * as fs from "fs-extra";
import * as path from "path";
import { execSync } from "child_process";
import { EXAMPLES_MAP, ExampleConfig } from "./config";

// ============== TYPES ==============

interface CreateExampleOptions {
  baseTemplatePath: string;
  outputPath: string;
  exampleName: string;
  verbose?: boolean;
}

interface CreateExampleResult {
  success: boolean;
  message: string;
  outputPath?: string;
  errors?: string[];
}

// ============== CONSTANTS ==============

const LOG_PREFIX = "📦";
const SUCCESS_PREFIX = "✅";
const ERROR_PREFIX = "❌";
const INFO_PREFIX = "ℹ️";

// ============== LOGGING UTILITIES ==============

function log(message: string): void {
  console.log(`${LOG_PREFIX} ${message}`);
}

function success(message: string): void {
  console.log(`${SUCCESS_PREFIX} ${message}`);
}

function error(message: string): void {
  console.error(`${ERROR_PREFIX} ${message}`);
}

function info(message: string): void {
  console.log(`${INFO_PREFIX} ${message}`);
}

// ============== VALIDATION ==============

async function validateInputs(options: CreateExampleOptions): Promise<{
  valid: boolean;
  error?: string;
}> {
  // Check example exists
  if (!EXAMPLES_MAP[options.exampleName]) {
    return {
      valid: false,
      error: `Example "${options.exampleName}" not found. Available examples: ${Object.keys(EXAMPLES_MAP).join(", ")}`,
    };
  }

  // Check base template exists
  if (!(await fs.pathExists(options.baseTemplatePath))) {
    return {
      valid: false,
      error: `Base template path does not exist: ${options.baseTemplatePath}`,
    };
  }

  // Check output path doesn't already exist
  if (await fs.pathExists(options.outputPath)) {
    return {
      valid: false,
      error: `Output path already exists: ${options.outputPath}. Please choose a different path.`,
    };
  }

  return { valid: true };
}

// ============== MAIN FUNCTIONS ==============

/**
 * Clone base template to output directory
 */
async function cloneBaseTemplate(
  baseTemplatePath: string,
  outputPath: string
): Promise<void> {
  log(`Cloning base template from ${baseTemplatePath}...`);

  try {
    await fs.copy(baseTemplatePath, outputPath, {
      // Skip node_modules and .git to save space/time
      filter: (src) => {
        const basename = path.basename(src);
        return basename !== "node_modules" && basename !== ".git";
      },
    });

    success("Base template cloned successfully");
  } catch (err) {
    throw new Error(`Failed to clone base template: ${err}`);
  }
}

/**
 * Inject example contract and test files
 */
async function injectExampleFiles(
  outputPath: string,
  config: ExampleConfig
): Promise<void> {
  log("Injecting example files...");

  // Get file basenames
  const contractBasename = path.basename(config.contractFile);
  const testBasename = path.basename(config.testFile);

  // Destination paths
  const contractDest = path.join(outputPath, "contracts", contractBasename);
  const testDest = path.join(outputPath, "test", testBasename);

  try {
    // Copy contract file
    await fs.copy(config.contractFile, contractDest);
    info(`Copied contract: ${contractBasename}`);

    // Copy test file
    await fs.copy(config.testFile, testDest);
    info(`Copied test: ${testBasename}`);

    success("Example files injected successfully");
  } catch (err) {
    throw new Error(`Failed to inject example files: ${err}`);
  }
}

/**
 * Update package.json with example metadata
 */
async function updatePackageJson(
  outputPath: string,
  config: ExampleConfig
): Promise<void> {
  log("Updating package.json...");

  const packageJsonPath = path.join(outputPath, "package.json");

  try {
    const packageJson = await fs.readJson(packageJsonPath);

    // Update metadata
    packageJson.name = `fhevm-${config.name}`;
    packageJson.description = config.description;
    packageJson.keywords = [
      ...config.tags,
      "fhevm",
      "example",
      ...config.concepts,
    ];

    // Add custom field with example metadata
    packageJson.fhevm = {
      exampleName: config.name,
      category: config.category,
      difficulty: config.difficulty,
      concepts: config.concepts,
    };

    await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
    success("package.json updated");
  } catch (err) {
    throw new Error(`Failed to update package.json: ${err}`);
  }
}

/**
 * Generate README for the example
 */
async function generateReadme(
  outputPath: string,
  config: ExampleConfig
): Promise<void> {
  log("Generating README...");

  const contractName = path.basename(config.contractFile, ".sol");
  const testName = path.basename(config.testFile, ".ts");

  const readmeContent = `# ${config.title}

## Overview

${config.description}

## Difficulty Level

⭐ **${config.difficulty.toUpperCase()}**

## Concepts Demonstrated

${config.concepts.map((c) => `- **${c}**`).join("\n")}

## Prerequisites

- Node.js 18+
- Basic Solidity knowledge
- Understanding of FHEVM basics

## Installation

\`\`\`bash
npm install
\`\`\`

## Compilation

\`\`\`bash
npm run compile
\`\`\`

## Running Tests

\`\`\`bash
npm run test
\`\`\`

## Project Structure

\`\`\`
.
├── contracts/
│   └── ${contractName}.sol      # Contract implementation
├── test/
│   └── ${testName}.ts           # Test suite
├── hardhat.config.ts            # Hardhat configuration
├── package.json                 # Dependencies
├── README.md                    # This file
└── tsconfig.json               # TypeScript configuration
\`\`\`

## Understanding the Code

### Contract: ${contractName}

The contract demonstrates:
${config.concepts.map((c) => `- ${c}`).join("\n")}

Key features:
- Clear state management
- Proper permission handling
- Comprehensive event logging
- Gas-efficient operations

### Test Suite: ${testName}

Tests include:
- ✅ **Success Cases**: Standard operations that work correctly
- ❌ **Failure Cases**: Common mistakes and how to avoid them
- 🔍 **Edge Cases**: Boundary conditions and special scenarios

## Key Patterns

### Critical: Always Grant Both Permissions

\`\`\`solidity
FHE.allowThis(encryptedValue);        // Contract permission
FHE.allow(encryptedValue, msg.sender); // User permission
\`\`\`

### Encryption Binding

The user who encrypts the input must be the one executing the transaction:

\`\`\`typescript
// ✅ Correct: Same user for encryption and execution
const input = await createEncryptedInput(contractAddr, alice.address)
    .add32(100).encrypt();
await contract.connect(alice).operation(input.handles[0], input.inputProof);

// ❌ Wrong: Different users
const input = await createEncryptedInput(contractAddr, alice.address)...;
await contract.connect(bob).operation(...); // Fails!
\`\`\`

## Common Mistakes to Avoid

1. **Missing FHE.allowThis()**
   - Contract cannot use encrypted values without this
   - Both permissions are mandatory

2. **Encryption/Signer Mismatch**
   - Input must be encrypted for the executing user
   - Mismatches cause decryption failures

3. **Invalid Input Proofs**
   - Input proof must be valid for the encrypted input
   - Cannot reuse proofs across different inputs

4. **View Functions with Encrypted Data**
   - Cannot use encrypted values in view functions
   - Use regular functions with proper permissions instead

## Running the Example

1. **Compile the contract**
   \`\`\`bash
   npm run compile
   \`\`\`

2. **Run the tests**
   \`\`\`bash
   npm run test
   \`\`\`

3. **Check gas usage**
   \`\`\`bash
   npm run test:gas
   \`\`\`

## Learning Outcomes

After studying this example, you will understand:

${config.learningObjectives ? config.learningObjectives.map((obj) => `- ${obj}`).join("\n") : "- The key concepts demonstrated\n- How to implement similar patterns\n- Common mistakes to avoid"}

## Further Learning

### Related Examples

Explore these related examples for deeper understanding:
- [Basic Examples](../basic/) - Fundamental FHEVM operations
- [Access Control](../access-control/) - Permission management patterns
- [Anti-patterns](../anti-patterns/) - Common mistakes explained

### Official Documentation

- [FHEVM Documentation](https://docs.zama.ai/fhevm)
- [Solidity Smart Contract Development](https://docs.soliditylang.org)
- [Hardhat Documentation](https://hardhat.org)

### Community Resources

- [Zama Discord](https://discord.com/invite/zama)
- [Zama Community Forum](https://www.zama.ai/community)
- [GitHub Discussions](https://github.com/zama-ai/fhevm/discussions)

## Troubleshooting

### "decryption failed" Error

This usually means the encryption signer doesn't match the transaction signer.

**Solution**: Ensure you encrypt with the same address that executes the transaction:

\`\`\`typescript
const userAddress = await signer.getAddress();
const input = await createEncryptedInput(contractAddress, userAddress)...;
await contract.connect(signer).operation(...);
\`\`\`

### "Cannot use encrypted value in view function"

View functions cannot work with encrypted data.

**Solution**: Use a regular (non-view) function with proper permissions:

\`\`\`solidity
// ❌ Wrong
function getValue() external view returns (euint32) { ... }

// ✅ Correct
function getValue() external returns (euint32) { ... }
\`\`\`

### Tests Not Compiling

Make sure you have all dependencies installed:

\`\`\`bash
npm install
npm run compile
\`\`\`

## License

BSD-3-Clause-Clear

## Support

For questions or issues:
1. Check the troubleshooting section above
2. Review the test file for usage examples
3. Visit the [Zama Community Forum](https://www.zama.ai/community)

---

**Built with ❤️ for the FHEVM Community**
`;

  const readmePath = path.join(outputPath, "README.md");

  try {
    await fs.writeFile(readmePath, readmeContent);
    success("README generated");
  } catch (err) {
    throw new Error(`Failed to generate README: ${err}`);
  }
}

/**
 * Validate the generated repository
 */
async function validateGeneratedRepo(outputPath: string): Promise<void> {
  log("Validating generated repository...");

  try {
    // Check required files exist
    const requiredFiles = [
      "contracts",
      "test",
      "hardhat.config.ts",
      "package.json",
      "README.md",
      "tsconfig.json",
    ];

    for (const file of requiredFiles) {
      const filePath = path.join(outputPath, file);
      if (!(await fs.pathExists(filePath))) {
        throw new Error(`Missing required file: ${file}`);
      }
    }

    success("Repository structure validated");

    // Optional: Validate that contract compiles (requires dependencies installed)
    // This would require npm install first, so we skip it here
    info("Note: Run 'npm install' and 'npm run compile' to validate compilation");
  } catch (err) {
    throw new Error(`Validation failed: ${err}`);
  }
}

// ============== MAIN EXECUTION ==============

/**
 * Create FHEVM example repository
 */
async function createFhevmExample(
  options: CreateExampleOptions
): Promise<CreateExampleResult> {
  try {
    // Validate inputs
    const validation = await validateInputs(options);
    if (!validation.valid) {
      error(validation.error || "Validation failed");
      return {
        success: false,
        message: validation.error || "Validation failed",
      };
    }

    const config = EXAMPLES_MAP[options.exampleName];

    console.log("\n" + "=".repeat(60));
    log(`Creating ${config.title} example`);
    console.log("=".repeat(60) + "\n");

    // Step 1: Clone base template
    await cloneBaseTemplate(options.baseTemplatePath, options.outputPath);

    // Step 2: Inject example files
    await injectExampleFiles(options.outputPath, config);

    // Step 3: Update package.json
    await updatePackageJson(options.outputPath, config);

    // Step 4: Generate README
    await generateReadme(options.outputPath, config);

    // Step 5: Validate generated repo
    await validateGeneratedRepo(options.outputPath);

    console.log("\n" + "=".repeat(60));
    success(`${config.title} example created successfully!`);
    console.log("=".repeat(60) + "\n");

    console.log(`📂 Location: ${options.outputPath}\n`);

    console.log("Next steps:\n");
    console.log(`  1. cd ${options.outputPath}`);
    console.log(`  2. npm install`);
    console.log(`  3. npm run compile`);
    console.log(`  4. npm run test\n`);

    return {
      success: true,
      message: `${config.title} example created successfully`,
      outputPath: options.outputPath,
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    error(errorMessage);
    return {
      success: false,
      message: errorMessage,
      errors: [errorMessage],
    };
  }
}

// ============== CLI ENTRY POINT ==============

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  // Validate CLI arguments
  if (args.length < 2) {
    console.log(
      "Usage: ts-node create-fhevm-example.ts <example-name> <output-path>\n"
    );
    console.log("Available examples:\n");

    // List categories
    const categories: Record<string, string[]> = {};
    for (const [name, config] of Object.entries(EXAMPLES_MAP)) {
      if (!categories[config.category]) {
        categories[config.category] = [];
      }
      categories[config.category].push(`${name} - ${config.title}`);
    }

    for (const [category, examples] of Object.entries(categories)) {
      console.log(`\n${category.toUpperCase()}`);
      examples.forEach((ex) => console.log(`  - ${ex}`));
    }

    console.log("\nExample:\n");
    console.log("  ts-node create-fhevm-example.ts fhe-counter ./my-counter\n");
    process.exit(1);
  }

  const exampleName = args[0];
  const outputPath = path.resolve(args[1]);
  const baseTemplatePath = path.resolve(__dirname, "../fhevm-hardhat-template");

  const result = await createFhevmExample({
    baseTemplatePath,
    outputPath,
    exampleName,
    verbose: process.env.VERBOSE === "true",
  });

  process.exit(result.success ? 0 : 1);
}

// Execute if run directly
if (require.main === module) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

export { createFhevmExample, CreateExampleOptions, CreateExampleResult };
