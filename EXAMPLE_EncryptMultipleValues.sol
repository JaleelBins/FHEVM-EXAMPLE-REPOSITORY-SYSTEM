// SPDX-License-Identifier: BSD-3-Clause-Clear

pragma solidity ^0.8.24;

import "fhevm/lib/TFHE.sol";

/**
 * @title EncryptMultipleValues
 * @notice Demonstrates encrypting and managing multiple values
 * @dev Shows how to handle arrays of encrypted data
 */
contract EncryptMultipleValues {
    // Mapping of user addresses to encrypted values
    mapping(address => euint32[]) private userValues;
    mapping(address => uint256) private valueCount;

    // Events
    event ValuesEncrypted(address indexed user, uint256 count);
    event ValueAdded(address indexed user, uint256 position);

    /**
     * @notice Encrypt and store multiple values at once
     * @param encryptedValues Array of encrypted values
     */
    function encryptMultiple(euint32[] calldata encryptedValues) external {
        require(encryptedValues.length > 0, "Must provide at least one value");

        for (uint256 i = 0; i < encryptedValues.length; i++) {
            userValues[msg.sender].push(encryptedValues[i]);

            // Grant permissions for each value
            TFHE.allowThis(encryptedValues[i]);
            TFHE.allow(encryptedValues[i], msg.sender);
        }

        valueCount[msg.sender] += encryptedValues.length;

        emit ValuesEncrypted(msg.sender, encryptedValues.length);
    }

    /**
     * @notice Add a single encrypted value
     * @param encryptedEuint32 Encrypted value
     * @param encryptedProof Zero-knowledge proof
     */
    function addValue(externalEuint32 encryptedEuint32, bytes calldata encryptedProof) external {
        euint32 value = TFHE.fromExternal(encryptedEuint32, encryptedProof);

        userValues[msg.sender].push(value);
        valueCount[msg.sender]++;

        TFHE.allowThis(value);
        TFHE.allow(value, msg.sender);

        emit ValueAdded(msg.sender, userValues[msg.sender].length - 1);
    }

    /**
     * @notice Get all encrypted values for caller
     * @return Array of encrypted values
     */
    function getValues() external returns (euint32[] memory) {
        euint32[] memory values = userValues[msg.sender];

        // Grant permissions for all values
        for (uint256 i = 0; i < values.length; i++) {
            TFHE.allowThis(values[i]);
            TFHE.allow(values[i], msg.sender);
        }

        return values;
    }

    /**
     * @notice Get a specific encrypted value by index
     * @param index Index of the value
     * @return The encrypted value at that index
     */
    function getValueAt(uint256 index) external returns (euint32) {
        require(index < userValues[msg.sender].length, "Index out of bounds");

        euint32 value = userValues[msg.sender][index];

        TFHE.allowThis(value);
        TFHE.allow(value, msg.sender);

        return value;
    }

    /**
     * @notice Get the count of encrypted values for caller
     * @return Number of values stored
     */
    function getValueCount() external view returns (uint256) {
        return userValues[msg.sender].length;
    }

    /**
     * @notice Get range of encrypted values
     * @param start Start index
     * @param end End index (exclusive)
     * @return Array of encrypted values in range
     */
    function getValueRange(uint256 start, uint256 end) external returns (euint32[] memory) {
        require(start < end, "Invalid range");
        require(end <= userValues[msg.sender].length, "End index out of bounds");

        uint256 length = end - start;
        euint32[] memory result = new euint32[](length);

        for (uint256 i = 0; i < length; i++) {
            euint32 value = userValues[msg.sender][start + i];
            TFHE.allowThis(value);
            TFHE.allow(value, msg.sender);
            result[i] = value;
        }

        return result;
    }

    /**
     * @notice Clear all encrypted values for caller
     */
    function clearAllValues() external {
        delete userValues[msg.sender];
        valueCount[msg.sender] = 0;
    }

    /**
     * @notice Remove value at specific index
     * @param index Index to remove
     */
    function removeValueAt(uint256 index) external {
        require(index < userValues[msg.sender].length, "Index out of bounds");

        euint32[] storage values = userValues[msg.sender];
        values[index] = values[values.length - 1];
        values.pop();
        valueCount[msg.sender]--;
    }
}
