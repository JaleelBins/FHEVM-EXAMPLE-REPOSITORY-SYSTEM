// SPDX-License-Identifier: BSD-3-Clause-Clear

pragma solidity ^0.8.24;

import "fhevm/lib/TFHE.sol";

/**
 * @title FHESub
 * @notice Demonstrates encrypted subtraction operations
 * @dev Shows how to subtract encrypted values while maintaining privacy
 */
contract FHESub {
    // Encrypted balance
    euint32 private encryptedBalance;
    uint256 public subtractionCount;

    // Events
    event SubtractionPerformed(address indexed user, uint256 count);

    /**
     * @notice Initialize balance with encrypted value
     * @param initialEuint32 Initial encrypted balance
     * @param initialProof Zero-knowledge proof
     */
    function initializeBalance(externalEuint32 initialEuint32, bytes calldata initialProof) external {
        euint32 encryptedInput = TFHE.fromExternal(initialEuint32, initialProof);
        encryptedBalance = encryptedInput;
        TFHE.allowThis(encryptedBalance);
        TFHE.allow(encryptedBalance, msg.sender);
    }

    /**
     * @notice Subtract encrypted value from balance
     * @param subtractEuint32 Amount to subtract (encrypted)
     * @param subtractProof Zero-knowledge proof
     */
    function subtract(externalEuint32 subtractEuint32, bytes calldata subtractProof) external {
        // Convert external encrypted value
        euint32 encryptedSubtract = TFHE.fromExternal(subtractEuint32, subtractProof);

        // Perform subtraction on encrypted values
        encryptedBalance = TFHE.sub(encryptedBalance, encryptedSubtract);

        // Grant permissions
        TFHE.allowThis(encryptedBalance);
        TFHE.allow(encryptedBalance, msg.sender);

        // Track operation
        subtractionCount++;

        // Emit event
        emit SubtractionPerformed(msg.sender, subtractionCount);
    }

    /**
     * @notice Get current encrypted balance
     * @return The encrypted balance
     */
    function getBalance() external returns (euint32) {
        euint32 value = encryptedBalance;
        TFHE.allowThis(value);
        TFHE.allow(value, msg.sender);
        return value;
    }

    /**
     * @notice Subtract multiple values sequentially
     * @param values Array of encrypted values to subtract
     */
    function subtractMultiple(euint32[] calldata values) external {
        for (uint256 i = 0; i < values.length; i++) {
            encryptedBalance = TFHE.sub(encryptedBalance, values[i]);
        }

        TFHE.allowThis(encryptedBalance);
        TFHE.allow(encryptedBalance, msg.sender);
        subtractionCount++;
    }

    /**
     * @notice Reset balance to zero
     */
    function resetBalance() external {
        encryptedBalance = TFHE.asEuint32(0);
    }
}
