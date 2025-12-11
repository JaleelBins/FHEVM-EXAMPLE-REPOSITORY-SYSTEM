# Automation Tools Development Guide

This guide explains how to build the required automation scripts for scaffolding FHEVM example repositories and generating documentation.

---

## 📚 Three Core Tools

### 1. create-fhevm-example
**Purpose**: Generate standalone repositories for single examples

### 2. create-fhevm-category
**Purpose**: Generate projects containing multiple related examples

### 3. generate-docs
**Purpose**: Create GitBook-compatible documentation

---

## 🛠️ Tool 1: create-fhevm-example

### Purpose
Scaffolds a complete, standalone FHEVM project for a single example.

### Functionality

```typescript
// Usage
ts-node scripts/create-fhevm-example.ts <example-name> <output-path>

// Examples
ts-node scripts/create-fhevm-example.ts fhe-counter ./examples/fhe-counter
ts-node scripts/create-fhevm-example.ts blind-auction ./examples/blind-auction
```

### Implementation Steps

#### Step 1: Configuration Mapping
Define all available examples and their metadata:

```typescript
// scripts/config.ts

interface ExampleConfig {
  name: string;           // Machine-readable name (fhe-counter)
  title: string;          // Display title (FHE Counter)
  category: string;       // Category (basic, advanced, etc.)
  description: string;    // What it demonstrates
  contractFile: string;   // Path to contract
  testFile: string;       // Path to test
  difficulty: "beginner" | "intermediate" | "advanced";
  concepts: string[];     // FHEVM concepts demonstrated
  tags: string[];         // Search tags
}

export const EXAMPLES_MAP: Record<string, ExampleConfig> = {
  "fhe-counter": {
    name: "fhe-counter",
    title: "FHE Counter",
    category: "basic",
    description: "Simple encrypted counter demonstrating FHE.add and FHE.sub",
    contractFile: "contracts/basic/FHECounter.sol",
    testFile: "test/basic/FHECounter.ts",
    difficulty: "beginner",
    concepts: ["encryption", "arithmetic", "permissions"],
    tags: ["counter", "basic", "arithmetic"],
  },
  // ... more examples
};
```

#### Step 2: Clone Base Template

```typescript
async function cloneBaseTemplate(
  baseTemplatePath: string,
  outputPath: string
): Promise<void> {
  // Use fs-extra to recursively copy
  await fs.copy(baseTemplatePath, outputPath, {
    filter: (src) => {
      // Skip node_modules and .git
      return !src.includes("node_modules") && !src.includes(".git");
    },
  });

  // Clean up unnecessary files
  await fs.remove(path.join(outputPath, ".git"));
  await fs.remove(path.join(outputPath, "node_modules"));
}
```

#### Step 3: Inject Contract and Test Files

```typescript
async function injectExampleFiles(
  outputPath: string,
  config: ExampleConfig
): Promise<void> {
  // Source paths
  const contractSource = config.contractFile;
  const testSource = config.testFile;

  // Destination paths
  const contractDest = path.join(
    outputPath,
    "contracts",
    path.basename(contractSource)
  );
  const testDest = path.join(
    outputPath,
    "test",
    path.basename(testSource)
  );

  // Copy files
  await fs.copy(contractSource, contractDest);
  await fs.copy(testSource, testDest);

  // Update imports in test file if needed
  await updateImportsInTest(testDest);
}
```

#### Step 4: Update Configuration Files

```typescript
async function updateConfigFiles(
  outputPath: string,
  config: ExampleConfig
): Promise<void> {
  // Update package.json
  const packageJsonPath = path.join(outputPath, "package.json");
  const packageJson = await fs.readJson(packageJsonPath);

  packageJson.name = `fhevm-${config.name}`;
  packageJson.description = config.description;
  packageJson.keywords = [...config.tags, "fhevm"];

  await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });

  // Update README
  await generateExampleReadme(outputPath, config);

  // Update deploy script
  await updateDeployScript(outputPath, config);
}
```

#### Step 5: Generate Example README

```typescript
async function generateExampleReadme(
  outputPath: string,
  config: ExampleConfig
): Promise<void> {
  const readmeContent = `# ${config.title}

