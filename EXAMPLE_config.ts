/**
 * Example Configuration File for Automation Scripts
 *
 * This configuration maps all available FHEVM examples for:
 * - create-fhevm-example.ts (single example generator)
 * - create-fhevm-category.ts (category-based projects)
 * - generate-docs.ts (documentation generator)
 *
 * Structure:
 * 1. ExampleConfig interface - defines example metadata
 * 2. EXAMPLES_MAP - all examples mapped by name
 * 3. CATEGORIES - examples grouped by category
 * 4. DIFFICULTY_LEVELS - for categorization
 */

// ============== INTERFACES ==============

export interface ExampleConfig {
  // Display and organization
  name: string; // Machine-readable name (e.g., "fhe-counter")
  title: string; // Display title (e.g., "FHE Counter")
  description: string; // What this example demonstrates
  category: string; // Category: basic, advanced, access-control, anti-patterns, openzeppelin

  // File locations
  contractFile: string; // Path to Solidity contract
  testFile: string; // Path to TypeScript test file

  // Metadata
  difficulty: "beginner" | "intermediate" | "advanced";
  concepts: string[]; // Key FHEVM concepts taught
  tags: string[]; // Search and filter tags

  // Documentation
  chapter?: string; // Documentation chapter/section
  prerequisites?: string[]; // Required knowledge
  learningObjectives?: string[]; // What users will learn
}

export interface Category {
  name: string;
  title: string;
  description: string;
  examples: string[]; // Names of examples in category
  difficulty: "beginner" | "intermediate" | "advanced";
}

// ============== EXAMPLES MAP ==============

