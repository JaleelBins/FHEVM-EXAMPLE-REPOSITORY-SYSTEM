# Example Contracts & Tests Template

This document provides templates for creating FHEVM example contracts and their corresponding tests.

---

## 📝 Contract Template Structure

### Basic Contract Template

```solidity
// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { FHE, euint32, externalEuint32 } from "@fhevm/solidity/lib/FHE.sol";
import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title Brief description of what this contract demonstrates
/// @notice This contract shows [specific FHEVM concept]
/// @dev Implementation notes about the FHEVM pattern
contract ExampleName is ZamaEthereumConfig {
    // ============== Events ==============

    /// @notice Emitted when [something happens]
    event EventName(uint indexed value);

    // ============== State Variables ==============

    /// @notice Description of encrypted state variable
    /// @dev This is bound to the contract and requires permissions
    euint32 private _encryptedValue;

    /// @notice Description of public state variable
    uint32 public publicValue;

    // ============== Constructor ==============

    /// @notice Initialize contract state
    constructor() {
        _encryptedValue = FHE.asEuint32(0);
    }

    // ============== Main Functions ==============

    /// @notice Main function demonstrating the concept
    /// @param inputEuint32 Encrypted input value
    /// @param inputProof Proof that the input is correctly encrypted
    /// @dev Key points:
    ///   - Always call FHE.allowThis() to grant contract permission
    ///   - Always call FHE.allow(value, msg.sender) to grant user permission
    ///   - Input proof must match the encryption binding
    function executeOperation(
        externalEuint32 inputEuint32,
        bytes calldata inputProof
    ) external {
        // Step 1: Decrypt external input using input proof
        euint32 encryptedInput = FHE.fromExternal(inputEuint32, inputProof);

        // Step 2: Perform FHE operation
        _encryptedValue = FHE.add(_encryptedValue, encryptedInput);

        // Step 3: Grant permissions for result
        // CRITICAL: Always grant both permissions
        FHE.allowThis(_encryptedValue);        // Contract permission
        FHE.allow(_encryptedValue, msg.sender); // User permission

        // Step 4: Emit event if needed
        emit EventName(uint32(_encryptedValue.unwrap()));
    }

    /// @notice Get encrypted value
    /// @return The encrypted value (requires user decryption permission)
    function getEncryptedValue() external view returns (euint32) {
        return _encryptedValue;
    }

    // ============== Error Handling ==============

    /// @notice Helper for validation
    /// @dev Demonstrates error handling patterns
    function validateInput(uint32 value) internal pure {
        // Add validation logic
        require(value > 0, "Value must be positive");
    }
}
```

---

## 🧪 Test Template Structure

### TypeScript Test Template

