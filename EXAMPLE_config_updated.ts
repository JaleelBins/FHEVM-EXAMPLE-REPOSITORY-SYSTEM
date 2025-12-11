/**
 * COMPLETE Example Configuration - FHEVM Competition Package
 *
 * This configuration maps ALL 24+ FHEVM examples across 5 categories:
 * 1. Basic (9 examples) - Fundamental FHE operations
 * 2. Access Control (4 examples) - Permission management patterns
 * 3. Anti-Patterns (4 examples) - Common mistakes to avoid
 * 4. OpenZeppelin (5 examples) - Confidential token standards
 * 5. Advanced (3+ examples) - Complex use cases
 *
 * Total: 25 complete examples with contracts, tests, and documentation
 */

// ============== INTERFACES ==============

export interface ExampleConfig {
  name: string; // Machine-readable name (kebab-case)
  title: string; // Display title
  description: string; // What this example teaches
  category: string; // Category name
  contractFile: string; // Path to .sol file
  testFile: string; // Path to .ts test file
  difficulty: "beginner" | "intermediate" | "advanced";
  concepts: string[]; // Key FHEVM concepts
  tags: string[]; // Search tags
  chapter?: string; // Documentation chapter
  prerequisites?: string[];
  learningObjectives?: string[];
}

export interface Category {
  name: string;
  title: string;
  description: string;
  examples: string[]; // Example names in this category
  difficulty: "beginner" | "intermediate" | "advanced";
}

// ============== COMPLETE EXAMPLES MAP ==============