export const EXAMPLES_MAP: Record<string, ExampleConfig> = {
  // ===== BASIC CATEGORY =====

  "fhe-counter": {
    name: "fhe-counter",
    title: "FHE Counter",
    description:
      "Simple encrypted counter demonstrating FHE.add and FHE.sub operations with permission management",
    category: "basic",
    contractFile: "contracts/basic/FHECounter.sol",
    testFile: "test/basic/FHECounter.ts",
    difficulty: "beginner",
    concepts: ["encryption", "arithmetic", "permissions", "state-management"],
    tags: ["counter", "basic", "arithmetic", "fhe-add", "fhe-sub"],
    chapter: "Getting Started",
    prerequisites: ["Solidity basics", "Understanding of encryption"],
    learningObjectives: [
      "Store encrypted values on-chain",
      "Perform arithmetic on encrypted data",
      "Manage FHE permissions",
    ],
  },

  "fhe-add": {
    name: "fhe-add",
    title: "FHE Addition Operation",
    description: "Demonstrates FHE.add for encrypted arithmetic operations",
    category: "basic",
    contractFile: "contracts/basic/FHEAdd.sol",
    testFile: "test/basic/FHEAdd.ts",
    difficulty: "beginner",
    concepts: ["arithmetic", "fhe-add", "encrypted-operations"],
    tags: ["arithmetic", "add", "operations"],
    chapter: "Arithmetic Operations",
    prerequisites: ["Basic FHE knowledge"],
    learningObjectives: ["Understand FHE.add operation", "Add encrypted values"],
  },

  "fhe-sub": {
    name: "fhe-sub",
    title: "FHE Subtraction Operation",
    description: "Demonstrates FHE.sub for encrypted subtraction",
    category: "basic",
    contractFile: "contracts/basic/FHESub.sol",
    testFile: "test/basic/FHESub.ts",
    difficulty: "beginner",
    concepts: ["arithmetic", "fhe-sub", "encrypted-operations"],
    tags: ["arithmetic", "subtract", "operations"],
    chapter: "Arithmetic Operations",
  },

  "fhe-eq": {
    name: "fhe-eq",
    title: "FHE Equality Comparison",
    description: "Demonstrates FHE.eq for comparing encrypted values",
    category: "basic",
    contractFile: "contracts/basic/FHEEq.sol",
    testFile: "test/basic/FHEEq.ts",
    difficulty: "beginner",
    concepts: ["comparison", "fhe-eq", "encrypted-operations"],
    tags: ["comparison", "equality", "operations"],
    chapter: "Comparison Operations",
  },

  "encrypt-single-value": {
    name: "encrypt-single-value",
    title: "Encrypt Single Value",
    description:
      "Demonstrates how to encrypt a single value and handle input proofs",
    category: "basic",
    contractFile: "contracts/basic/EncryptSingleValue.sol",
    testFile: "test/basic/EncryptSingleValue.ts",
    difficulty: "beginner",
    concepts: ["encryption", "input-proof", "single-value"],
    tags: ["encryption", "single-value", "input-proof"],
    chapter: "Encryption Basics",
  },

  "encrypt-multiple-values": {
    name: "encrypt-multiple-values",
    title: "Encrypt Multiple Values",
    description: "Demonstrates handling multiple encrypted values in one contract",
    category: "basic",
    contractFile: "contracts/basic/EncryptMultipleValues.sol",
    testFile: "test/basic/EncryptMultipleValues.ts",
    difficulty: "beginner",
    concepts: ["encryption", "multiple-values", "state-management"],
    tags: ["encryption", "multiple", "state"],
    chapter: "Encryption Basics",
  },

  "user-decrypt-single-value": {
    name: "user-decrypt-single-value",
    title: "User Decrypt Single Value",
    description: "Demonstrates how users can decrypt encrypted values they created",
    category: "basic",
    contractFile: "contracts/basic/UserDecryptSingleValue.sol",
    testFile: "test/basic/UserDecryptSingleValue.ts",
    difficulty: "beginner",
    concepts: ["decryption", "permissions", "user-access"],
    tags: ["decryption", "user", "permissions"],
    chapter: "Decryption & Permissions",
  },

  "user-decrypt-multiple-values": {
    name: "user-decrypt-multiple-values",
    title: "User Decrypt Multiple Values",
    description: "Demonstrates decryption of multiple encrypted values by authorized user",
    category: "basic",
    contractFile: "contracts/basic/UserDecryptMultipleValues.sol",
    testFile: "test/basic/UserDecryptMultipleValues.ts",
    difficulty: "beginner",
    concepts: ["decryption", "multiple-values", "permissions"],
    tags: ["decryption", "multiple", "permissions"],
    chapter: "Decryption & Permissions",
  },

  // ===== ACCESS CONTROL CATEGORY =====

  "access-control-fundamentals": {
    name: "access-control-fundamentals",
    title: "Access Control Fundamentals",
    description:
      "Introduction to FHE permission system and why both FHE.allowThis() and FHE.allow() are needed",
    category: "access-control",
    contractFile: "contracts/access-control/AccessControlFundamentals.sol",
    testFile: "test/access-control/AccessControlFundamentals.ts",
    difficulty: "intermediate",
    concepts: ["permissions", "access-control", "fhe-allow", "fhe-allowThis"],
    tags: ["permissions", "access-control", "security"],
    chapter: "Access Control",
    learningObjectives: [
      "Understand contract permissions",
      "Understand user permissions",
      "Why both are necessary",
    ],
  },

  "fhe-allow-usage": {
    name: "fhe-allow-usage",
    title: "FHE.allow() Usage Patterns",
    description: "Demonstrates proper use of FHE.allow() for granting user permissions",
    category: "access-control",
    contractFile: "contracts/access-control/FHEAllowUsage.sol",
    testFile: "test/access-control/FHEAllowUsage.ts",
    difficulty: "intermediate",
    concepts: ["fhe-allow", "user-permissions", "access-control"],
    tags: ["permissions", "user-access"],
    chapter: "Access Control",
  },

  "fhe-allowThis-pattern": {
    name: "fhe-allowThis-pattern",
    title: "FHE.allowThis() Pattern",
    description: "Demonstrates FHE.allowThis() for granting contract permissions",
    category: "access-control",
    contractFile: "contracts/access-control/FHEAllowThisPattern.sol",
    testFile: "test/access-control/FHEAllowThisPattern.ts",
    difficulty: "intermediate",
    concepts: ["fhe-allowThis", "contract-permissions", "access-control"],
    tags: ["permissions", "contract-access"],
    chapter: "Access Control",
  },

  "fhe-allowTransient": {
    name: "fhe-allowTransient",
    title: "FHE.allowTransient() Pattern",
    description:
      "Demonstrates FHE.allowTransient() for temporary transaction-scoped permissions",
    category: "access-control",
    contractFile: "contracts/access-control/FHEAllowTransient.sol",
    testFile: "test/access-control/FHEAllowTransient.ts",
    difficulty: "advanced",
    concepts: ["fhe-allowTransient", "transient-permissions", "temporary-access"],
    tags: ["permissions", "transient"],
    chapter: "Advanced Access Control",
  },

  // ===== ANTI-PATTERNS CATEGORY =====

  "view-function-error": {
    name: "view-function-error",
    title: "View Functions with Encrypted Values",
    description:
      "Demonstrates why view functions cannot use encrypted values and what to do instead",
    category: "anti-patterns",
    contractFile: "contracts/anti-patterns/ViewFunctionError.sol",
    testFile: "test/anti-patterns/ViewFunctionError.ts",
    difficulty: "intermediate",
    concepts: ["anti-patterns", "view-functions", "permissions"],
    tags: ["mistakes", "anti-patterns", "view-functions"],
    chapter: "Common Mistakes",
    learningObjectives: [
      "Understand why view functions don't work with encrypted values",
      "Learn the correct pattern to use instead",
    ],
  },

  "missing-allowThis": {
    name: "missing-allowThis",
    title: "Missing FHE.allowThis() Permission",
    description:
      "Demonstrates the consequences of forgetting FHE.allowThis() and why it's critical",
    category: "anti-patterns",
    contractFile: "contracts/anti-patterns/MissingAllowThis.sol",
    testFile: "test/anti-patterns/MissingAllowThis.ts",
    difficulty: "intermediate",
    concepts: ["anti-patterns", "permissions", "common-mistake"],
    tags: ["mistakes", "permissions", "security"],
    chapter: "Common Mistakes",
  },

  "signer-mismatch": {
    name: "signer-mismatch",
    title: "Encryption/Signer Mismatch",
    description:
      "Demonstrates what happens when encryption signer doesn't match execution signer",
    category: "anti-patterns",
    contractFile: "contracts/anti-patterns/SignerMismatch.sol",
    testFile: "test/anti-patterns/SignerMismatch.ts",
    difficulty: "intermediate",
    concepts: ["anti-patterns", "encryption-binding", "common-mistake"],
    tags: ["mistakes", "binding", "security"],
    chapter: "Common Mistakes",
  },

  "handle-lifecycle-errors": {
    name: "handle-lifecycle-errors",
    title: "Handle Lifecycle Errors",
    description: "Demonstrates incorrect handle usage and lifetime management",
    category: "anti-patterns",
    contractFile: "contracts/anti-patterns/HandleLifecycleErrors.sol",
    testFile: "test/anti-patterns/HandleLifecycleErrors.ts",
    difficulty: "advanced",
    concepts: ["anti-patterns", "handles", "lifecycle"],
    tags: ["mistakes", "advanced", "handles"],
    chapter: "Common Mistakes",
  },

  // ===== OPENZEPPELIN CATEGORY =====

  "erc7984-example": {
    name: "erc7984-example",
    title: "ERC7984 Confidential Token",
    description: "Basic implementation of the ERC7984 confidential token standard",
    category: "openzeppelin",
    contractFile: "contracts/openzeppelin/ERC7984Example.sol",
    testFile: "test/openzeppelin/ERC7984Example.ts",
    difficulty: "advanced",
    concepts: ["tokens", "erc7984", "confidential", "standards"],
    tags: ["tokens", "erc7984", "standards"],
    chapter: "Token Standards",
    learningObjectives: [
      "Understand ERC7984 standard",
      "Implement confidential tokens",
      "Handle encrypted balances",
    ],
  },

  "erc7984-wrapper": {
    name: "erc7984-wrapper",
    title: "ERC7984 to ERC20 Wrapper",
    description: "Convert confidential ERC7984 tokens to standard ERC20 tokens",
    category: "openzeppelin",
    contractFile: "contracts/openzeppelin/ERC7984Wrapper.sol",
    testFile: "test/openzeppelin/ERC7984Wrapper.ts",
    difficulty: "advanced",
    concepts: ["tokens", "erc7984", "erc20", "wrapping"],
    tags: ["tokens", "wrapper", "interoperability"],
    chapter: "Token Patterns",
  },

  "swap-erc7984-erc20": {
    name: "swap-erc7984-erc20",
    title: "Swap ERC7984 to ERC20",
    description: "Atomic swap between confidential and standard tokens",
    category: "openzeppelin",
    contractFile: "contracts/openzeppelin/SwapERC7984ERC20.sol",
    testFile: "test/openzeppelin/SwapERC7984ERC20.ts",
    difficulty: "advanced",
    concepts: ["swaps", "tokens", "erc7984", "erc20"],
    tags: ["tokens", "swaps", "dex"],
    chapter: "Token Patterns",
  },

  "vesting-wallet": {
    name: "vesting-wallet",
    title: "Vesting Wallet with Confidential Tokens",
    description: "Time-locked release of confidential tokens with privacy preservation",
    category: "openzeppelin",
    contractFile: "contracts/openzeppelin/VestingWallet.sol",
    testFile: "test/openzeppelin/VestingWallet.ts",
    difficulty: "advanced",
    concepts: ["vesting", "tokens", "erc7984", "time-lock"],
    tags: ["tokens", "vesting", "time-lock"],
    chapter: "Advanced Patterns",
  },

  // ===== ADVANCED CATEGORY =====

  "blind-auction": {
    name: "blind-auction",
    title: "Blind Auction",
    description: "Sealed-bid auction with confidential bids and private winner determination",
    category: "advanced",
    contractFile: "contracts/advanced/BlindAuction.sol",
    testFile: "test/advanced/BlindAuction.ts",
    difficulty: "advanced",
    concepts: ["auctions", "privacy", "conditional-operations"],
    tags: ["auctions", "advanced", "privacy"],
    chapter: "Advanced Applications",
    learningObjectives: [
      "Understand auction mechanisms",
      "Implement privacy-preserving auctions",
      "Use conditional FHE operations",
    ],
  },

  "confidential-dutch-auction": {
    name: "confidential-dutch-auction",
    title: "Confidential Dutch Auction",
    description: "Dutch auction with encrypted price decay mechanism",
    category: "advanced",
    contractFile: "contracts/advanced/ConfidentialDutchAuction.sol",
    testFile: "test/advanced/ConfidentialDutchAuction.ts",
    difficulty: "advanced",
    concepts: ["auctions", "pricing", "encrypted-operations"],
    tags: ["auctions", "advanced", "pricing"],
    chapter: "Advanced Applications",
  },
};

