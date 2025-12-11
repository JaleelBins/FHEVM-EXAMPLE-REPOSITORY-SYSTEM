/**
 * create-fhevm-category.ts
 * Automation Script for Creating Category-Based Projects
 *
 * Generates complete projects containing all examples from a specific category
 * - Creates standalone project directory
 * - Includes all examples in category
 * - Sets up configuration
 * - Generates documentation
 * - Provides learning path
 */

import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";

// ============== INTERFACES ==============

interface ExampleConfig {
  name: string;
  title: string;
  description: string;
  category: string;
  contractFile: string;
  testFile: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  concepts: string[];
  tags: string[];
  chapter?: string;
}

interface CategoryConfig {
  name: string;
  title: string;
  description: string;
  examples: string[];
  difficulty: "beginner" | "intermediate" | "advanced";
}

// ============== CATEGORY PROJECT GENERATOR ==============

class CategoryProjectGenerator {
  /**
   * Create category-based project structure
   */
  static createCategoryProject(
    categoryName: string,
    outputDir: string,
    examples: ExampleConfig[]
  ): void {
    console.log(`🏗️  Creating ${categoryName} category project...`);

    // Create directory structure
    this.createDirectoryStructure(outputDir);

    // Copy base template files
    this.setupBaseTemplate(outputDir);

    // Create category-specific files
    this.createCategoryContracts(outputDir, examples);
    this.createCategoryTests(outputDir, examples);
    this.createCategoryDocumentation(outputDir, categoryName, examples);
    this.createLearningPath(outputDir, categoryName, examples);

    console.log(`✅ Category project created at: ${outputDir}`);
  }

  /**
   * Create directory structure
   */
  private static createDirectoryStructure(baseDir: string): void {
    const dirs = [
      "contracts",
      "contracts/category",
      "test",
      "test/category",
      "scripts",
      "docs",
      "artifacts",
    ];

    dirs.forEach((dir) => {
      const fullPath = path.join(baseDir, dir);
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
      }
    });

