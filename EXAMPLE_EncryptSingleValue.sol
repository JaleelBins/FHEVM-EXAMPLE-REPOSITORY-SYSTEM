// SPDX-License-Identifier: BSD-3-Clause-Clear

pragma solidity ^0.8.24;

import "fhevm/lib/TFHE.sol";

/**
 * @title EncryptSingleValue
 * @notice Demonstrates encrypting and storing a single value
 * @dev Shows basic encryption input handling and storage
 */
contract EncryptSingleValue {
    // Encrypted value
    euint32 private encryptedValue;
    address private valueOwner;
    uint256 public encryptionCount;

    // Events
    event ValueEncrypted(address indexed user, uint256 count);
    event ValueRetrieved(address indexed user);

    /**
     * @notice Encrypt and store a single value
     * @param encryptedEuint32 Encrypted input value
     * @param encryptedProof Zero-knowledge proof of encryption
     */
    function encryptValue(externalEuint32 encryptedEuint32, bytes calldata encryptedProof) external {
        // Convert external encrypted format to contract format
        euint32 value = TFHE.fromExternal(encryptedEuint32, encryptedProof);

        // Store the encrypted value
        encryptedValue = value;
        valueOwner = msg.sender;

        // Grant permissions
        TFHE.allowThis(encryptedValue);
        TFHE.allow(encryptedValue, msg.sender);

        // Track operation
        encryptionCount++;

        // Emit event
        emit ValueEncrypted(msg.sender, encryptionCount);
    }

    /**
     * @notice Retrieve the encrypted value
     * @return The encrypted value (owner only)
     */
    function getValue() external returns (euint32) {
        require(msg.sender == valueOwner, "Only owner can retrieve value");

        euint32 value = encryptedValue;
        TFHE.allowThis(value);
        TFHE.allow(value, msg.sender);

        emit ValueRetrieved(msg.sender);
        return value;
    }

    /**
     * @notice Update the encrypted value
     * @param newEncryptedEuint32 New encrypted value
     * @param newEncryptedProof Zero-knowledge proof
     */
    function updateValue(externalEuint32 newEncryptedEuint32, bytes calldata newEncryptedProof) external {
        require(msg.sender == valueOwner, "Only owner can update value");

        euint32 newValue = TFHE.fromExternal(newEncryptedEuint32, newEncryptedProof);
        encryptedValue = newValue;

        TFHE.allowThis(encryptedValue);
        TFHE.allow(encryptedValue, msg.sender);

        encryptionCount++;
    }

    /**
     * @notice Check if caller is the value owner
     * @return true if caller owns the encrypted value
     */
    function isOwner() external view returns (bool) {
        return msg.sender == valueOwner;
    }

    /**
     * @notice Get the owner of the encrypted value
     * @return The owner address
     */
    function getOwner() external view returns (address) {
        return valueOwner;
    }

    /**
     * @notice Transfer ownership to another address
     * @param newOwner The new owner address
     */
    function transferOwnership(address newOwner) external {
        require(msg.sender == valueOwner, "Only owner can transfer");
        require(newOwner != address(0), "Invalid address");

        valueOwner = newOwner;
    }

    /**
     * @notice Clear the encrypted value
     */
    function clearValue() external {
        require(msg.sender == valueOwner, "Only owner can clear");
        encryptedValue = TFHE.asEuint32(0);
    }
}