// ============== CATEGORIES ==============

export const CATEGORIES: Record<string, Category> = {
  basic: {
    name: "basic",
    title: "Basic FHEVM Examples",
    description:
      "Learn fundamental FHEVM operations including encryption, decryption, and arithmetic on encrypted data",
    examples: [
      "fhe-counter",
      "fhe-add",
      "fhe-sub",
      "fhe-eq",
      "encrypt-single-value",
      "encrypt-multiple-values",
      "user-decrypt-single-value",
      "user-decrypt-multiple-values",
    ],
    difficulty: "beginner",
  },

  "access-control": {
    name: "access-control",
    title: "Access Control & Permissions",
    description: "Master the FHE permission system and access control patterns",
    examples: [
      "access-control-fundamentals",
      "fhe-allow-usage",
      "fhe-allowThis-pattern",
      "fhe-allowTransient",
    ],
    difficulty: "intermediate",
  },

  "anti-patterns": {
    name: "anti-patterns",
    title: "Common Mistakes & Anti-patterns",
    description: "Learn what NOT to do and understand why common mistakes fail",
    examples: [
      "view-function-error",
      "missing-allowThis",
      "signer-mismatch",
      "handle-lifecycle-errors",
    ],
    difficulty: "intermediate",
  },

  openzeppelin: {
    name: "openzeppelin",
    title: "OpenZeppelin Confidential Contracts",
    description:
      "Implement confidential tokens and advanced token patterns using ERC7984 standard",
    examples: [
      "erc7984-example",
      "erc7984-wrapper",
      "swap-erc7984-erc20",
      "vesting-wallet",
    ],
    difficulty: "advanced",
  },

  advanced: {
    name: "advanced",
    title: "Advanced FHEVM Applications",
    description: "Real-world applications demonstrating complex privacy-preserving patterns",
    examples: ["blind-auction", "confidential-dutch-auction"],
    difficulty: "advanced",
  },
};

