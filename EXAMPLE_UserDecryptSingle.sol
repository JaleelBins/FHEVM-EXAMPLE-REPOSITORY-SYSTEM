// SPDX-License-Identifier: BSD-3-Clause-Clear

pragma solidity ^0.8.24;

import "fhevm/lib/TFHE.sol";

/**
 * @title UserDecryptSingle
 * @notice Demonstrates user-side decryption of a single encrypted value
 * @dev Shows how users can decrypt values they encrypted
 */
contract UserDecryptSingle {
    // Encrypted value that can be decrypted by user
    euint32 private encryptedValue;
    address private valueUser;

    // Events
    event ValueStored(address indexed user);
    event ValueDecryptionRequested(address indexed user);

    /**
     * @notice Store an encrypted value that user can decrypt
     * @param encryptedEuint32 Encrypted value
     * @param encryptedProof Zero-knowledge proof
     */
    function storeEncryptedValue(externalEuint32 encryptedEuint32, bytes calldata encryptedProof) external {
        euint32 value = TFHE.fromExternal(encryptedEuint32, encryptedProof);

        encryptedValue = value;
        valueUser = msg.sender;

        // Grant permissions - critical for user decryption
        TFHE.allowThis(encryptedValue);
        TFHE.allow(encryptedValue, msg.sender);

        emit ValueStored(msg.sender);
    }

    /**
     * @notice Request value for decryption (user only)
     * @return The encrypted value for user decryption
     */
    function requestValueForDecryption() external returns (euint32) {
        require(msg.sender == valueUser, "Only value user can request decryption");

        euint32 value = encryptedValue;

        // Grant explicit permissions for decryption
        TFHE.allowThis(value);
        TFHE.allow(value, msg.sender);

        emit ValueDecryptionRequested(msg.sender);

        return value;
    }

    /**
     * @notice Verify that only the correct user can decrypt
     * @return true if caller is the value user
     */
    function canDecryptValue() external view returns (bool) {
        return msg.sender == valueUser;
    }

    /**
     * @notice Get user who can decrypt this value
     * @return The user address
     */
    function getValueUser() external view returns (address) {
        return valueUser;
    }

    /**
     * @notice Perform operation then decrypt (user only)
     * @param encryptedOperandEuint32 Operand for operation
     * @param operandProof Zero-knowledge proof
     * @return Result encrypted value ready for decryption
     */
    function operateAndDecrypt(externalEuint32 encryptedOperandEuint32, bytes calldata operandProof)
                               external returns (euint32) {
        require(msg.sender == valueUser, "Only value user can operate");

        euint32 operand = TFHE.fromExternal(encryptedOperandEuint32, operandProof);

        // Perform operation
        euint32 result = TFHE.add(encryptedValue, operand);

        // Grant permissions for result
        TFHE.allowThis(result);
        TFHE.allow(result, msg.sender);

        return result;
    }

    /**
     * @notice Update the encrypted value (user only)
     * @param newEncryptedEuint32 New encrypted value
     * @param newEncryptedProof Zero-knowledge proof
     */
    function updateEncryptedValue(externalEuint32 newEncryptedEuint32, bytes calldata newEncryptedProof) external {
        require(msg.sender == valueUser, "Only value user can update");

        euint32 newValue = TFHE.fromExternal(newEncryptedEuint32, newEncryptedProof);
        encryptedValue = newValue;

        TFHE.allowThis(encryptedValue);
        TFHE.allow(encryptedValue, msg.sender);
    }

    /**
     * @notice Transfer decryption rights to another user
     * @param newUser New user who can decrypt
     */
    function transferDecryptionRights(address newUser) external {
        require(msg.sender == valueUser, "Only current user can transfer");
        require(newUser != address(0), "Invalid address");

        valueUser = newUser;

        // Update permissions for new user
        TFHE.allowThis(encryptedValue);
        TFHE.allow(encryptedValue, newUser);
    }

    /**
     * @notice Clear the encrypted value
     */
    function clearValue() external {
        require(msg.sender == valueUser, "Only value user can clear");
        encryptedValue = TFHE.asEuint32(0);
    }
}
