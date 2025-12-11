// SPDX-License-Identifier: BSD-3-Clause-Clear

pragma solidity ^0.8.24;

import "fhevm/lib/TFHE.sol";

/**
 * @title MissingAllowThis
 * @notice ANTI-PATTERN: Demonstrates critical mistake of forgetting FHE.allowThis()
 * @dev The most common error in FHEVM development (40% of failures)
 */
contract MissingAllowThis {
    // Encrypted state
    euint32 private encryptedValue;
    uint256 public attemptCount;

    // Events
    event ValueStored(address indexed user);
    event OperationAttempted(address indexed user, bool success);

    /**
     * @notice Initialize encrypted value
     * @param valueEuint32 Encrypted value
     * @param valueProof Zero-knowledge proof
     */
    function initialize(externalEuint32 valueEuint32, bytes calldata valueProof) external {
        euint32 value = TFHE.fromExternal(valueEuint32, valueProof);
        encryptedValue = value;

        // ✅ CORRECT: Grant both permissions
        TFHE.allowThis(encryptedValue);
        TFHE.allow(encryptedValue, msg.sender);

        emit ValueStored(msg.sender);
    }

    /**
     * ❌ ANTI-PATTERN: Missing FHE.allowThis() permission
     * @param operandEuint32 Operand for operation
     * @param operandProof Zero-knowledge proof
     * @return The result
     *
     * ERROR DEMONSTRATION:
     * This function forgets FHE.allowThis() after performing operation
     * Result: Contract cannot use the returned encrypted value in future operations
     * Impact: Next operation that tries to use this result will fail
     */
    function addWithoutAllowThis(externalEuint32 operandEuint32, bytes calldata operandProof)
                                 external returns (euint32) {
        euint32 operand = TFHE.fromExternal(operandEuint32, operandProof);

        // Perform encrypted operation
        euint32 result = TFHE.add(encryptedValue, operand);

        // ❌ WRONG: Missing FHE.allowThis()!
        // Only granting user permission is not enough
        // TFHE.allowThis(result); // ← MISSING!
        TFHE.allow(result, msg.sender);

        attemptCount++;

        // Problem: Next internal use of 'result' will fail!
        // If another function tries to use this result, it will error
        return result;
    }

    /**
     * ✅ CORRECT: Proper permission granting with FHE.allowThis()
     * @param operandEuint32 Operand for operation
     * @param operandProof Zero-knowledge proof
     * @return The result with proper permissions
     */
    function addWithAllowThis(externalEuint32 operandEuint32, bytes calldata operandProof)
                             external returns (euint32) {
        euint32 operand = TFHE.fromExternal(operandEuint32, operandProof);

        // Perform encrypted operation
        euint32 result = TFHE.add(encryptedValue, operand);

        // ✅ CORRECT: Grant BOTH permissions
        TFHE.allowThis(result);     // Contract permission ← CRITICAL!
        TFHE.allow(result, msg.sender);  // User permission

        attemptCount++;
        return result;
    }

    /**
     * ❌ ANTI-PATTERN: Forgetting in complex operation
     * Shows how easy it is to miss FHE.allowThis() in multi-step operations
     */
    function complexOperationBad(externalEuint32 val1Euint32, bytes calldata proof1,
                                 externalEuint32 val2Euint32, bytes calldata proof2)
                                 external returns (euint32) {
        euint32 val1 = TFHE.fromExternal(val1Euint32, proof1);
        euint32 val2 = TFHE.fromExternal(val2Euint32, proof2);

        // Step 1
        euint32 temp = TFHE.add(val1, val2);
        // ❌ MISSING: TFHE.allowThis(temp);

        // Step 2
        euint32 result = TFHE.add(encryptedValue, temp);
        // ❌ MISSING: TFHE.allowThis(result);
        TFHE.allow(result, msg.sender); // Only partial permissions

        return result;
    }

    /**
     * ✅ CORRECT: Complex operation with proper permissions
     */
    function complexOperationGood(externalEuint32 val1Euint32, bytes calldata proof1,
                                  externalEuint32 val2Euint32, bytes calldata proof2)
                                  external returns (euint32) {
        euint32 val1 = TFHE.fromExternal(val1Euint32, proof1);
        euint32 val2 = TFHE.fromExternal(val2Euint32, proof2);

        // Step 1
        euint32 temp = TFHE.add(val1, val2);
        TFHE.allowThis(temp); // ✅ Grant permission

        // Step 2
        euint32 result = TFHE.add(encryptedValue, temp);
        TFHE.allowThis(result); // ✅ Grant permission
        TFHE.allow(result, msg.sender);

        return result;
    }

    /**
     * ❌ ANTI-PATTERN: Forgetting in batch operation
     */
    function batchOperationBad(euint32[] calldata values) external returns (euint32) {
        euint32 accumulator = encryptedValue;

        for (uint256 i = 0; i < values.length; i++) {
            accumulator = TFHE.add(accumulator, values[i]);
            // ❌ MISSING in loop: TFHE.allowThis(accumulator);
        }

        TFHE.allow(accumulator, msg.sender); // Only user permission
        return accumulator;
    }

    /**
     * ✅ CORRECT: Batch operation with proper permissions
     */
    function batchOperationGood(euint32[] calldata values) external returns (euint32) {
        euint32 accumulator = encryptedValue;

        for (uint256 i = 0; i < values.length; i++) {
            accumulator = TFHE.add(accumulator, values[i]);
            TFHE.allowThis(accumulator); // ✅ Grant after each operation
        }

        TFHE.allowThis(accumulator); // ✅ Ensure final permission
        TFHE.allow(accumulator, msg.sender);
        return accumulator;
    }

    /**
     * CHECKLIST: How to avoid missing FHE.allowThis()
     *
     * ❌ WRONG PATTERN:
     * euint32 result = TFHE.add(a, b);
     * TFHE.allow(result, msg.sender);
     * return result;
     *
     * ✅ CORRECT PATTERN:
     * euint32 result = TFHE.add(a, b);
     * TFHE.allowThis(result);        // ← CRITICAL!
     * TFHE.allow(result, msg.sender);
     * return result;
     *
     * KEY RULES:
     * 1. ALWAYS call FHE.allowThis() after creating encrypted value
     * 2. Call FHE.allowThis() BEFORE FHE.allow()
     * 3. Call it after EVERY encrypted operation
     * 4. Never skip it "just this once"
     * 5. Double-check in loops and multi-step operations
     */

    /**
     * @notice Get summary of the critical error
     */
    function getSummary() external pure returns (string memory) {
        return "FHE.allowThis() is MANDATORY after every encrypted operation. Forgetting it causes 40% of FHEVM failures!";
    }

    /**
     * @notice Get the error message users would see
     */
    function getErrorMessage() external pure returns (string memory) {
        return "Contract has no permission to use encrypted value - missing FHE.allowThis()";
    }

    /**
     * @notice Get attempt count
     */
    function getAttemptCount() external view returns (uint256) {
        return attemptCount;
    }
}
