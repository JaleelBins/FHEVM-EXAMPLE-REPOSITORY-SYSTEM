// SPDX-License-Identifier: BSD-3-Clause-Clear

pragma solidity ^0.8.24;

import "fhevm/lib/TFHE.sol";

/**
 * @title PublicDecrypt
 * @notice Demonstrates public decryption of encrypted values
 * @dev Shows how encrypted results can be made publicly readable
 */
contract PublicDecrypt {
    // Mapping of commitment hashes to decrypted values
    mapping(bytes32 => uint32) public decryptedValues;
    mapping(bytes32 => bool) public hasBeenDecrypted;
    mapping(bytes32 => address) public decryptionRequester;

    // Encrypted value that will be publicly decrypted
    euint32 private encryptedPublicValue;
    uint32 public lastPublicDecryptedValue;

    // Events
    event DecryptionRequested(bytes32 indexed commitment, address indexed requester);
    event DecryptionCompleted(bytes32 indexed commitment, uint32 value);
    event PublicValueDecrypted(uint32 value);

    /**
     * @notice Store encrypted value for potential public decryption
     * @param encryptedEuint32 Encrypted value
     * @param encryptedProof Zero-knowledge proof
     */
    function storeValueForPublicDecryption(externalEuint32 encryptedEuint32, bytes calldata encryptedProof) external {
        euint32 value = TFHE.fromExternal(encryptedEuint32, encryptedProof);
        encryptedPublicValue = value;

        // Grant public permissions
        TFHE.allowThis(encryptedPublicValue);
        TFHE.allow(encryptedPublicValue, msg.sender);
    }

    /**
     * @notice Request decryption of encrypted value
     * @param commitment Commitment hash for tracking
     * @return The encrypted value for external decryption
     */
    function requestPublicDecryption(bytes32 commitment) external returns (euint32) {
        require(!hasBeenDecrypted[commitment], "Already decrypted");

        decryptionRequester[commitment] = msg.sender;

        // Grant permissions
        TFHE.allowThis(encryptedPublicValue);
        TFHE.allow(encryptedPublicValue, msg.sender);

        emit DecryptionRequested(commitment, msg.sender);

        return encryptedPublicValue;
    }

    /**
     * @notice Submit decrypted value (oracle or trusted entity)
     * @param commitment Commitment hash
     * @param decryptedValue The decrypted plaintext value
     */
    function submitDecryptedValue(bytes32 commitment, uint32 decryptedValue) external {
        require(decryptionRequester[commitment] != address(0), "No pending decryption request");
        require(!hasBeenDecrypted[commitment], "Already decrypted");

        decryptedValues[commitment] = decryptedValue;
        hasBeenDecrypted[commitment] = true;
        lastPublicDecryptedValue = decryptedValue;

        emit DecryptionCompleted(commitment, decryptedValue);
    }

    /**
     * @notice Get decrypted value (public)
     * @param commitment Commitment hash
     * @return The decrypted plaintext value
     */
    function getDecryptedValue(bytes32 commitment) external view returns (uint32) {
        require(hasBeenDecrypted[commitment], "Not decrypted yet");
        return decryptedValues[commitment];
    }

    /**
     * @notice Check if value has been decrypted
     * @param commitment Commitment hash
     * @return true if decrypted
     */
    function isDecrypted(bytes32 commitment) external view returns (bool) {
        return hasBeenDecrypted[commitment];
    }

    /**
     * @notice Get the requester of a decryption
     * @param commitment Commitment hash
     * @return The requester address
     */
    function getRequester(bytes32 commitment) external view returns (address) {
        return decryptionRequester[commitment];
    }

    /**
     * @notice Perform operation with encrypted value before decryption
     * @param encryptedOperandEuint32 Operand
     * @param operandProof Zero-knowledge proof
     * @param commitment Commitment for tracking
     * @return The encrypted result
     */
    function operateBeforeDecryption(externalEuint32 encryptedOperandEuint32,
                                     bytes calldata operandProof,
                                     bytes32 commitment) external returns (euint32) {
        require(!hasBeenDecrypted[commitment], "Already decrypted");

        euint32 operand = TFHE.fromExternal(encryptedOperandEuint32, operandProof);
        euint32 result = TFHE.add(encryptedPublicValue, operand);

        TFHE.allowThis(result);
        TFHE.allow(result, msg.sender);

        return result;
    }

    /**
     * @notice Get last publicly decrypted value
     * @return The most recent decrypted value
     */
    function getLastPublicDecryptedValue() external view returns (uint32) {
        return lastPublicDecryptedValue;
    }

    /**
     * @notice Clear decryption record
     * @param commitment Commitment hash
     */
    function clearDecryptionRecord(bytes32 commitment) external {
        require(decryptionRequester[commitment] == msg.sender, "Not requester");

        delete decryptedValues[commitment];
        delete hasBeenDecrypted[commitment];
        delete decryptionRequester[commitment];
    }
}