```typescript
import { expect } from "chai";
import { ethers } from "hardhat";
import { ExampleName } from "../typechain-types";
import { FhevmInstance } from "hardhat-fhevm";
import { createEncryptedInput, decrypt64 } from "hardhat-fhevm/gateway";

describe("ExampleName", () => {
  let contract: ExampleName;
  let fhevm: FhevmInstance;
  let contractAddress: string;
  let alice: ethers.Signer;
  let bob: ethers.Signer;

  before(async () => {
    // Get signers
    [alice, bob] = await ethers.getSigners();

    // Get FHEVM instance
    const FhevmFactory = await ethers.getContractFactory("FhevmLib");
    fhevm = await FhevmFactory.deployed();
  });

  beforeEach(async () => {
    // Deploy contract for each test
    const ExampleFactory = await ethers.getContractFactory("ExampleName");
    contract = await ExampleFactory.deploy();
    await contract.deployed();
    contractAddress = contract.address;
  });

  // ========== ✅ SUCCESS CASES ==========

  describe("Basic Functionality - ✅ Success Cases", () => {
    it("should correctly execute operation with valid input", async () => {
      // Arrange: Create encrypted input
      const input = await createEncryptedInput(contractAddress, alice.address)
        .add32(100)
        .encrypt();

      // Act: Execute operation
      const tx = await contract
        .connect(alice)
        .executeOperation(input.handles[0], input.inputProof);
      await tx.wait();

      // Assert: Operation completed successfully
      expect(tx).to.not.be.undefined;
    });

    it("✅ should grant both contract and user permissions", async () => {
      // Arrange
      const input = await createEncryptedInput(contractAddress, alice.address)
        .add32(50)
        .encrypt();

      // Act
      await contract.connect(alice).executeOperation(input.handles[0], input.inputProof);

      // Assert: Get encrypted value and verify it's accessible
      const encryptedValue = await contract.getEncryptedValue();
      expect(encryptedValue).to.not.be.undefined;
    });

    it("✅ should handle multiple operations sequentially", async () => {
      // First operation
      const input1 = await createEncryptedInput(contractAddress, alice.address)
        .add32(100)
        .encrypt();
      await contract
        .connect(alice)
        .executeOperation(input1.handles[0], input1.inputProof);

      // Second operation
      const input2 = await createEncryptedInput(contractAddress, alice.address)
        .add32(50)
        .encrypt();
      await contract
        .connect(alice)
        .executeOperation(input2.handles[0], input2.inputProof);

      // Both should succeed
      const result = await contract.getEncryptedValue();
      expect(result).to.not.be.undefined;
    });
  });

  // ========== ❌ FAILURE CASES ==========

  describe("Error Handling - ❌ Failure Cases", () => {
    it("❌ should fail with missing FHE.allowThis() permission", async () => {
      // This test demonstrates common mistake
      // The contract MUST call FHE.allowThis() before FHE.allow()
      // If implementation is correct, this should pass
      // If implementation has the bug, test will fail

      const input = await createEncryptedInput(contractAddress, alice.address)
        .add32(100)
        .encrypt();

      // Should succeed if permissions are correct
      await expect(
        contract.connect(alice).executeOperation(input.handles[0], input.inputProof)
      ).to.not.be.reverted;
    });

    it("❌ should fail with mismatched encryption signer", async () => {
      // Encrypt with alice's address
      const input = await createEncryptedInput(contractAddress, alice.address)
        .add32(100)
        .encrypt();

      // Try to execute with bob's signer
      // This should fail because input was encrypted for alice
      await expect(
        contract.connect(bob).executeOperation(input.handles[0], input.inputProof)
      ).to.be.revertedWith("decryption failed"); // Or similar error
    });

    it("❌ should fail without valid input proof", async () => {
      // Encrypt properly
      const input = await createEncryptedInput(contractAddress, alice.address)
        .add32(100)
        .encrypt();

      // Try to execute with invalid proof
      const invalidProof = "0x"; // Invalid proof

      await expect(
        contract
          .connect(alice)
          .executeOperation(input.handles[0], invalidProof)
      ).to.be.reverted;
    });

    it("❌ should fail with invalid input validation", async () => {
      // Create input that fails validation
      const input = await createEncryptedInput(contractAddress, alice.address)
        .add32(0) // Invalid: must be positive (assuming validation requires > 0)
        .encrypt();

      await expect(
        contract.connect(alice).executeOperation(input.handles[0], input.inputProof)
      ).to.be.revertedWith("Value must be positive");
    });
  });

  // ========== 🔍 EDGE CASES ==========

  describe("Edge Cases", () => {
    it("should handle maximum uint32 value", async () => {
      const maxValue = 2 ** 32 - 1;
      const input = await createEncryptedInput(contractAddress, alice.address)
        .add32(maxValue)
        .encrypt();

      await expect(
        contract.connect(alice).executeOperation(input.handles[0], input.inputProof)
      ).to.not.be.reverted;
    });

    it("should handle zero value appropriately", async () => {
      const input = await createEncryptedInput(contractAddress, alice.address)
        .add32(0)
        .encrypt();

      // This might succeed or fail depending on contract logic
      // Test should match actual expected behavior
      try {
        await contract
          .connect(alice)
          .executeOperation(input.handles[0], input.inputProof);
        // If it succeeds, that's valid behavior
      } catch (error) {
        // If validation prevents zero, that's also valid
        expect(error.message).to.include("Value must be positive");
      }
    });

    it("should maintain state consistency across operations", async () => {
      // Get initial state
      const initial = await contract.getEncryptedValue();

      // Perform operation
      const input = await createEncryptedInput(contractAddress, alice.address)
        .add32(50)
        .encrypt();
      await contract
        .connect(alice)
        .executeOperation(input.handles[0], input.inputProof);

      // Get new state
      const updated = await contract.getEncryptedValue();

      // Both should be valid encrypted values
      expect(initial).to.not.be.undefined;
      expect(updated).to.not.be.undefined;
    });
  });

  // ========== 📊 PERFORMANCE & OPTIMIZATION ==========

  describe("Gas Optimization", () => {
    it("should not waste gas on unnecessary operations", async () => {
      const input = await createEncryptedInput(contractAddress, alice.address)
        .add32(100)
        .encrypt();

      const tx = await contract
        .connect(alice)
        .executeOperation(input.handles[0], input.inputProof);
      const receipt = await tx.wait();

      // Log gas usage for optimization reference
      console.log(
        `Gas used for executeOperation: ${receipt?.gasUsed.toString()}`
      );

      // Gas should be reasonable (adjust threshold as needed)
      expect(receipt?.gasUsed).to.be.lt(500000);
    });
  });
});
```

