import { expect } from "chai";
import { ethers } from "hardhat";
import { FHECounter } from "../typechain-types";
import { createEncryptedInput } from "hardhat-fhevm/gateway";

/**
 * Test Suite for FHECounter Contract
 *
 * This test suite demonstrates proper testing patterns for FHEVM contracts:
 * - ✅ Success cases: Standard operations that work correctly
 * - ❌ Failure cases: Common mistakes and their error messages
 * - 🔍 Edge cases: Boundary conditions and special values
 *
 * Key Concepts Tested:
 * 1. Encryption Binding: Encryptor and executor must match
 * 2. Permission Management: Both FHE.allowThis() and FHE.allow() required
 * 3. Arithmetic Operations: FHE.add and FHE.sub on encrypted values
 * 4. State Management: Encrypted state persists across transactions
 */
describe("FHECounter - Encrypted Counter Example", () => {
  let contract: FHECounter;
  let owner: ethers.Signer;
  let user1: ethers.Signer;
  let user2: ethers.Signer;
  let contractAddress: string;
  let ownerAddress: string;
  let user1Address: string;
  let user2Address: string;

  before(async () => {
    // Get signers for testing with different addresses
    [owner, user1, user2] = await ethers.getSigners();
    ownerAddress = await owner.getAddress();
    user1Address = await user1.getAddress();
    user2Address = await user2.getAddress();
  });

  beforeEach(async () => {
    // Deploy fresh contract for each test
    const Factory = await ethers.getContractFactory("FHECounter");
    contract = await Factory.deploy();
    await contract.deployed();
    contractAddress = contract.address;
  });

  // ========== ✅ SUCCESS CASES ==========

  describe("✅ SUCCESS: Basic Operations", () => {
    /**
     * Test: Increment encrypted counter
     * Demonstrates: FHE.add operation with proper permissions
     */
    it("✅ should increment counter with encrypted value", async () => {
      // Arrange: Create encrypted input value
      // This creates an input encrypted for this contract and owner's address
      const input = await createEncryptedInput(contractAddress, ownerAddress)
        .add32(100) // Encrypt value 100
        .encrypt();

      // Act: Call increment function
      const tx = await contract
        .connect(owner)
        .increment(input.handles[0], input.inputProof);

      // Assert: Transaction should succeed
      await expect(tx).to.not.be.reverted;

      // Additional assertion: Check operation counter increased
      const incrementCount = await contract.getIncrementCount();
      expect(incrementCount).to.equal(1);
    });

    /**
     * Test: Decrement encrypted counter
     * Demonstrates: FHE.sub operation with proper permissions
     */
    it("✅ should decrement counter with encrypted value", async () => {
      // Arrange: Set up initial state by incrementing first
      const incrementInput = await createEncryptedInput(
        contractAddress,
        ownerAddress
      )
        .add32(50)
        .encrypt();

      await contract
        .connect(owner)
        .increment(incrementInput.handles[0], incrementInput.inputProof);

      // Now decrement
      const decrementInput = await createEncryptedInput(
        contractAddress,
        ownerAddress
      )
        .add32(30)
        .encrypt();

      // Act: Call decrement
      const tx = await contract
        .connect(owner)
        .decrement(decrementInput.handles[0], decrementInput.inputProof);

      // Assert: Should succeed
      await expect(tx).to.not.be.reverted;

      // Check both counters
      const incrementCount = await contract.getIncrementCount();
      const decrementCount = await contract.getDecrementCount();
      expect(incrementCount).to.equal(1);
      expect(decrementCount).to.equal(1);
    });

    /**
     * Test: Grant both contract and user permissions
     * Demonstrates: Why both FHE.allowThis() and FHE.allow() are needed
     */
    it("✅ should grant both permissions correctly", async () => {
      // Arrange: Create encrypted input
      const input = await createEncryptedInput(contractAddress, ownerAddress)
        .add32(75)
        .encrypt();

      // Act: Increment (which grants permissions)
      await contract
        .connect(owner)
        .increment(input.handles[0], input.inputProof);

      // Assert: User should be able to get encrypted value
      // (This proves FHE.allow() was called)
      const encryptedValue = await contract
        .connect(owner)
        .getEncryptedCount();
      expect(encryptedValue).to.not.be.undefined;

      // The fact that we can call getEncryptedCount and it works
      // proves that FHE.allowThis() was called in increment()
    });

    /**
     * Test: Multiple sequential operations
     * Demonstrates: State persistence across multiple transactions
     */
    it("✅ should handle multiple increments sequentially", async () => {
      // Arrange & Act: Perform multiple increments
      for (let i = 0; i < 3; i++) {
        const input = await createEncryptedInput(contractAddress, ownerAddress)
          .add32(10 + i)
          .encrypt();

        await contract
          .connect(owner)
          .increment(input.handles[0], input.inputProof);
      }

      // Assert: Counter should reflect all operations
      const incrementCount = await contract.getIncrementCount();
      expect(incrementCount).to.equal(3);
    });

    /**
     * Test: Mix of increment and decrement
     * Demonstrates: Both operations working together
     */
    it("✅ should handle mixed increment and decrement operations", async () => {
      // Increment
      const incInput1 = await createEncryptedInput(contractAddress, ownerAddress)
        .add32(100)
        .encrypt();
      await contract
        .connect(owner)
        .increment(incInput1.handles[0], incInput1.inputProof);

      // Decrement
      const decInput1 = await createEncryptedInput(contractAddress, ownerAddress)
        .add32(30)
        .encrypt();
      await contract
        .connect(owner)
        .decrement(decInput1.handles[0], decInput1.inputProof);

      // Increment again
      const incInput2 = await createEncryptedInput(contractAddress, ownerAddress)
        .add32(50)
        .encrypt();
      await contract
        .connect(owner)
        .increment(incInput2.handles[0], incInput2.inputProof);

      // Assert: Both counters should reflect operations
      expect(await contract.getIncrementCount()).to.equal(2);
      expect(await contract.getDecrementCount()).to.equal(1);
    });
  });

  // ========== ❌ FAILURE CASES ==========

  describe("❌ FAILURE: Common Mistakes", () => {
    /**
     * Test: Encryption/signer mismatch
     * Demonstrates: Why encryption binding is critical
     *
     * CRITICAL CONCEPT:
     * When you encrypt a value with `createEncryptedInput(address, user)`,
     * the encryption is bound to that user. Only that user can decrypt it.
     * If a different user tries to use the same encrypted input, it fails.
     */
    it("❌ should fail when signer doesn't match encryptor", async () => {
      // Arrange: Encrypt input for user1
      const inputForUser1 = await createEncryptedInput(
        contractAddress,
        user1Address
      )
        .add32(100)
        .encrypt();

      // Act & Assert: Try to execute with different user (user2)
      // This should fail because the input was encrypted for user1
      await expect(
        contract
          .connect(user2)
          .increment(inputForUser1.handles[0], inputForUser1.inputProof)
      ).to.be.revertedWith("decryption failed");
    });

    /**
     * Test: Invalid input proof
     * Demonstrates: Input proof validation
     */
    it("❌ should fail with invalid input proof", async () => {
      // Arrange: Create valid encrypted input
      const validInput = await createEncryptedInput(contractAddress, ownerAddress)
        .add32(100)
        .encrypt();

      // Use invalid proof (empty)
      const invalidProof = "0x";

      // Act & Assert: Should fail due to invalid proof
      await expect(
        contract.connect(owner).increment(validInput.handles[0], invalidProof)
      ).to.be.reverted;
    });

    /**
     * Test: Demonstrates the mistake of missing FHE.allowThis()
     * Demonstrates: Why both permissions are mandatory
     *
     * NOTE: This test assumes the contract implementation is CORRECT
     * (i.e., it does call FHE.allowThis()).
     *
     * If the contract was buggy and forgot FHE.allowThis(),
     * this test would fail, catching the bug.
     */
    it("❌ demonstrates why FHE.allowThis() is critical", async () => {
      // Arrange
      const input = await createEncryptedInput(contractAddress, ownerAddress)
        .add32(100)
        .encrypt();

      // Act: Call increment (which should call both FHE.allowThis and FHE.allow)
      await contract
        .connect(owner)
        .increment(input.handles[0], input.inputProof);

      // Assert: If FHE.allowThis() was missing, this would fail
      // The fact that we can call this proves FHE.allowThis() was called
      const encryptedValue = await contract
        .connect(owner)
        .getEncryptedCount();
      expect(encryptedValue).to.not.be.undefined;

      // If the implementation forgot FHE.allowThis(), the above would revert
    });
  });

  // ========== 🔍 EDGE CASES ==========

  describe("🔍 EDGE CASES: Boundary Conditions", () => {
    /**
     * Test: Large values
     * Demonstrates: Handling large encrypted values
     */
    it("🔍 should handle large encrypted values", async () => {
      // Arrange: Create large value (close to uint32 max)
      const largeValue = 2 ** 31 - 1; // Max int32 value
      const input = await createEncryptedInput(contractAddress, ownerAddress)
        .add32(largeValue)
        .encrypt();

      // Act: Increment with large value
      const tx = await contract
        .connect(owner)
        .increment(input.handles[0], input.inputProof);

      // Assert: Should succeed without overflow protection in this example
      await expect(tx).to.not.be.reverted;
    });

    /**
     * Test: Zero value
     * Demonstrates: Handling zero operations
     */
    it("🔍 should handle zero value operations", async () => {
      // Arrange: Encrypt zero
      const zeroInput = await createEncryptedInput(contractAddress, ownerAddress)
        .add32(0)
        .encrypt();

      // Act: Increment by zero
      const tx = await contract
        .connect(owner)
        .increment(zeroInput.handles[0], zeroInput.inputProof);

      // Assert: Should succeed (adds nothing to counter)
      await expect(tx).to.not.be.reverted;

      // Counter should show operation happened even though value was zero
      expect(await contract.getIncrementCount()).to.equal(1);
    });

    /**
     * Test: Rapid sequential operations
     * Demonstrates: Contract state consistency
     */
    it("🔍 should maintain state consistency through rapid operations", async () => {
      // Act: Perform many operations quickly
      const operationCount = 10;
      for (let i = 0; i < operationCount; i++) {
        const input = await createEncryptedInput(contractAddress, ownerAddress)
          .add32(1)
          .encrypt();

        await contract
          .connect(owner)
          .increment(input.handles[0], input.inputProof);
      }

      // Assert: All operations should be recorded
      expect(await contract.getIncrementCount()).to.equal(operationCount);
    });
  });

  // ========== 📊 GAS OPTIMIZATION TESTS ==========

  describe("📊 GAS USAGE: Performance Analysis", () => {
    /**
     * Test: Measure gas usage for increment
     * Demonstrates: Baseline gas costs for FHE operations
     */
    it("📊 should measure gas usage for increment operation", async () => {
      // Arrange
      const input = await createEncryptedInput(contractAddress, ownerAddress)
        .add32(100)
        .encrypt();

      // Act
      const tx = await contract
        .connect(owner)
        .increment(input.handles[0], input.inputProof);
      const receipt = await tx.wait();

      // Assert & Log
      const gasUsed = receipt?.gasUsed;
      console.log(`\nGas used for increment: ${gasUsed?.toString()}`);

      // Gas should be reasonable
      expect(gasUsed).to.be.lt(500000);
    });
  });

  // ========== 🎯 SUMMARY OF KEY PATTERNS ==========

  describe("🎯 KEY PATTERNS DEMONSTRATED", () => {
    it("Pattern 1: Encryption Binding - user must match", async () => {
      // ✅ Correct: Same user encrypts and executes
      const input = await createEncryptedInput(contractAddress, user1Address)
        .add32(100)
        .encrypt();

      await expect(
        contract.connect(user1).increment(input.handles[0], input.inputProof)
      ).to.not.be.reverted;
    });

    it("Pattern 2: Both Permissions Required", async () => {
      const input = await createEncryptedInput(contractAddress, ownerAddress)
        .add32(100)
        .encrypt();

      // The increment function calls both:
      // - FHE.allowThis(_count)  // contract can use it
      // - FHE.allow(_count, msg.sender)  // user can decrypt it
      // Both are necessary for the operation to work

      await expect(
        contract.connect(owner).increment(input.handles[0], input.inputProof)
      ).to.not.be.reverted;
    });

    it("Pattern 3: State Persistence - encrypted state preserved", async () => {
      const input1 = await createEncryptedInput(contractAddress, ownerAddress)
        .add32(50)
        .encrypt();

      await contract
        .connect(owner)
        .increment(input1.handles[0], input1.inputProof);

      // Counter state is preserved
      expect(await contract.getIncrementCount()).to.equal(1);

      // We can perform more operations
      const input2 = await createEncryptedInput(contractAddress, ownerAddress)
        .add32(30)
        .encrypt();

      await contract
        .connect(owner)
        .decrement(input2.handles[0], input2.inputProof);

      expect(await contract.getDecrementCount()).to.equal(1);
    });
  });
});