// ============== DIFFICULTY LEVELS ==============

export const DIFFICULTY_LEVELS = {
  beginner: {
    level: 0,
    description: "No prior FHEVM knowledge required",
    estimatedTime: "30-60 minutes",
  },
  intermediate: {
    level: 1,
    description: "Some FHEVM knowledge recommended",
    estimatedTime: "1-2 hours",
  },
  advanced: {
    level: 2,
    description: "Advanced FHEVM knowledge required",
    estimatedTime: "2-4 hours",
  },
};

// ============== EXPORT TYPES ==============

export type ExampleName = keyof typeof EXAMPLES_MAP;
export type CategoryName = keyof typeof CATEGORIES;
export type DifficultyLevel = "beginner" | "intermediate" | "advanced";

// ============== HELPER FUNCTIONS ==============

/**
 * Get all examples in a category
 */
export function getExamplesInCategory(
  categoryName: CategoryName
): ExampleConfig[] {
  const category = CATEGORIES[categoryName];
  return category.examples.map((name) => EXAMPLES_MAP[name]);
}

/**
 * Get examples by difficulty level
 */
export function getExamplesByDifficulty(
  difficulty: DifficultyLevel
): ExampleConfig[] {
  return Object.values(EXAMPLES_MAP).filter((example) => example.difficulty === difficulty);
}

