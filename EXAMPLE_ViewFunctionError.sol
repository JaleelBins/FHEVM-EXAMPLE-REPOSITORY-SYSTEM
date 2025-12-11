// SPDX-License-Identifier: BSD-3-Clause-Clear

pragma solidity ^0.8.24;

import "fhevm/lib/TFHE.sol";

/**
 * @title ViewFunctionError
 * @notice ANTI-PATTERN: Demonstrates common mistake of using encrypted values in view functions
 * @dev This shows what NOT to do with FHE contracts
 */
contract ViewFunctionError {
    // Encrypted state
    euint32 private encryptedValue;

    // Events
    event ValueStored(address indexed user);

    /**
     * @notice Store encrypted value
     * @param valueEuint32 Encrypted value
     * @param valueProof Zero-knowledge proof
     */
    function storeValue(externalEuint32 valueEuint32, bytes calldata valueProof) external {
        euint32 value = TFHE.fromExternal(valueEuint32, valueProof);
        encryptedValue = value;

        TFHE.allowThis(encryptedValue);
        TFHE.allow(encryptedValue, msg.sender);

        emit ValueStored(msg.sender);
    }

    /**
     * ❌ ANTI-PATTERN #1: Returning encrypted value from view function
     * @return The encrypted value
     *
     * WHY THIS FAILS:
     * - View functions cannot modify state
     * - Cannot grant FHE.allowThis() or FHE.allow() in view functions
     * - Cannot generate permissions needed for decryption
     * - Caller cannot decrypt the returned value
     */
    function getValueBad() external view returns (euint32) {
        // ❌ WRONG - Cannot use encrypted values in view functions!
        // This would cause: "Cannot call view function with encrypted return"
        return encryptedValue;
    }

    /**
     * ✅ CORRECT: Return encrypted value from non-view function
     * @return The encrypted value with proper permissions
     */
    function getValueGood() external returns (euint32) {
        euint32 value = encryptedValue;

        // ✅ Grant permissions in non-view function
        TFHE.allowThis(value);
        TFHE.allow(value, msg.sender);

        return value;
    }

    /**
     * ❌ ANTI-PATTERN #2: Operating on encrypted values in view functions
     * @param operandEuint32 Operand (not used properly)
     * @return Attempted result
     */
    function operateBad(euint32 operandEuint32) external view returns (euint32) {
        // ❌ WRONG - Cannot perform FHE operations in view functions!
        // This would fail because:
        // - Cannot call TFHE functions in view context
        // - Cannot grant permissions
        // euint32 result = TFHE.add(encryptedValue, operandEuint32);
        return TFHE.asEuint32(0); // Placeholder
    }

    /**
     * ✅ CORRECT: Perform operations in non-view function
     * @param operandEuint32 Operand for operation
     * @param operandProof Zero-knowledge proof
     * @return Result of operation
     */
    function operateGood(externalEuint32 operandEuint32, bytes calldata operandProof)
                        external returns (euint32) {
        euint32 operand = TFHE.fromExternal(operandEuint32, operandProof);

        // ✅ Can perform operations in non-view functions
        euint32 result = TFHE.add(encryptedValue, operand);

        // ✅ Can grant permissions
        TFHE.allowThis(result);
        TFHE.allow(result, msg.sender);

        return result;
    }

    /**
     * ❌ ANTI-PATTERN #3: Checking encrypted values in view functions
     * @param targetValue Encrypted value to compare
     * @return Attempted comparison result
     */
    function checkValueBad(euint32 targetValue) external view returns (bool) {
        // ❌ WRONG - Cannot compare encrypted values in view functions!
        // ebool result = TFHE.eq(encryptedValue, targetValue);
        // Would fail: "Cannot use encrypted comparison in view function"
        return false; // Placeholder
    }

    /**
     * ✅ CORRECT: Compare encrypted values in non-view function
     * @param targetEuint32 Value to compare
     * @param targetProof Zero-knowledge proof
     * @return Comparison result
     */
    function checkValueGood(externalEuint32 targetEuint32, bytes calldata targetProof)
                           external returns (ebool) {
        euint32 target = TFHE.fromExternal(targetEuint32, targetProof);

        // ✅ Can compare in non-view functions
        ebool result = TFHE.eq(encryptedValue, target);

        // ✅ Can grant permissions
        TFHE.allowThis(result);
        TFHE.allow(result, msg.sender);

        return result;
    }

    /**
     * ✅ Pure View Function: Only use plaintext data in view
     * @return Operation count (plaintext)
     */
    function getMetadata() external view returns (string memory) {
        return "Use view functions ONLY for plaintext data queries";
    }

    /**
     * SUMMARY OF ANTI-PATTERNS:
     * ❌ DON'T: Return encrypted values from view functions
     * ❌ DON'T: Call FHE.allowThis() or FHE.allow() in view functions
     * ❌ DON'T: Perform FHE operations in view functions
     * ❌ DON'T: Call TFHE methods in view functions
     *
     * ✅ DO: Use non-view (state-modifying) functions for encrypted operations
     * ✅ DO: Return encrypted values only from non-view functions
     * ✅ DO: Call FHE.allowThis() and FHE.allow() in non-view functions
     */
}