## Overview
${config.description}

## Concepts Demonstrated
${config.concepts.map((c) => `- ${c}`).join("\n")}

## Difficulty Level
${config.difficulty.toUpperCase()}

## Prerequisites
- Node.js 18+
- npm or yarn

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
│   └── ${path.basename(config.contractFile)}
├── test/
│   └── ${path.basename(config.testFile)}
├── hardhat.config.ts
├── package.json
└── README.md
\`\`\`

## Understanding the Code

### Contract
The contract demonstrates:
- [Key concept 1]
- [Key concept 2]
- [Key concept 3]

### Tests
Tests include:
- ✅ Success cases
- ❌ Failure cases
- 🔍 Edge cases

## Key Patterns

### Important
Always remember:
\`\`\`solidity
FHE.allowThis(encryptedValue);
FHE.allow(encryptedValue, msg.sender);
\`\`\`

## Common Mistakes
- Missing FHE.allowThis()
- Encryption/signer mismatch
- Invalid input proof

## Further Learning
[Links to documentation and related examples]

## License
BSD-3-Clause-Clear
`;

  const readmePath = path.join(outputPath, "README.md");
  await fs.writeFile(readmePath, readmeContent);
}
```

### Complete Implementation Template

```typescript
// scripts/create-fhevm-example.ts

import * as fs from "fs-extra";
import * as path from "path";
import { EXAMPLES_MAP, ExampleConfig } from "./config";

interface CreateExampleOptions {
  baseTemplatePath: string;
  outputPath: string;
  example: string;
}

async function createFhevmExample(options: CreateExampleOptions): Promise<void> {
  const { baseTemplatePath, outputPath, example } = options;

  // 1. Validate example exists
  if (!EXAMPLES_MAP[example]) {
    throw new Error(`Example "${example}" not found in configuration`);
  }

  const config = EXAMPLES_MAP[example];

  // 2. Check output path
  if (await fs.pathExists(outputPath)) {
    throw new Error(`Output path "${outputPath}" already exists`);
  }

  // 3. Clone base template
  console.log(`📋 Cloning base template...`);
  await cloneBaseTemplate(baseTemplatePath, outputPath);

  // 4. Inject example files
  console.log(`📄 Injecting contract and test files...`);
  await injectExampleFiles(outputPath, config);

  // 5. Update configurations
  console.log(`⚙️  Updating configuration files...`);
  await updateConfigFiles(outputPath, config);

  // 6. Generate README
  console.log(`📚 Generating README...`);
  await generateExampleReadme(outputPath, config);

  console.log(`✅ Successfully created ${config.title} example!`);
  console.log(`📂 Location: ${outputPath}`);
  console.log(`\nNext steps:`);
  console.log(`  cd ${outputPath}`);
  console.log(`  npm install`);
  console.log(`  npm run compile`);
  console.log(`  npm run test`);
}

// CLI execution
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.log(
      "Usage: ts-node create-fhevm-example.ts <example-name> <output-path>"
    );
    console.log(`\nAvailable examples: ${Object.keys(EXAMPLES_MAP).join(", ")}`);
    process.exit(1);
  }

  const example = args[0];
  const outputPath = path.resolve(args[1]);
  const baseTemplatePath = path.resolve(__dirname, "../fhevm-hardhat-template");

  createFhevmExample({
    baseTemplatePath,
    outputPath,
    example,
  }).catch((error) => {
    console.error("Error:", error.message);
    process.exit(1);
  });
}

export { createFhevmExample };
```

---

## 🛠️ Tool 2: create-fhevm-category

### Purpose
Generates projects containing multiple examples from a category.

### Functionality

```typescript
// Usage
ts-node scripts/create-fhevm-category.ts <category> <output-path>

// Examples
ts-node scripts/create-fhevm-category.ts basic ./examples/basic-collection
ts-node scripts/create-fhevm-category.ts advanced ./examples/advanced-collection
```

### Categories Structure

```typescript
// scripts/categories.ts

interface Category {
  name: string;
  title: string;
  description: string;
  examples: string[];
}

