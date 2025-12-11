// SPDX-License-Identifier: BSD-3-Clause-Clear

pragma solidity ^0.8.24;

import "fhevm/lib/TFHE.sol";

/**
 * @title UserDecryptMultiple
 * @notice Demonstrates user-side decryption of multiple encrypted values
 * @dev Shows how to handle arrays of encrypted data for user decryption
 */
contract UserDecryptMultiple {
    // Mapping of users to their encrypted values
    mapping(address => euint32[]) private userEncryptedValues;
    mapping(address => uint256) private valueCount;

    // Events
    event ValuesStored(address indexed user, uint256 count);
    event ValuesRequested(address indexed user, uint256 count);

    /**
     * @notice Store multiple encrypted values for user decryption
     * @param encryptedValues Array of encrypted values
     */
    function storeMultipleValues(euint32[] calldata encryptedValues) external {
        require(encryptedValues.length > 0, "Must provide at least one value");

        for (uint256 i = 0; i < encryptedValues.length; i++) {
            userEncryptedValues[msg.sender].push(encryptedValues[i]);

            // Grant permissions for each value
            TFHE.allowThis(encryptedValues[i]);
            TFHE.allow(encryptedValues[i], msg.sender);
        }

        valueCount[msg.sender] += encryptedValues.length;

        emit ValuesStored(msg.sender, encryptedValues.length);
    }

    /**
     * @notice Add a single encrypted value
     * @param encryptedEuint32 Encrypted value
     * @param encryptedProof Zero-knowledge proof
     */
    function addEncryptedValue(externalEuint32 encryptedEuint32, bytes calldata encryptedProof) external {
        euint32 value = TFHE.fromExternal(encryptedEuint32, encryptedProof);

        userEncryptedValues[msg.sender].push(value);
        valueCount[msg.sender]++;

        TFHE.allowThis(value);
        TFHE.allow(value, msg.sender);
    }

    /**
     * @notice Request all encrypted values for user decryption
     * @return Array of encrypted values
     */
    function requestAllValuesForDecryption() external returns (euint32[] memory) {
        euint32[] memory values = userEncryptedValues[msg.sender];

        // Grant permissions for decryption
        for (uint256 i = 0; i < values.length; i++) {
            TFHE.allowThis(values[i]);
            TFHE.allow(values[i], msg.sender);
        }

        emit ValuesRequested(msg.sender, values.length);

        return values;
    }

    /**
     * @notice Request specific value by index for decryption
     * @param index Index of the value
     * @return The encrypted value
     */
    function requestValueAtIndexForDecryption(uint256 index) external returns (euint32) {
        require(index < userEncryptedValues[msg.sender].length, "Index out of bounds");

        euint32 value = userEncryptedValues[msg.sender][index];

        TFHE.allowThis(value);
        TFHE.allow(value, msg.sender);

        return value;
    }

    /**
     * @notice Request range of values for decryption
     * @param start Start index
     * @param end End index (exclusive)
     * @return Array of encrypted values in range
     */
    function requestValuesInRangeForDecryption(uint256 start, uint256 end) external returns (euint32[] memory) {
        require(start < end, "Invalid range");
        require(end <= userEncryptedValues[msg.sender].length, "End index out of bounds");

        uint256 length = end - start;
        euint32[] memory result = new euint32[](length);

        for (uint256 i = 0; i < length; i++) {
            euint32 value = userEncryptedValues[msg.sender][start + i];
            TFHE.allowThis(value);
            TFHE.allow(value, msg.sender);
            result[i] = value;
        }

        emit ValuesRequested(msg.sender, length);

        return result;
    }

    /**
     * @notice Get count of encrypted values for user
     * @return Number of values
     */
    function getValueCount() external view returns (uint256) {
        return userEncryptedValues[msg.sender].length;
    }

    /**
     * @notice Perform batch operation on values then decrypt
     * @param indices Indices of values to operate on
     * @param operandEuint32 Operand for operations
     * @param operandProof Zero-knowledge proof
     * @return Array of results ready for decryption
     */
    function batchOperateThenDecrypt(uint256[] calldata indices,
                                     externalEuint32 operandEuint32,
                                     bytes calldata operandProof) external returns (euint32[] memory) {
        euint32 operand = TFHE.fromExternal(operandEuint32, operandProof);
        euint32[] memory results = new euint32[](indices.length);

        for (uint256 i = 0; i < indices.length; i++) {
            require(indices[i] < userEncryptedValues[msg.sender].length, "Index out of bounds");

            // Perform operation
            results[i] = TFHE.add(userEncryptedValues[msg.sender][indices[i]], operand);

            // Grant permissions
            TFHE.allowThis(results[i]);
            TFHE.allow(results[i], msg.sender);
        }

        return results;
    }

    /**
     * @notice Remove value at index
     * @param index Index to remove
     */
    function removeValueAt(uint256 index) external {
        require(index < userEncryptedValues[msg.sender].length, "Index out of bounds");

        euint32[] storage values = userEncryptedValues[msg.sender];
        values[index] = values[values.length - 1];
        values.pop();
        valueCount[msg.sender]--;
    }

    /**
     * @notice Clear all encrypted values
     */
    function clearAllValues() external {
        delete userEncryptedValues[msg.sender];
        valueCount[msg.sender] = 0;
    }
}
