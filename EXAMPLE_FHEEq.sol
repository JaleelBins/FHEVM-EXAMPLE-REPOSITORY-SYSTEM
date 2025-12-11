// SPDX-License-Identifier: BSD-3-Clause-Clear

pragma solidity ^0.8.24;

import "fhevm/lib/TFHE.sol";

/**
 * @title FHEEq
 * @notice Demonstrates encrypted equality comparison
 * @dev Shows how to compare encrypted values without decryption
 */
contract FHEEq {
    // Encrypted secret value
    euint32 private encryptedSecret;
    uint256 public comparisonCount;
    uint256 public successfulMatches;

    // Events
    event ComparisonPerformed(address indexed user, bool result);
    event SecretSet(address indexed user);

    /**
     * @notice Set the secret encrypted value
     * @param secretEuint32 The secret value (encrypted)
     * @param secretProof Zero-knowledge proof
     */
    function setSecret(externalEuint32 secretEuint32, bytes calldata secretProof) external {
        euint32 encryptedInput = TFHE.fromExternal(secretEuint32, secretProof);
        encryptedSecret = encryptedInput;
        emit SecretSet(msg.sender);
    }

    /**
     * @notice Check if provided value equals the secret (encrypted comparison)
     * @param guessEuint32 The guess value (encrypted)
     * @param guessProof Zero-knowledge proof
     * @return Whether the values are equal (encrypted boolean)
     */
    function checkEqual(externalEuint32 guessEuint32, bytes calldata guessProof) external returns (ebool) {
        // Convert external encrypted value
        euint32 encryptedGuess = TFHE.fromExternal(guessEuint32, guessProof);

        // Perform encrypted equality comparison
        ebool result = TFHE.eq(encryptedSecret, encryptedGuess);

        // Grant permissions for result
        TFHE.allowThis(result);
        TFHE.allow(result, msg.sender);

        // Track operation
        comparisonCount++;

        return result;
    }

    /**
     * @notice Compare two encrypted values
     * @param value1 First encrypted value
     * @param value2 Second encrypted value
     * @return result Encrypted boolean result
     */
    function compareValues(externalEuint32 value1, bytes calldata proof1,
                          externalEuint32 value2, bytes calldata proof2)
                          external returns (ebool) {
        euint32 encryptedVal1 = TFHE.fromExternal(value1, proof1);
        euint32 encryptedVal2 = TFHE.fromExternal(value2, proof2);

        ebool result = TFHE.eq(encryptedVal1, encryptedVal2);

        TFHE.allowThis(result);
        TFHE.allow(result, msg.sender);

        comparisonCount++;

        return result;
    }

    /**
     * @notice Batch compare multiple values against secret
     * @param values Array of encrypted values to compare
     * @return results Array of comparison results
     */
    function batchCompare(euint32[] calldata values) external returns (ebool[] memory results) {
        results = new ebool[](values.length);

        for (uint256 i = 0; i < values.length; i++) {
            results[i] = TFHE.eq(encryptedSecret, values[i]);
            TFHE.allowThis(results[i]);
            TFHE.allow(results[i], msg.sender);
        }

        comparisonCount++;
        return results;
    }

    /**
     * @notice Get the secret value
     * @return The encrypted secret
     */
    function getSecret() external returns (euint32) {
        euint32 value = encryptedSecret;
        TFHE.allowThis(value);
        TFHE.allow(value, msg.sender);
        return value;
    }
}
