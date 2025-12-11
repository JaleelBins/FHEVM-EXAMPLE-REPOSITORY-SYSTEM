// SPDX-License-Identifier: BSD-3-Clause-Clear

pragma solidity ^0.8.24;

import "fhevm/lib/TFHE.sol";

/**
 * @title FHEAllowThisExample
 * @notice Demonstrates proper usage of FHE.allowThis() for contract permissions
 * @dev Shows how to grant contract-level permission for encrypted value operations
 */
contract FHEAllowThisExample {
    // Encrypted state
    euint32 private encryptedState;
    uint256 public operationCount;

    // Events
    event StateUpdated(address indexed operator);
    event OperationProcessed(address indexed caller, uint256 count);

    /**
     * @notice Initialize encrypted state
     * @param stateEuint32 Initial encrypted state
     * @param stateProof Zero-knowledge proof
     */
    function initializeState(externalEuint32 stateEuint32, bytes calldata stateProof) external {
        euint32 state = TFHE.fromExternal(stateEuint32, stateProof);
        encryptedState = state;

        // ✅ Grant contract-level permission
        TFHE.allowThis(encryptedState); // Critical for contract operations!
        TFHE.allow(encryptedState, msg.sender);

        emit StateUpdated(msg.sender);
    }

    /**
     * @notice Perform operation requiring FHE.allowThis()
     * @param operandEuint32 Operand for operation
     * @param operandProof Zero-knowledge proof
     * @return Updated encrypted state
     */
    function performAddition(externalEuint32 operandEuint32, bytes calldata operandProof) external returns (euint32) {
        euint32 operand = TFHE.fromExternal(operandEuint32, operandProof);

        // Perform encrypted operation
        encryptedState = TFHE.add(encryptedState, operand);

        // ✅ Grant permissions after operation
        TFHE.allowThis(encryptedState);     // Contract permission - REQUIRED!
        TFHE.allow(encryptedState, msg.sender); // User permission

        operationCount++;
        emit OperationProcessed(msg.sender, operationCount);

        return encryptedState;
    }

    /**
     * @notice Demonstrate why FHE.allowThis() is critical
     * @dev Without FHE.allowThis(), operations would fail
     */
    function performSubtraction(externalEuint32 operandEuint32, bytes calldata operandProof) external returns (euint32) {
        euint32 operand = TFHE.fromExternal(operandEuint32, operandProof);

        // Perform encrypted operation
        encryptedState = TFHE.sub(encryptedState, operand);

        // ✅ ALWAYS call FHE.allowThis() before returning encrypted value!
        TFHE.allowThis(encryptedState);
        TFHE.allow(encryptedState, msg.sender);

        operationCount++;
        emit OperationProcessed(msg.sender, operationCount);

        return encryptedState;
    }

    /**
     * @notice Get current encrypted state
     * @return The encrypted state with proper permissions
     */
    function getState() external returns (euint32) {
        euint32 state = encryptedState;

        // ✅ Grant permissions before return
        TFHE.allowThis(state);
        TFHE.allow(state, msg.sender);

        return state;
    }

    /**
     * @notice Perform comparison requiring FHE.allowThis()
     * @param otherEuint32 Value to compare against
     * @param otherProof Zero-knowledge proof
     * @return Comparison result
     */
    function compareStates(externalEuint32 otherEuint32, bytes calldata otherProof) external returns (ebool) {
        euint32 other = TFHE.fromExternal(otherEuint32, otherProof);

        ebool result = TFHE.eq(encryptedState, other);

        // ✅ Grant permissions for result
        TFHE.allowThis(result);
        TFHE.allow(result, msg.sender);

        operationCount++;
        return result;
    }

    /**
     * @notice Perform complex operation with multiple FHE operations
     * @dev Each operation requires FHE.allowThis()
     */
    function complexOperation(externalEuint32 val1Euint32, bytes calldata proof1,
                             externalEuint32 val2Euint32, bytes calldata proof2)
                             external returns (euint32) {
        euint32 val1 = TFHE.fromExternal(val1Euint32, proof1);
        euint32 val2 = TFHE.fromExternal(val2Euint32, proof2);

        // Step 1: Add
        euint32 temp = TFHE.add(val1, val2);
        TFHE.allowThis(temp);  // ✅ Grant permission after operation

        // Step 2: Add to state
        euint32 result = TFHE.add(encryptedState, temp);
        TFHE.allowThis(result); // ✅ Grant permission after operation

        // Final permissions
        TFHE.allowThis(result);
        TFHE.allow(result, msg.sender);

        operationCount++;
        return result;
    }

    /**
     * @notice Batch operation showing FHE.allowThis() pattern
     * @param values Array of encrypted values
     * @return Sum of all values
     */
    function sumValues(euint32[] calldata values) external returns (euint32) {
        require(values.length > 0, "At least one value required");

        euint32 sum = TFHE.asEuint32(0);

        for (uint256 i = 0; i < values.length; i++) {
            sum = TFHE.add(sum, values[i]);
            // ✅ Grant permission after each operation
            TFHE.allowThis(sum);
        }

        // Final permissions for return
        TFHE.allowThis(sum);
        TFHE.allow(sum, msg.sender);

        operationCount++;
        return sum;
    }

    /**
     * @notice Reset state to zero
     */
    function resetState() external {
        encryptedState = TFHE.asEuint32(0);

        // ✅ Grant permissions
        TFHE.allowThis(encryptedState);
        TFHE.allow(encryptedState, msg.sender);

        emit StateUpdated(msg.sender);
    }

    /**
     * @notice Get operation count
     * @return Number of operations performed
     */
    function getOperationCount() external view returns (uint256) {
        return operationCount;
    }

    /**
     * @notice Demonstrate permission requirement explanation
     * @return Explanation string
     */
    function explainAllowThis() external pure returns (string memory) {
        return "FHE.allowThis() grants contract permission to use encrypted values. Without it, operations fail!";
    }
}
