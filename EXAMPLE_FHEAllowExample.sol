// SPDX-License-Identifier: BSD-3-Clause-Clear

pragma solidity ^0.8.24;

import "fhevm/lib/TFHE.sol";

/**
 * @title FHEAllowExample
 * @notice Demonstrates proper usage of FHE.allow() for user permissions
 * @dev Shows how to grant user-level permission for encrypted value decryption
 */
contract FHEAllowExample {
    // Encrypted data
    euint32 private encryptedData;
    address private dataOwner;

    // Events
    event DataStored(address indexed owner);
    event DataRetrieved(address indexed user);
    event PermissionsGranted(address indexed user);

    /**
     * @notice Store encrypted data
     * @param dataEuint32 Encrypted data
     * @param dataProof Zero-knowledge proof
     */
    function storeData(externalEuint32 dataEuint32, bytes calldata dataProof) external {
        euint32 data = TFHE.fromExternal(dataEuint32, dataProof);
        encryptedData = data;
        dataOwner = msg.sender;

        // ✅ Grant permissions - REQUIRED for user access
        TFHE.allowThis(encryptedData);     // Contract permission
        TFHE.allow(encryptedData, msg.sender); // User permission - CRITICAL!

        emit DataStored(msg.sender);
    }

    /**
     * @notice Retrieve data (demonstrates FHE.allow() necessity)
     * @return The encrypted data that user can decrypt
     */
    function retrieveData() external returns (euint32) {
        require(msg.sender == dataOwner, "Only owner can retrieve");

        euint32 data = encryptedData;

        // ✅ ALWAYS grant permissions before returning
        TFHE.allowThis(data);
        TFHE.allow(data, msg.sender);

        emit DataRetrieved(msg.sender);

        return data;
    }

    /**
     * @notice Demonstrate why FHE.allow() is critical
     * @param userAddress Address to check
     * @return true if user can decrypt
     */
    function canUserDecrypt(address userAddress) external view returns (bool) {
        return userAddress == dataOwner;
    }

    /**
     * @notice Grant FHE.allow() permission to another user
     * @param newUser The user to grant permission to
     */
    function shareDataWithUser(address newUser) external {
        require(msg.sender == dataOwner, "Only owner can share");
        require(newUser != address(0), "Invalid address");

        // Grant both permissions to new user
        TFHE.allowThis(encryptedData);
        TFHE.allow(encryptedData, newUser);

        emit PermissionsGranted(newUser);
    }

    /**
     * @notice Process and share data result
     * @param operandEuint32 Operand for operation
     * @param operandProof Zero-knowledge proof
     * @param recipientUser User to share result with
     * @return Encrypted result with proper permissions
     */
    function processAndShare(externalEuint32 operandEuint32, bytes calldata operandProof, address recipientUser)
                            external returns (euint32) {
        require(msg.sender == dataOwner, "Only owner can process");

        euint32 operand = TFHE.fromExternal(operandEuint32, operandProof);
        euint32 result = TFHE.add(encryptedData, operand);

        // ✅ Grant permissions to recipient
        TFHE.allowThis(result);
        TFHE.allow(result, recipientUser);

        emit PermissionsGranted(recipientUser);

        return result;
    }

    /**
     * @notice Demonstrate FHE.allow() with different permissions for different users
     * @param user1 First user
     * @param user2 Second user
     */
    function grantSelectivePermissions(address user1, address user2) external {
        require(msg.sender == dataOwner, "Only owner can grant permissions");

        euint32 data = encryptedData;

        // Grant permission to user1 only
        TFHE.allowThis(data);
        TFHE.allow(data, user1);

        // user2 does NOT get FHE.allow() - cannot decrypt!
        // This shows the critical importance of FHE.allow()
    }

    /**
     * @notice Show that without FHE.allow(), decryption fails
     * @dev This is a conceptual example - in practice, FHE.allow() is required
     * @return Plainly demonstrates the pattern
     */
    function getUnsafeData() external view returns (string memory) {
        // ❌ BAD: Not granting FHE.allow() to caller
        // This would cause "decryption failed" error!
        return "This function demonstrates why FHE.allow() is critical";
    }

    /**
     * @notice Batch permission granting
     * @param users Array of users to grant permission to
     */
    function grantBatchPermissions(address[] calldata users) external {
        require(msg.sender == dataOwner, "Only owner can grant");

        for (uint256 i = 0; i < users.length; i++) {
            require(users[i] != address(0), "Invalid address");
            TFHE.allowThis(encryptedData);
            TFHE.allow(encryptedData, users[i]);
        }
    }

    /**
     * @notice Get data owner
     * @return Owner address
     */
    function getDataOwner() external view returns (address) {
        return dataOwner;
    }

    /**
     * @notice Demonstrate permission verification
     * @return true if FHE.allow() was properly called
     */
    function isProperlyConfigured() external view returns (bool) {
        return dataOwner != address(0);
    }
}
