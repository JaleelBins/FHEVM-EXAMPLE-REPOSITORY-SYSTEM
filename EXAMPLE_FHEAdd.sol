// SPDX-License-Identifier: BSD-3-Clause-Clear

pragma solidity ^0.8.24;

import "fhevm/lib/TFHE.sol";

/**
 * @title FHEAdd
 * @notice Demonstrates encrypted addition operations
 * @dev Shows how to perform arithmetic operations on encrypted values
 */
contract FHEAdd {
    // State variables for encrypted values
    euint32 private encryptedSum;
    uint256 public additionCount;

    // Events
    event AdditionPerformed(address indexed user, uint256 count);

    /**
     * @notice Add two encrypted values
     * @dev Encrypts input, adds to stored encrypted value
     * @param inputEuint32 Encrypted input value
     * @param inputProof Zero-knowledge proof of encryption
     */
    function add(externalEuint32 inputEuint32, bytes calldata inputProof) external {
        // Decrypt input from external format
        euint32 encryptedInput = TFHE.fromExternal(inputEuint32, inputProof);

        // Perform addition on encrypted values
        encryptedSum = TFHE.add(encryptedSum, encryptedInput);

        // Grant permissions for decryption
        TFHE.allowThis(encryptedSum);
        TFHE.allow(encryptedSum, msg.sender);

        // Track operation count
        additionCount++;

        // Emit event
        emit AdditionPerformed(msg.sender, additionCount);
    }

    /**
     * @notice Get the current encrypted sum
     * @return The encrypted sum value
     */
    function getSum() external returns (euint32) {
        euint32 value = encryptedSum;
        TFHE.allowThis(value);
        TFHE.allow(value, msg.sender);
        return value;
    }

    /**
     * @notice Reset the sum to zero
     */
    function resetSum() external {
        encryptedSum = TFHE.asEuint32(0);
    }

    /**
     * @notice Add multiple values at once
     * @param values Array of encrypted values to add
     */
    function addMultiple(euint32[] calldata values) external {
        for (uint256 i = 0; i < values.length; i++) {
            encryptedSum = TFHE.add(encryptedSum, values[i]);
        }

        TFHE.allowThis(encryptedSum);
        TFHE.allow(encryptedSum, msg.sender);
        additionCount++;
    }
}
