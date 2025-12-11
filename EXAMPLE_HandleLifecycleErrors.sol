// SPDX-License-Identifier: BSD-3-Clause-Clear

pragma solidity ^0.8.24;

import "fhevm/lib/TFHE.sol";

/**
 * @title HandleLifecycleErrors
 * @notice ANTI-PATTERN: Demonstrates encrypted value lifecycle errors
 * @dev Shows improper handling of encrypted value lifecycle
 */
contract HandleLifecycleErrors {
    // Encrypted values with lifecycle tracking
    euint32 private activeValue;
    euint32 private archivedValue;

    // State tracking
    bool private initialized;
    uint256 private lastUpdateTimestamp;

    // Events
    event ValueInitialized(address indexed user);
    event ValueUpdated(address indexed user);
    event ValueArchived(address indexed user);
    event LifecycleError(string reason);

    /**
     * ❌ ANTI-PATTERN #1: Using uninitialized encrypted value
     *
     * PROBLEM:
     * Contract has euint32 field but never initialize it
     * Trying to use uninitialized encrypted value causes errors
     */
    function addToUninitializedValue(externalEuint32 operandEuint32, bytes calldata operandProof)
                                     external returns (euint32) {
        // ❌ WRONG: activeValue was never initialized!
        // activeValue is zero/uninitialized encrypted value
        // Operations on uninitialized values are unreliable

        euint32 operand = TFHE.fromExternal(operandEuint32, operandProof);

        // This might fail or produce unexpected results
        euint32 result = TFHE.add(activeValue, operand);

        TFHE.allowThis(result);
        TFHE.allow(result, msg.sender);

        return result;
    }

    /**
     * ✅ CORRECT: Initialize value before using
     * @param valueEuint32 Initial encrypted value
     * @param valueProof Zero-knowledge proof
     */
    function initialize(externalEuint32 valueEuint32, bytes calldata valueProof) external {
        require(!initialized, "Already initialized");

        euint32 value = TFHE.fromExternal(valueEuint32, valueProof);

        activeValue = value;
        initialized = true;
        lastUpdateTimestamp = block.timestamp;

        TFHE.allowThis(activeValue);
        TFHE.allow(activeValue, msg.sender);

        emit ValueInitialized(msg.sender);
    }

    /**
     * ❌ ANTI-PATTERN #2: Using archived/invalidated value
     *
     * PROBLEM:
     * Value was moved to archive but code still tries to use it
     * Archived value might have invalid permissions
     */
    function addToArchivedValue(externalEuint32 operandEuint32, bytes calldata operandProof)
                                external returns (euint32) {
        // ❌ WRONG: Using archived value without checking
        // This value is no longer active

        euint32 operand = TFHE.fromExternal(operandEuint32, operandProof);

        // Permissions might be invalid for archived value
        euint32 result = TFHE.add(archivedValue, operand);

        TFHE.allowThis(result);
        TFHE.allow(result, msg.sender);

        return result;
    }

    /**
     * ✅ CORRECT: Check value is active before using
     * @param operandEuint32 Operand
     * @param operandProof Proof
     * @return Operation result
     */
    function addToActiveValue(externalEuint32 operandEuint32, bytes calldata operandProof)
                             external returns (euint32) {
        require(initialized, "Value not initialized");

        euint32 operand = TFHE.fromExternal(operandEuint32, operandProof);

        euint32 result = TFHE.add(activeValue, operand);

        TFHE.allowThis(result);
        TFHE.allow(result, msg.sender);

        lastUpdateTimestamp = block.timestamp;

        emit ValueUpdated(msg.sender);

        return result;
    }

    /**
     * ❌ ANTI-PATTERN #3: Permissions become stale after archive
     *
     * PROBLEM:
     * When archiving value, old permissions aren't updated
     * Trying to use old permissions on archived value fails
     */
    function archiveAndUseWrong(externalEuint32 newValueEuint32, bytes calldata newValueProof) external {
        // Save current value to archive
        archivedValue = activeValue; // ❌ Permissions not updated!

        // Initialize new active value
        euint32 newValue = TFHE.fromExternal(newValueEuint32, newValueProof);
        activeValue = newValue;

        TFHE.allowThis(activeValue);
        TFHE.allow(activeValue, msg.sender);

        // ❌ WRONG: archivedValue still has old permissions
        // If someone tries to use archived value, it will fail
    }

    /**
     * ✅ CORRECT: Update permissions when archiving
     * @param newValueEuint32 New encrypted value
     * @param newValueProof Proof
     */
    function archiveAndUseCorrect(externalEuint32 newValueEuint32, bytes calldata newValueProof) external {
        // Save and properly archive current value
        archivedValue = activeValue;

        // Update permissions for archived value
        TFHE.allowThis(archivedValue);
        TFHE.allow(archivedValue, msg.sender);

        // Initialize new active value
        euint32 newValue = TFHE.fromExternal(newValueEuint32, newValueProof);
        activeValue = newValue;

        TFHE.allowThis(activeValue);
        TFHE.allow(activeValue, msg.sender);

        lastUpdateTimestamp = block.timestamp;

        emit ValueArchived(msg.sender);
    }

    /**
     * ❌ ANTI-PATTERN #4: Reusing deleted/cleared value
     *
     * PROBLEM:
     * Value was cleared/deleted but code still tries to operate on it
     */
    function clearAndReuseBad() external {
        // Clear the value
        activeValue = TFHE.asEuint32(0);

        // Don't update permissions for cleared value
        // ❌ WRONG: Trying to use cleared value
        // activeValue = TFHE.asEuint32(0); // uninitialized state
    }

    /**
     * ✅ CORRECT: Clear value and update state
     */
    function clearAndReuseCorrect() external {
        require(initialized, "Not initialized");

        // Clear the value
        activeValue = TFHE.asEuint32(0);

        // Update permissions
        TFHE.allowThis(activeValue);
        TFHE.allow(activeValue, msg.sender);

        // Update state to reflect cleared value
        initialized = false;

        emit ValueArchived(msg.sender);
    }

    /**
     * ❌ ANTI-PATTERN #5: Permission scope mismatch
     *
     * PROBLEM:
     * Permissions granted to one function but value used in another
     */
    function operationAWithoutProper Permission() external {
        // ❌ WRONG: No FHE.allowThis() call
        // Permissions are missing for next operation
    }

    /**
     * ✅ CORRECT: Explicit lifecycle management
     * @return Current active value status
     */
    function getStatus() external returns (string memory) {
        require(initialized, "Not initialized");

        euint32 status = activeValue;

        TFHE.allowThis(status);
        TFHE.allow(status, msg.sender);

        return "Active";
    }

    /**
     * LIFECYCLE ERROR CHECKLIST
     *
     * ❌ DON'T:
     * - Use uninitialized encrypted values
     * - Operate on archived/invalidated values
     * - Forget to update permissions after archiving
     * - Clear value without updating permissions
     * - Assume permissions persist across lifecycle changes
     * - Mix old and new encrypted values
     *
     * ✅ DO:
     * - Initialize before using
     * - Check initialized status before operations
     * - Update permissions when changing lifecycle state
     * - Explicitly clear values when no longer needed
     * - Maintain clear state tracking
     * - Grant permissions after every state change
     * - Document value lifecycle clearly
     */

    /**
     * @notice Check if value is initialized
     * @return Initialization status
     */
    function isInitialized() external view returns (bool) {
        return initialized;
    }

    /**
     * @notice Get last update time
     * @return Timestamp of last update
     */
    function getLastUpdateTime() external view returns (uint256) {
        return lastUpdateTimestamp;
    }

    /**
     * @notice Explain lifecycle errors
     */
    function explainLifecycleErrors() external pure returns (string memory) {
        return "Encrypted value lifecycle errors occur when using uninitialized, archived, or cleared values without proper permission management";
    }
}
