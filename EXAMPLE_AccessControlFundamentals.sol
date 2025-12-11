// SPDX-License-Identifier: BSD-3-Clause-Clear

pragma solidity ^0.8.24;

import "fhevm/lib/TFHE.sol";

/**
 * @title AccessControlFundamentals
 * @notice Demonstrates fundamental FHE access control patterns
 * @dev Shows how permission management works in FHEVM
 */
contract AccessControlFundamentals {
    // Encrypted secret data
    euint32 private encryptedSecret;

    // Access control mappings
    mapping(address => bool) public hasAccess;
    mapping(address => uint256) private accessGrantedAt;

    // Events
    event AccessGranted(address indexed user);
    event AccessRevoked(address indexed user);
    event SecretAccessed(address indexed user);

    /**
     * @notice Initialize with encrypted secret
     * @param secretEuint32 Encrypted secret
     * @param secretProof Zero-knowledge proof
     */
    function initializeSecret(externalEuint32 secretEuint32, bytes calldata secretProof) external {
        euint32 secret = TFHE.fromExternal(secretEuint32, secretProof);
        encryptedSecret = secret;

        // Grant initial access to deployer
        hasAccess[msg.sender] = true;
        accessGrantedAt[msg.sender] = block.timestamp;

        emit AccessGranted(msg.sender);
    }

    /**
     * @notice Grant access to a user
     * @param user The user to grant access to
     */
    function grantAccess(address user) external {
        require(hasAccess[msg.sender], "Only authorized users can grant access");
        require(user != address(0), "Invalid address");

        hasAccess[user] = true;
        accessGrantedAt[user] = block.timestamp;

        emit AccessGranted(user);
    }

    /**
     * @notice Revoke access from a user
     * @param user The user to revoke access from
     */
    function revokeAccess(address user) external {
        require(hasAccess[msg.sender], "Only authorized users can revoke access");

        hasAccess[user] = false;
        delete accessGrantedAt[user];

        emit AccessRevoked(user);
    }

    /**
     * @notice Get encrypted secret (with proper permission checks)
     * @return The encrypted secret
     */
    function getSecret() external returns (euint32) {
        require(hasAccess[msg.sender], "Access denied");

        euint32 secret = encryptedSecret;

        // Grant permissions
        TFHE.allowThis(secret);
        TFHE.allow(secret, msg.sender);

        emit SecretAccessed(msg.sender);

        return secret;
    }

    /**
     * @notice Check if user has access
     * @param user The user to check
     * @return true if user has access
     */
    function hasUserAccess(address user) external view returns (bool) {
        return hasAccess[user];
    }

    /**
     * @notice Get when access was granted to user
     * @param user The user
     * @return Timestamp of access grant (or 0 if no access)
     */
    function getAccessGrantTime(address user) external view returns (uint256) {
        return accessGrantedAt[user];
    }

    /**
     * @notice Perform operation on secret with access control
     * @param operandEuint32 Operand
     * @param operandProof Zero-knowledge proof
     * @return Result of operation
     */
    function operateOnSecret(externalEuint32 operandEuint32, bytes calldata operandProof) external returns (euint32) {
        require(hasAccess[msg.sender], "Access denied");

        euint32 operand = TFHE.fromExternal(operandEuint32, operandProof);
        euint32 result = TFHE.add(encryptedSecret, operand);

        TFHE.allowThis(result);
        TFHE.allow(result, msg.sender);

        return result;
    }

    /**
     * @notice Conditional operation based on access level
     * @param accessLevel Required access level (0-2)
     * @return true if caller meets access level
     */
    function checkAccessLevel(uint256 accessLevel) external view returns (bool) {
        if (accessLevel == 0) {
            return true; // Public
        } else if (accessLevel == 1) {
            return hasAccess[msg.sender]; // Restricted
        } else {
            return hasAccess[msg.sender] && accessGrantedAt[msg.sender] <= block.timestamp; // Time-locked
        }
    }
}