export const CATEGORIES: Record<string, Category> = {
  basic: {
    name: "basic",
    title: "Basic FHEVM Examples",
    description: "Learn fundamental FHEVM operations",
    examples: [
      "fhe-counter",
      "fhe-add",
      "fhe-sub",
      "encrypt-single-value",
      "encrypt-multiple-values",
      "user-decrypt-single-value",
      "user-decrypt-multiple-values",
    ],
  },
  advanced: {
    name: "advanced",
    title: "Advanced FHEVM Examples",
    description: "Complex patterns and real-world applications",
    examples: [
      "blind-auction",
      "confidential-dutch-auction",
      "erc7984-example",
    ],
  },
  // ... more categories
};
```

### Implementation

```typescript
// scripts/create-fhevm-category.ts

async function createFhevmCategory(
  category: string,
  outputPath: string
): Promise<void> {
  // 1. Validate category
  if (!CATEGORIES[category]) {
    throw new Error(`Category "${category}" not found`);
  }

  const categoryConfig = CATEGORIES[category];
  await fs.ensureDir(outputPath);

  // 2. Copy base template
  await cloneBaseTemplate(baseTemplatePath, outputPath);

  // 3. Copy all example contracts and tests
  for (const exampleName of categoryConfig.examples) {
    const exampleConfig = EXAMPLES_MAP[exampleName];
    await injectExampleFiles(outputPath, exampleConfig);
  }

  // 4. Update unified documentation
  await generateCategoryReadme(outputPath, categoryConfig);

  // 5. Create combined test script
  await generateCombinedTests(outputPath, categoryConfig);

  console.log(`✅ Successfully created ${categoryConfig.title}`);
}
```

---

## 🛠️ Tool 3: generate-docs

### Purpose
Automatically generates GitBook-compatible documentation.

### Functionality

```typescript
// Usage
ts-node scripts/generate-docs.ts [options]

// Examples
ts-node scripts/generate-docs.ts fhe-counter          // Single example
ts-node scripts/generate-docs.ts --all                // All examples
ts-node scripts/generate-docs.ts --category basic     // Category examples
```

### Implementation

```typescript
// scripts/generate-docs.ts

interface DocConfig {
  example: string;
  outputDir: string;
  extractCode: boolean;
  generateIndex: boolean;
}

async function generateDocumentation(config: DocConfig): Promise<void> {
  const exampleConfig = EXAMPLES_MAP[config.example];

  // 1. Extract contract code
  const contractCode = await fs.readFile(exampleConfig.contractFile, "utf-8");

  // 2. Extract test file
  const testCode = await fs.readFile(exampleConfig.testFile, "utf-8");

  // 3. Parse comments and documentation
  const docData = parseDocumentation(contractCode, testCode, exampleConfig);

  // 4. Generate markdown
  const markdown = generateMarkdown(docData, exampleConfig);

  // 5. Write output file
  const outputFile = path.join(
    config.outputDir,
    `${config.example}.md`
  );
  await fs.writeFile(outputFile, markdown);

  // 6. Update SUMMARY.md if specified
  if (config.generateIndex) {
    await updateSummaryFile(config.outputDir);
  }

  console.log(`✅ Documentation generated: ${outputFile}`);
}

function parseDocumentation(
  contractCode: string,
  testCode: string,
  config: ExampleConfig
): any {
  return {
    title: config.title,
    description: config.description,
    concepts: config.concepts,
    contractCode: contractCode,
    testCode: testCode,
    difficulty: config.difficulty,
  };
}

function generateMarkdown(docData: any, config: ExampleConfig): string {
  return `# ${docData.title}

## Overview
${docData.description}

## Difficulty Level
${docData.difficulty.toUpperCase()}

## Concepts Covered
${docData.concepts.map((c: string) => `- **${c}**`).join("\n")}

## Contract Implementation

\`\`\`solidity
${docData.contractCode}
\`\`\`

## Test Cases

\`\`\`typescript
${docData.testCode}
\`\`\`

## Key Takeaways
[Summary of important points]

## Related Examples
[Links to similar examples]

## Further Reading
[Links to documentation]
`;
}