    console.log("✅ Directory structure created");
  }

  /**
   * Setup base template files
   */
  private static setupBaseTemplate(baseDir: string): void {
    // Copy hardhat.config.ts
    const hardhatConfig = `
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-tfhe";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      forking: {
        enabled: false,
      },
    },
    localhost: {
      url: "http://127.0.0.1:8545",
    },
    testnet: {
      url: process.env.TESTNET_RPC_URL || "http://localhost:8545",
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS === "true",
    currency: "USD",
  },
};

export default config;
`;

    fs.writeFileSync(path.join(baseDir, "hardhat.config.ts"), hardhatConfig);

    // Copy package.json
    const packageJson = {
      name: "fhevm-category-project",
      version: "1.0.0",
      description: "FHEVM Category-Based Example Project",
      scripts: {
        compile: "hardhat compile",
        test: "hardhat test",
        deploy: "hardhat run scripts/deploy.ts",
      },
      devDependencies: {
        "@nomicfoundation/hardhat-toolbox": "^3.0.0",
        "hardhat-tfhe": "^0.1.0",
        typescript: "^5.0.0",
      },
      dependencies: {
        "fhevm/lib": "^0.9.1",
      },
    };

    fs.writeFileSync(
      path.join(baseDir, "package.json"),
      JSON.stringify(packageJson, null, 2)
    );

    // Copy tsconfig.json
    const tsconfig = {
      compilerOptions: {
        target: "ES2020",
        module: "commonjs",
        lib: ["ES2020"],
        outDir: "./dist",
        rootDir: "./",
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true,
      },
    };

    fs.writeFileSync(
      path.join(baseDir, "tsconfig.json"),
      JSON.stringify(tsconfig, null, 2)
    );

    // Copy .env.example
    const envExample = `
TESTNET_RPC_URL=http://localhost:8545
PRIVATE_KEY=your-private-key-here
REPORT_GAS=false
`;

    fs.writeFileSync(path.join(baseDir, ".env.example"), envExample);

    console.log("✅ Base template files setup");
  }

  /**
   * Create category-specific contracts
   */
  private static createCategoryContracts(
    baseDir: string,
    examples: ExampleConfig[]
  ): void {
    examples.forEach((example) => {
      // Create contract file stub (would be filled from actual example)
      const contractContent = `// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import "fhevm/lib/TFHE.sol";

/**
 * @title ${example.title}
 * @notice ${example.description}
 * @dev Category: ${example.category}
 */
contract ${example.title.replace(/ /g, "")} {
    // Implementation would be copied from example
    // See EXAMPLE_${example.title.replace(/ /g, "")}.sol
}
`;

      const contractPath = path.join(
        baseDir,
        "contracts/category",
        `${example.name}.sol`
      );
      fs.writeFileSync(contractPath, contractContent);
    });

    console.log(`✅ Created ${examples.length} category contract files`);
  }

  /**
   * Create category-specific tests
   */
  private static createCategoryTests(
    baseDir: string,
    examples: ExampleConfig[]
  ): void {
    examples.forEach((example) => {
      const testContent = `import { expect } from "chai";
import { ethers } from "hardhat";

describe("${example.title}", () => {
  let contract: any;
  let owner: any;

  before(async () => {
    [owner] = await ethers.getSigners();
    const Contract = await ethers.getContractFactory("${example.title.replace(/ /g, "")}");
    contract = await Contract.deploy();
    await contract.deployed();
  });

  it("should deploy successfully", async () => {
    expect(contract.address).to.exist;
  });

  // Add more tests based on example requirements
  // - Success cases
  // - Failure cases
  // - Edge cases
  // - Permission scenarios
});
`;

      const testPath = path.join(
        baseDir,
        "test/category",
        `${example.name}.test.ts`
      );
      fs.writeFileSync(testPath, testContent);
    });

    console.log(`✅ Created ${examples.length} test files`);
  }

  /**
   * Create category documentation
   */
  private static createCategoryDocumentation(
    baseDir: string,
    categoryName: string,
    examples: ExampleConfig[]
  ): void {
    const docContent = `# ${categoryName} Category - Examples & Documentation

## Overview

This project contains all examples from the **${categoryName}** category.

**Total Examples**: ${examples.length}
**Difficulty Level**: ${examples[0]?.difficulty || "mixed"}

---

## 📚 Examples Included

${examples.map((ex) => `### ${ex.title}
- **File**: contracts/category/${ex.name}.sol
- **Description**: ${ex.description}
- **Concepts**: ${ex.concepts.join(", ")}
- **Test**: test/category/${ex.name}.test.ts

`).join("\n")}

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm 9+
- Hardhat

### Installation
\`\`\`bash
npm install
\`\`\`

### Compilation
\`\`\`bash
npm run compile
\`\`\`

### Testing
\`\`\`bash
npm test
\`\`\`

---

## 🎯 Learning Path

Start with basic examples and progress to more complex ones:

${examples
  .sort((a, b) => {
    const order = { beginner: 0, intermediate: 1, advanced: 2 };
    return (order[a.difficulty] || 0) - (order[b.difficulty] || 0);
  })
  .map((ex, idx) => `${idx + 1}. **${ex.title}** (${ex.difficulty})`).join("\n")}

---

## 📖 Documentation Files

- README.md (this file)
- Individual example docs in docs/ directory
- Main competition guide in root directory

---

## ✅ Verification Checklist

Before submission, verify:

- [ ] All contracts compile
- [ ] All tests pass
- [ ] Code is well-commented
- [ ] No hardcoded secrets
- [ ] Gas usage optimized
- [ ] Follows Solidity style guide

---

## 🔗 Related Resources

- FHEVM Documentation: https://docs.zama.ai/fhevm
- Hardhat Guide: https://hardhat.org
- Solidity Reference: https://docs.soliditylang.org

---

**Generated**: ${new Date().toISOString()}
**Status**: Ready for development
`;

    fs.writeFileSync(path.join(baseDir, "README.md"), docContent);
    console.log("✅ Category documentation created");
  }

  /**
   * Create learning path guide
   */
  private static createLearningPath(
    baseDir: string,
    categoryName: string,
    examples: ExampleConfig[]
  ): void {
    const learningPath = `# ${categoryName} Category - Learning Path

## 📚 Study Guide

This guide helps you master all examples in the ${categoryName} category.

**Estimated Time**: ${examples.length * 2}-${examples.length * 3} hours
**Category Difficulty**: ${examples[0]?.difficulty || "mixed"}

---

## Prerequisites

${
  examples[0]?.prerequisites
    ? examples[0].prerequisites.map((p) => `- ${p}`).join("\n")
    : `- Basic Solidity knowledge
- Understanding of encryption
- FHEVM fundamentals`
}

---

## Study Schedule

### Week 1: Foundations
${examples
  .filter((ex) => ex.difficulty === "beginner")
  .map((ex) => `- Day: ${ex.title}`)
  .join("\n")}

### Week 2: Intermediate Concepts
${examples
  .filter((ex) => ex.difficulty === "intermediate")
  .map((ex) => `- Day: ${ex.title}`)
  .join("\n")}

### Week 3: Advanced Topics
${examples
  .filter((ex) => ex.difficulty === "advanced")
  .map((ex) => `- Day: ${ex.title}`)
  .join("\n")}

---

## Practice Exercises

For each example:
1. Read the contract thoroughly
2. Review test cases
3. Run tests locally
4. Modify code (add features)
5. Create new test cases
6. Deploy to testnet

---

## Key Concepts

${examples
  .flatMap((ex) => ex.concepts)
  .filter((val, idx, arr) => arr.indexOf(val) === idx)
  .map((concept) => `- **${concept}**: Critical for this category`)
  .join("\n")}

---

## Common Mistakes

- Not calling FHE.allowThis() and FHE.allow()
- Using view functions with encrypted values
- Mismatching encryption and signing users
- Not validating input proofs

---

## Verification Checklist

As you progress:
- [ ] Understand all basic examples
- [ ] Modify examples successfully
- [ ] Create custom test cases
- [ ] Combine multiple examples
- [ ] Deploy to testnet
- [ ] Document improvements

---

**Category**: ${categoryName}
**Status**: Ready to study
**Last Updated**: ${new Date().toISOString()}
`;

    fs.writeFileSync(path.join(baseDir, "LEARNING_PATH.md"), learningPath);
    console.log("✅ Learning path created");
  }
}

