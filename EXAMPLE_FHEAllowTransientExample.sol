// SPDX-License-Identifier: BSD-3-Clause-Clear

pragma solidity ^0.8.24;

import "fhevm/lib/TFHE.sol";

/**
 * @title FHEAllowTransientExample
 * @notice Demonstrates usage of FHE.allowTransient() for temporary permissions
 * @dev Shows how to grant transient permissions for values during execution
 */
contract FHEAllowTransientExample {
    // Persistent encrypted state
    euint32 private encryptedState;
    uint256 public operationCount;

    // Events
    event TransientOperationExecuted(address indexed caller, uint256 count);
    event StateUpdated(address indexed caller);

    /**
     * @notice Initialize encrypted state
     * @param stateEuint32 Initial encrypted state
     * @param stateProof Zero-knowledge proof
     */
    function initializeState(externalEuint32 stateEuint32, bytes calldata stateProof) external {
        euint32 state = TFHE.fromExternal(stateEuint32, stateProof);
        encryptedState = state;

        TFHE.allowThis(encryptedState);
        TFHE.allow(encryptedState, msg.sender);

        emit StateUpdated(msg.sender);
    }

    /**
     * @notice Perform operation with transient permissions
     * @dev FHE.allowTransient() grants permission only for current transaction
     * @param operandEuint32 Operand for operation
     * @param operandProof Zero-knowledge proof
     */
    function performTransientOperation(externalEuint32 operandEuint32, bytes calldata operandProof)
                                       external returns (euint32) {
        euint32 operand = TFHE.fromExternal(operandEuint32, operandProof);

        // Create temporary result
        euint32 tempResult = TFHE.add(encryptedState, operand);

        // ✅ Grant transient permission - valid only in this transaction
        TFHE.allowTransient(tempResult);

        // Can use tempResult in this transaction
        euint32 finalResult = TFHE.add(tempResult, TFHE.asEuint32(10));

        // ✅ Grant persistent permissions for return value
        TFHE.allowThis(finalResult);
        TFHE.allow(finalResult, msg.sender);

        operationCount++;
        emit TransientOperationExecuted(msg.sender, operationCount);

        return finalResult;
    }

    /**
     * @notice Multi-step operation with transient permissions
     * @dev Shows chaining operations with allowTransient()
     */
    function multiStepTransientOperation(externalEuint32 val1Euint32, bytes calldata proof1,
                                        externalEuint32 val2Euint32, bytes calldata proof2)
                                        external returns (euint32) {
        euint32 val1 = TFHE.fromExternal(val1Euint32, proof1);
        euint32 val2 = TFHE.fromExternal(val2Euint32, proof2);

        // Step 1: Create temporary result
        euint32 temp1 = TFHE.add(val1, val2);
        TFHE.allowTransient(temp1); // ✅ Transient permission

        // Step 2: Use temp1 in another operation
        euint32 temp2 = TFHE.add(encryptedState, temp1);
        TFHE.allowTransient(temp2); // ✅ Transient permission

        // Step 3: Final operation
        euint32 result = TFHE.add(temp2, TFHE.asEuint32(1));

        // ✅ Grant persistent permissions
        TFHE.allowThis(result);
        TFHE.allow(result, msg.sender);

        operationCount++;
        emit TransientOperationExecuted(msg.sender, operationCount);

        return result;
    }

    /**
     * @notice Demonstrate difference between allowThis and allowTransient
     * @dev allowTransient is for temporary values within single transaction
     */
    function comparePermanentAndTransient(externalEuint32 operandEuint32, bytes calldata operandProof)
                                         external returns (euint32) {
        euint32 operand = TFHE.fromExternal(operandEuint32, operandProof);

        // Permanent update to state
        encryptedState = TFHE.add(encryptedState, operand);
        TFHE.allowThis(encryptedState);   // ✅ Permanent - persists across transactions

        // Transient result for current use only
        euint32 tempResult = TFHE.sub(encryptedState, TFHE.asEuint32(5));
        TFHE.allowTransient(tempResult); // ✅ Transient - only valid in this transaction

        // Return only permanent value
        TFHE.allowThis(encryptedState);
        TFHE.allow(encryptedState, msg.sender);

        operationCount++;
        return encryptedState;
    }

    /**
     * @notice Batch operation with transient intermediates
     * @param values Array of values for batch operation
     * @return Final accumulated result
     */
    function batchTransientOperation(euint32[] calldata values) external returns (euint32) {
        require(values.length > 0, "At least one value required");

        euint32 accumulator = encryptedState;

        for (uint256 i = 0; i < values.length; i++) {
            // Temporary result during iteration
            accumulator = TFHE.add(accumulator, values[i]);

            // Grant transient permission for intermediate use
            if (i < values.length - 1) {
                TFHE.allowTransient(accumulator); // ✅ Only need for this iteration
            }
        }

        // ✅ Grant persistent permissions for final return
        TFHE.allowThis(accumulator);
        TFHE.allow(accumulator, msg.sender);

        operationCount++;
        return accumulator;
    }

    /**
     * @notice Conditional operation using transient permissions
     */
    function conditionalTransientOp(externalEuint32 operandEuint32, bytes calldata operandProof)
                                    external returns (euint32) {
        euint32 operand = TFHE.fromExternal(operandEuint32, operandProof);

        // Create temporary comparison result
        ebool isGreater = TFHE.gt(operand, TFHE.asEuint32(100));
        TFHE.allowTransient(isGreater); // ✅ Transient permission

        // Use transient result to decide operation
        euint32 result;
        if (TFHE.isInitialized(isGreater)) {
            result = TFHE.add(encryptedState, operand);
        } else {
            result = TFHE.sub(encryptedState, operand);
        }

        // Permanent permissions for return
        TFHE.allowThis(result);
        TFHE.allow(result, msg.sender);

        operationCount++;
        return result;
    }

    /**
     * @notice Get current encrypted state
     * @return The encrypted state
     */
    function getState() external returns (euint32) {
        euint32 state = encryptedState;

        TFHE.allowThis(state);
        TFHE.allow(state, msg.sender);

        return state;
    }

    /**
     * @notice Explain allowTransient usage
     * @return Explanation string
     */
    function explainAllowTransient() external pure returns (string memory) {
        return "FHE.allowTransient() grants permission only for the current transaction. Use for temporary intermediate values. Use FHE.allowThis() for persistent state.";
    }

    /**
     * @notice Get operation count
     * @return Number of transient operations
     */
    function getOperationCount() external view returns (uint256) {
        return operationCount;
    }
}