async function updateSummaryFile(outputDir: string): Promise<void> {
  // Read all generated markdown files
  const files = await fs.readdir(outputDir);
  const mdFiles = files.filter((f) => f.endsWith(".md"));

  // Generate SUMMARY.md
  const summary = `# Documentation Summary

## Examples

${mdFiles.map((file) => `- [${file.replace(".md", "")}](./${file})`).join("\n")}
`;

  await fs.writeFile(path.join(outputDir, "SUMMARY.md"), summary);
}
```

---

## 📦 Package.json Configuration

### Scripts Setup

```json
{
  "scripts": {
    "create-example": "ts-node scripts/create-fhevm-example.ts",
    "create-category": "ts-node scripts/create-fhevm-category.ts",
    "generate-docs": "ts-node scripts/generate-docs.ts",
    "generate-all-docs": "ts-node scripts/generate-docs.ts --all",
    "help:examples": "ts-node scripts/list-examples.ts",
    "help:categories": "ts-node scripts/list-categories.ts",
    "validate": "ts-node scripts/validate-examples.ts"
  }
}
```

### Dependency Requirements

```json
{
  "dependencies": {
    "@fhevm/solidity": "^0.9.1",
    "@fhevm/hardhat-plugin": "^0.3.0",
    "hardhat": "^10.0.0",
    "hardhat-deploy": "^0.11.0",
    "typescript": "^5.0.0",
    "fs-extra": "^11.0.0"
  },
  "devDependencies": {
    "@types/fs-extra": "^11.0.0",
    "@types/node": "^20.0.0"
  }
}
```

---

## 🧪 Testing Your Tools

### Test Plan

1. **Tool Validation**
   ```bash
   npm run create-example fhe-counter ./test-output/example
   cd ./test-output/example
   npm install
   npm run compile
   npm run test
   ```

2. **Category Testing**
   ```bash
   npm run create-category basic ./test-output/basic-examples
   cd ./test-output/basic-examples
   npm install
   npm run test
   ```

3. **Documentation Testing**
   ```bash
   npm run generate-docs --all
   # Verify SUMMARY.md and individual markdown files
   ```

---

## 🔍 Validation Tool

Create a validation script to ensure tools work correctly:

```typescript
// scripts/validate-examples.ts

async function validateAllExamples(): Promise<void> {
  const examples = Object.keys(EXAMPLES_MAP);
  const errors: string[] = [];

  for (const example of examples) {
    try {
      // Create temporary directory
      const tempDir = path.join(os.tmpdir(), `test-${Date.now()}`);

      // Test creation
      await createFhevmExample({
        baseTemplatePath,
        outputPath: tempDir,
        example,
      });

      // Test compilation
      const result = execSync("npm run compile", {
        cwd: tempDir,
        encoding: "utf-8",
      });

      // Test execution
      execSync("npm run test", { cwd: tempDir, encoding: "utf-8" });

      // Clean up
      await fs.remove(tempDir);

      console.log(`✅ ${example}`);
    } catch (error) {
      errors.push(`❌ ${example}: ${error}`);
    }
  }

  if (errors.length > 0) {
    console.log("\nErrors found:");
    errors.forEach((e) => console.log(e));
    process.exit(1);
  }
}
```

---

## 📋 Configuration Best Practices

1. **Centralized Configuration**
   - Keep all example metadata in one file
   - Make categories easy to maintain
   - Support version management

2. **Error Handling**
   - Validate input parameters
   - Provide helpful error messages
   - Check file existence

3. **Logging**
   - Show progress during creation
   - List completed steps
   - Provide next steps

4. **Extensibility**
   - Support custom templates
   - Allow configuration overrides
   - Enable plugin system

---

## 🎯 Success Criteria

Your automation tools should:
- ✅ Generate working standalone repositories
- ✅ Have zero external dependencies (besides FHEVM)
- ✅ Include comprehensive error messages
- ✅ Auto-generate quality documentation
- ✅ Be easy to maintain and extend
- ✅ Support batch operations
- ✅ Validate outputs before completion