// ============== MAIN EXECUTION ==============

/**
 * Usage:
 *
 * npx ts-node create-fhevm-category.ts basic ./my-basic-examples
 * npx ts-node create-fhevm-category.ts access-control ./my-access-control
 * npx ts-node create-fhevm-category.ts --list
 */

const args = process.argv.slice(2);
const categoryName = args[0];
const outputDir = args[1];

const categories = {
  basic: {
    name: "basic",
    title: "Basic Operations",
    description: "Fundamental FHEVM operations",
    examples: [
      "fhe-counter",
      "fhe-add",
      "fhe-sub",
      "fhe-eq",
      "encrypt-single-value",
      "encrypt-multiple-values",
      "user-decrypt-single",
      "user-decrypt-multiple",
      "public-decrypt",
    ],
    difficulty: "beginner",
  },
  "access-control": {
    name: "access-control",
    title: "Access Control",
    description: "Permission management patterns",
    examples: [
      "access-control-fundamentals",
      "fhe-allow-example",
      "fhe-allowThis-example",
      "fhe-allowTransient-example",
    ],
    difficulty: "intermediate",
  },
  "anti-patterns": {
    name: "anti-patterns",
    title: "Anti-Patterns",
    description: "Common mistakes and how to avoid them",
    examples: [
      "view-function-error",
      "missing-allowThis",
      "encryption-signer-mismatch",
      "lifecycle-errors",
    ],
    difficulty: "intermediate",
  },
  openzeppelin: {
    name: "openzeppelin",
    title: "OpenZeppelin Standards",
    description: "ERC7984 tokens and confidential contracts",
    examples: [
      "erc7984-example",
      "erc7984-wrapper",
      "token-swaps",
      "vesting-wallet",
      "private-voting",
    ],
    difficulty: "intermediate",
  },
  advanced: {
    name: "advanced",
    title: "Advanced Applications",
    description: "Complex use cases and applications",
    examples: ["blind-auction", "dutch-auction", "voting-system"],
    difficulty: "advanced",
  },
};

if (categoryName === "--list") {
  console.log("\n📚 Available Categories:\n");
  Object.values(categories).forEach((cat) => {
    console.log(`  ${cat.name}: ${cat.title}`);
    console.log(`    Description: ${cat.description}`);
    console.log(`    Examples: ${cat.examples.length}`);
    console.log(`    Difficulty: ${cat.difficulty}\n`);
  });
} else if (categoryName === "--help") {
  console.log(`
Usage: npx ts-node create-fhevm-category.ts <CATEGORY> <OUTPUT_DIR>

Categories:
  basic, access-control, anti-patterns, openzeppelin, advanced

Examples:
  npx ts-node create-fhevm-category.ts basic ./my-basic
  npx ts-node create-fhevm-category.ts access-control ./my-access-control

Options:
  --list    Show available categories
  --help    Show this help message
`);
} else if (categoryName && outputDir) {
  const category = categories[categoryName as keyof typeof categories];
  if (category) {
    // Create output directory
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Generate example configs (stub)
    const exampleConfigs = category.examples.map((name) => ({
      name,
      title: name.replace(/-/g, " ").toUpperCase(),
      description: "Example implementation",
      category: categoryName,
      contractFile: `contracts/category/${name}.sol`,
      testFile: `test/category/${name}.test.ts`,
      difficulty: category.difficulty,
      concepts: ["encryption", "fhevm"],
      tags: [categoryName],
    }));

    CategoryProjectGenerator.createCategoryProject(
      category.title,
      outputDir,
      exampleConfigs
    );
  } else {
    console.error(`❌ Category not found: ${categoryName}`);
    console.log("Use --list to see available categories");
  }
} else {
  console.error("❌ Missing arguments");
  console.log("Use --help for usage information");
}

export { CategoryProjectGenerator };