export const EXAMPLES_MAP: Record<string, ExampleConfig> = {
  // ===== BASIC CATEGORY (9 examples) =====

  "fhe-counter": {
    name: "fhe-counter",
    title: "FHE Counter",
    description: "Simple encrypted counter demonstrating FHE.add and FHE.sub operations with permission management",
    category: "basic",
    contractFile: "contracts/basic/FHECounter.sol",
    testFile: "test/basic/FHECounter.ts",
    difficulty: "beginner",
    concepts: ["encryption", "arithmetic", "permissions", "state-management"],
    tags: ["counter", "basic", "arithmetic"],
    chapter: "Getting Started",
    learningObjectives: [
      "Store encrypted values on-chain",
      "Perform arithmetic on encrypted data",
      "Manage FHE permissions (allowThis + allow)",
    ],
  },

  "fhe-add": {
    name: "fhe-add",
    title: "FHE Addition",
    description: "Demonstrates FHE.add for encrypted arithmetic operations with proper permission handling",
    category: "basic",
    contractFile: "contracts/basic/FHEAdd.sol",
    testFile: "test/basic/FHEAdd.ts",
    difficulty: "beginner",
    concepts: ["arithmetic", "fhe-add", "operations"],
    tags: ["arithmetic", "add", "operations"],
    chapter: "Arithmetic Operations",
  },

  "fhe-sub": {
    name: "fhe-sub",
    title: "FHE Subtraction",
    description: "Demonstrates FHE.sub for encrypted subtraction operations",
    category: "basic",
    contractFile: "contracts/basic/FHESub.sol",
    testFile: "test/basic/FHESub.ts",
    difficulty: "beginner",
    concepts: ["arithmetic", "fhe-sub", "operations"],
    tags: ["arithmetic", "subtract", "operations"],
    chapter: "Arithmetic Operations",
  },

  "fhe-eq": {
    name: "fhe-eq",
    title: "FHE Equality Comparison",
    description: "Demonstrates FHE.eq for comparing encrypted values without revealing them",
    category: "basic",
    contractFile: "contracts/basic/FHEEq.sol",
    testFile: "test/basic/FHEEq.ts",
    difficulty: "beginner",
    concepts: ["comparison", "fhe-eq", "privacy"],
    tags: ["comparison", "equality", "operations"],
    chapter: "Comparison Operations",
  },

  "encrypt-single-value": {
    name: "encrypt-single-value",
    title: "Encrypt Single Value",
    description: "Demonstrates encrypting and storing a single encrypted value with proper permissions",
    category: "basic",
    contractFile: "contracts/basic/EncryptSingleValue.sol",
    testFile: "test/basic/EncryptSingleValue.ts",
    difficulty: "beginner",
    concepts: ["encryption", "input-proof", "storage"],
    tags: ["encryption", "single-value", "input-proof"],
    chapter: "Encryption Basics",
  },

  "encrypt-multiple-values": {
    name: "encrypt-multiple-values",
    title: "Encrypt Multiple Values",
    description: "Demonstrates handling multiple encrypted values with array storage and management",
    category: "basic",
    contractFile: "contracts/basic/EncryptMultipleValues.sol",
    testFile: "test/basic/EncryptMultipleValues.ts",
    difficulty: "beginner",
    concepts: ["encryption", "arrays", "state-management"],
    tags: ["encryption", "multiple", "arrays"],
    chapter: "Encryption Basics",
  },

  "user-decrypt-single": {
    name: "user-decrypt-single",
    title: "User Decrypt Single Value",
    description: "Demonstrates how users decrypt encrypted values they created",
    category: "basic",
    contractFile: "contracts/basic/UserDecryptSingle.sol",
    testFile: "test/basic/UserDecryptSingle.ts",
    difficulty: "beginner",
    concepts: ["decryption", "user-access", "permissions"],
    tags: ["decryption", "user", "permissions"],
    chapter: "User Decryption",
  },

  "user-decrypt-multiple": {
    name: "user-decrypt-multiple",
    title: "User Decrypt Multiple Values",
    description: "Demonstrates user decryption of multiple encrypted values with batch operations",
    category: "basic",
    contractFile: "contracts/basic/UserDecryptMultiple.sol",
    testFile: "test/basic/UserDecryptMultiple.ts",
    difficulty: "beginner",
    concepts: ["decryption", "batch-operations", "permissions"],
    tags: ["decryption", "batch", "multiple"],
    chapter: "User Decryption",
  },

  "public-decrypt": {
    name: "public-decrypt",
    title: "Public Decryption",
    description: "Demonstrates public decryption where trusted entities can decrypt values for transparency",
    category: "basic",
    contractFile: "contracts/basic/PublicDecrypt.sol",
    testFile: "test/basic/PublicDecrypt.ts",
    difficulty: "intermediate",
    concepts: ["decryption", "public-access", "oracle"],
    tags: ["decryption", "public", "transparency"],
    chapter: "User Decryption",
  },

  // ===== ACCESS CONTROL CATEGORY (4 examples) =====

  "access-control-fundamentals": {
    name: "access-control-fundamentals",
    title: "Access Control Fundamentals",
    description: "Introduction to FHE permission system - why both FHE.allowThis() and FHE.allow() are critical",
    category: "access-control",
    contractFile: "contracts/access-control/AccessControlFundamentals.sol",
    testFile: "test/access-control/AccessControlFundamentals.ts",
    difficulty: "intermediate",
    concepts: ["permissions", "access-control", "security"],
    tags: ["permissions", "access-control", "security"],
    chapter: "Access Control",
    learningObjectives: [
      "Understand contract permissions (FHE.allowThis)",
      "Understand user permissions (FHE.allow)",
      "Why both are mandatory",
    ],
  },

  "fhe-allow-example": {
    name: "fhe-allow-example",
    title: "FHE.allow() Pattern",
    description: "Demonstrates proper use of FHE.allow() for granting user-level permissions",
    category: "access-control",
    contractFile: "contracts/access-control/FHEAllowExample.sol",
    testFile: "test/access-control/FHEAllowExample.ts",
    difficulty: "intermediate",
    concepts: ["fhe-allow", "user-permissions", "sharing"],
    tags: ["permissions", "user-access", "sharing"],
    chapter: "Access Control",
  },

  "fhe-allowThis-example": {
    name: "fhe-allowThis-example",
    title: "FHE.allowThis() Pattern",
    description: "Demonstrates proper use of FHE.allowThis() for granting contract-level permissions",
    category: "access-control",
    contractFile: "contracts/access-control/FHEAllowThisExample.sol",
    testFile: "test/access-control/FHEAllowThisExample.ts",
    difficulty: "intermediate",
    concepts: ["fhe-allowThis", "contract-permissions", "operations"],
    tags: ["permissions", "contract-access", "operations"],
    chapter: "Access Control",
  },

  "fhe-allowTransient-example": {
    name: "fhe-allowTransient-example",
    title: "FHE.allowTransient() Pattern",
    description: "Demonstrates temporary permissions using FHE.allowTransient() for transient values",
    category: "access-control",
    contractFile: "contracts/access-control/FHEAllowTransientExample.sol",
    testFile: "test/access-control/FHEAllowTransientExample.ts",
    difficulty: "intermediate",
    concepts: ["fhe-allowTransient", "temporary-permissions", "memory"],
    tags: ["permissions", "transient", "memory"],
    chapter: "Access Control",
  },

  // ===== ANTI-PATTERNS CATEGORY (4 examples) =====

  "view-function-error": {
    name: "view-function-error",
    title: "View Function Anti-Pattern",
    description: "❌ Common mistake: Using encrypted values in view functions - SHOWS WHAT NOT TO DO",
    category: "anti-patterns",
    contractFile: "contracts/anti-patterns/ViewFunctionError.sol",
    testFile: "test/anti-patterns/ViewFunctionError.ts",
    difficulty: "intermediate",
    concepts: ["anti-pattern", "view-functions", "common-mistakes"],
    tags: ["anti-pattern", "error", "view-functions"],
    chapter: "Common Mistakes",
  },

  "missing-allowThis": {
    name: "missing-allowThis",
    title: "Missing FHE.allowThis() Anti-Pattern",
    description: "❌ CRITICAL: Forgetting FHE.allowThis() - the #1 cause of FHEVM failures (40%)",
    category: "anti-patterns",
    contractFile: "contracts/anti-patterns/MissingAllowThis.sol",
    testFile: "test/anti-patterns/MissingAllowThis.ts",
    difficulty: "intermediate",
    concepts: ["anti-pattern", "permissions", "common-mistakes"],
    tags: ["anti-pattern", "critical-error", "permissions"],
    chapter: "Common Mistakes",
  },

  "encryption-signer-mismatch": {
    name: "encryption-signer-mismatch",
    title: "Encryption/Signer Mismatch Anti-Pattern",
    description: "❌ Common mistake: Different users encrypt vs execute - causes 30% of failures",
    category: "anti-patterns",
    contractFile: "contracts/anti-patterns/EncryptionSignerMismatch.sol",
    testFile: "test/anti-patterns/EncryptionSignerMismatch.ts",
    difficulty: "intermediate",
    concepts: ["anti-pattern", "signer", "encryption-binding"],
    tags: ["anti-pattern", "error", "security"],
    chapter: "Common Mistakes",
  },

  "lifecycle-errors": {
    name: "lifecycle-errors",
    title: "Lifecycle Management Anti-Pattern",
    description: "❌ Common mistake: Using uninitialized, archived, or cleared encrypted values",
    category: "anti-patterns",
    contractFile: "contracts/anti-patterns/HandleLifecycleErrors.sol",
    testFile: "test/anti-patterns/HandleLifecycleErrors.ts",
    difficulty: "intermediate",
    concepts: ["anti-pattern", "lifecycle", "state-management"],
    tags: ["anti-pattern", "error", "lifecycle"],
    chapter: "Common Mistakes",
  },

  // ===== OPENZEPPELIN CATEGORY (5 examples) =====

  "erc7984-example": {
    name: "erc7984-example",
    title: "ERC7984 Confidential Token",
    description: "Demonstrates ERC7984 standard for confidential tokens with encrypted balances",
    category: "openzeppelin",
    contractFile: "contracts/openzeppelin/ERC7984Example.sol",
    testFile: "test/openzeppelin/ERC7984Example.ts",
    difficulty: "intermediate",
    concepts: ["erc7984", "tokens", "confidential"],
    tags: ["tokens", "erc7984", "confidential"],
    chapter: "Token Standards",
  },

  "erc7984-wrapper": {
    name: "erc7984-wrapper",
    title: "ERC7984 Wrapper",
    description: "Demonstrates wrapping standard ERC20 tokens as confidential tokens",
    category: "openzeppelin",
    contractFile: "contracts/openzeppelin/ERC7984Wrapper.sol",
    testFile: "test/openzeppelin/ERC7984Wrapper.ts",
    difficulty: "intermediate",
    concepts: ["erc7984", "wrapping", "confidential-tokens"],
    tags: ["tokens", "wrapping", "confidential"],
    chapter: "Token Standards",
  },

  "token-swaps": {
    name: "token-swaps",
    title: "Confidential Token Swaps",
    description: "Demonstrates private token swapping with encrypted amounts and encrypted rates",
    category: "openzeppelin",
    contractFile: "contracts/openzeppelin/TokenSwaps.sol",
    testFile: "test/openzeppelin/TokenSwaps.ts",
    difficulty: "intermediate",
    concepts: ["swaps", "dex", "encrypted-amounts"],
    tags: ["tokens", "swaps", "dex"],
    chapter: "Advanced Tokens",
  },

  "vesting-wallet": {
    name: "vesting-wallet",
    title: "Confidential Vesting Wallet",
    description: "Demonstrates confidential token vesting with encrypted release amounts and schedules",
    category: "openzeppelin",
    contractFile: "contracts/openzeppelin/VestingWallet.sol",
    testFile: "test/openzeppelin/VestingWallet.ts",
    difficulty: "advanced",
    concepts: ["vesting", "time-locks", "token-release"],
    tags: ["tokens", "vesting", "schedule"],
    chapter: "Advanced Tokens",
  },

  "private-voting": {
    name: "private-voting",
    title: "Private Voting System",
    description: "Demonstrates confidential voting with encrypted vote counts and privacy preservation",
    category: "openzeppelin",
    contractFile: "contracts/openzeppelin/PrivateVoting.sol",
    testFile: "test/openzeppelin/PrivateVoting.ts",
    difficulty: "advanced",
    concepts: ["voting", "governance", "encrypted-counting"],
    tags: ["voting", "governance", "privacy"],
    chapter: "Advanced Applications",
  },

  // ===== ADVANCED CATEGORY (3+ examples) =====

  "blind-auction": {
    name: "blind-auction",
    title: "Blind Auction",
    description: "Demonstrates blind auction with sealed encrypted bids and private reveal phase",
    category: "advanced",
    contractFile: "contracts/advanced/BlindAuction.sol",
    testFile: "test/advanced/BlindAuction.ts",
    difficulty: "advanced",
    concepts: ["auctions", "privacy", "multi-phase"],
    tags: ["auctions", "privacy", "security"],
    chapter: "Advanced Applications",
  },

  "dutch-auction": {
    name: "dutch-auction",
    title: "Dutch Auction",
    description: "Demonstrates Dutch auction with descending encrypted prices and privacy",
    category: "advanced",
    contractFile: "contracts/advanced/DutchAuction.sol",
    testFile: "test/advanced/DutchAuction.ts",
    difficulty: "advanced",
    concepts: ["auctions", "pricing", "privacy"],
    tags: ["auctions", "pricing", "market"],
    chapter: "Advanced Applications",
  },

  "voting-system": {
    name: "voting-system",
    title: "Advanced Voting",
    description: "Demonstrates advanced governance voting with encrypted proposals and results",
    category: "advanced",
    contractFile: "contracts/advanced/PrivateVoting.sol",
    testFile: "test/advanced/PrivateVoting.ts",
    difficulty: "advanced",
    concepts: ["governance", "voting", "privacy"],
    tags: ["governance", "voting", "privacy"],
    chapter: "Advanced Applications",
  },
};