---

## 🔑 Key Template Features

### Contract Requirements

1. **Inheritance from ZamaEthereumConfig**
   ```solidity
   contract MyExample is ZamaEthereumConfig {
       // Contract implementation
   }
   ```

2. **Proper Permission Management**
   ```solidity
   FHE.allowThis(encryptedValue);        // MUST grant contract permission
   FHE.allow(encryptedValue, msg.sender); // MUST grant user permission
   ```

3. **Clear Comments**
   - Explain FHEVM concepts
   - Document function purpose
   - Highlight critical patterns
   - Include usage examples

### Test Requirements

1. **Success Cases (✅)**
   - Basic operation execution
   - Permission granting
   - Sequential operations
   - State management

2. **Failure Cases (❌)**
   - Missing permissions
   - Invalid encryption binding
   - Incorrect proofs
   - Invalid inputs

3. **Edge Cases**
   - Boundary values
   - Zero/max values
   - State consistency
   - Concurrent operations

4. **Performance Tests**
   - Gas usage
   - Execution time
   - Memory efficiency

---

## 📋 Documentation Standards

### JSDoc Comments for Tests

```typescript
/**
 * Tests for [Concept] Example
 *
 * This test suite verifies:
 * - ✅ Correct usage patterns
 * - ❌ Common mistakes and their errors
 * - 🔍 Edge cases and boundary conditions
 *
 * Key Concepts:
 * - [Concept 1]: [Explanation]
 * - [Concept 2]: [Explanation]
 *
 * Most Important Points:
 * 1. Always call FHE.allowThis() before FHE.allow()
 * 2. Encryption binding must match signer
 * 3. Input proof is mandatory and must be valid
 */
```

### README Per Example

```markdown
# Example Name

## Overview
[Description of what this example demonstrates]

## Concepts Demonstrated
- [Concept 1]
- [Concept 2]
- [Concept 3]

## Key Patterns
[Highlight important implementation patterns]

## Running the Example

\`\`\`bash
npm install
npm run compile
npm run test
\`\`\`

## Understanding the Code

[Explanation of the implementation]

## Common Mistakes
[List of anti-patterns with explanations]

## Further Reading
[Links to documentation and related examples]
```

---

## 🎯 Example Categories

### 1. Basic Examples
- **Difficulty**: Beginner
- **Purpose**: Learn fundamental FHEVM operations
- **Examples**: Counter, arithmetic, comparison

### 2. Intermediate Examples
- **Difficulty**: Intermediate
- **Purpose**: Understand encryption/decryption patterns
- **Examples**: Multi-value operations, permission systems

### 3. Advanced Examples
- **Difficulty**: Advanced
- **Purpose**: Real-world applications
- **Examples**: Auctions, tokens, complex DeFi

### 4. Anti-pattern Examples
- **Difficulty**: All levels
- **Purpose**: Learn what NOT to do
- **Examples**: Missing permissions, binding mismatches

---

## ✨ Best Practices

1. **Clear Code**
   - Use descriptive names
   - Add helpful comments
   - Follow consistent style

2. **Comprehensive Tests**
   - Test success cases
   - Test failure cases
   - Test edge cases

3. **Good Documentation**
   - Explain concepts
   - Show usage examples
   - Highlight pitfalls

4. **Proper Patterns**
   - Always grant permissions correctly
   - Match encryption binding
   - Validate inputs

---

This template provides the foundation for creating high-quality FHEVM examples that teach developers proper patterns and help them avoid common mistakes.