/**
 * Search examples by tag
 */
export function getExamplesByTag(tag: string): ExampleConfig[] {
  return Object.values(EXAMPLES_MAP).filter((example) =>
    example.tags.includes(tag.toLowerCase())
  );
}

/**
 * Get all unique tags across examples
 */
export function getAllTags(): string[] {
  const tags = new Set<string>();
  Object.values(EXAMPLES_MAP).forEach((example) => {
    example.tags.forEach((tag) => tags.add(tag));
  });
  return Array.from(tags).sort();
}

/**
 * Get all examples (returns array)
 */
export function getAllExamples(): ExampleConfig[] {
  return Object.values(EXAMPLES_MAP);
}

/**
 * Validate that all referenced examples exist
 */
export function validateConfiguration(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check categories reference valid examples
  for (const [categoryName, category] of Object.entries(CATEGORIES)) {
    for (const exampleName of category.examples) {
      if (!EXAMPLES_MAP[exampleName]) {
        errors.push(
          `Category '${categoryName}' references non-existent example '${exampleName}'`
        );
      }
    }
  }

  // Check examples reference valid categories
  for (const [exampleName, example] of Object.entries(EXAMPLES_MAP)) {
    if (!CATEGORIES[example.category]) {
      errors.push(
        `Example '${exampleName}' references non-existent category '${example.category}'`
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// Export configuration
export default {
  EXAMPLES_MAP,
  CATEGORIES,
  DIFFICULTY_LEVELS,
  getExamplesInCategory,
  getExamplesByDifficulty,
  getExamplesByTag,
  getAllTags,
  getAllExamples,
  validateConfiguration,
};