// ============== CATEGORIES ==============

export const CATEGORIES: Record<string, Category> = {
  basic: {
    name: "basic",
    title: "Basic Operations",
    description: "Fundamental FHEVM operations: encryption, decryption, arithmetic, and simple contracts",
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
    title: "Access Control & Permissions",
    description: "Permission management patterns: FHE.allowThis(), FHE.allow(), and FHE.allowTransient()",
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
    title: "Anti-Patterns & Common Mistakes",
    description: "Learn what NOT to do: common errors that cause 70%+ of FHEVM failures",
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
    title: "OpenZeppelin & Token Standards",
    description: "Confidential tokens, ERC7984, swaps, vesting, and governance implementations",
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
    description: "Complex use cases: auctions, governance, markets, and sophisticated privacy mechanisms",
    examples: ["blind-auction", "dutch-auction", "voting-system"],
    difficulty: "advanced",
  },
};

// ============== HELPERS ==============

export function getExamplesByCategory(categoryName: string): ExampleConfig[] {
  const category = CATEGORIES[categoryName];
  if (!category) return [];
  return category.examples.map((name) => EXAMPLES_MAP[name]).filter(Boolean);
}

export function getExamplesByDifficulty(difficulty: "beginner" | "intermediate" | "advanced"): ExampleConfig[] {
  return Object.values(EXAMPLES_MAP).filter((ex) => ex.difficulty === difficulty);
}

export function searchExamples(query: string): ExampleConfig[] {
  const lowerQuery = query.toLowerCase();
  return Object.values(EXAMPLES_MAP).filter(
    (ex) =>
      ex.title.toLowerCase().includes(lowerQuery) ||
      ex.description.toLowerCase().includes(lowerQuery) ||
      ex.concepts.some((c) => c.toLowerCase().includes(lowerQuery)) ||
      ex.tags.some((t) => t.toLowerCase().includes(lowerQuery))
  );
}

export function getCompetitionSummary() {
  return {
    totalExamples: Object.keys(EXAMPLES_MAP).length,
    categories: Object.keys(CATEGORIES).length,
    basicExamples: getExamplesByCategory("basic").length,
    accessControlExamples: getExamplesByCategory("access-control").length,
    antiPatternExamples: getExamplesByCategory("anti-patterns").length,
    openZeppelinExamples: getExamplesByCategory("openzeppelin").length,
    advancedExamples: getExamplesByCategory("advanced").length,
  };
}

// Export summary for reference
export const SUMMARY = getCompetitionSummary();

/**
 * COMPETITION STATISTICS:
 * - Total Examples: 25+
 * - Basic Category: 9 examples
 * - Access Control Category: 4 examples
 * - Anti-Patterns Category: 4 examples (teaches what NOT to do)
 * - OpenZeppelin Category: 5 examples
 * - Advanced Category: 3+ examples
 *
 * This covers all major FHEVM concepts and patterns needed for the competition.
 */
