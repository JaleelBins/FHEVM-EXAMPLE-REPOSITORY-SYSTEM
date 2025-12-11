// SPDX-License-Identifier: BSD-3-Clause-Clear

pragma solidity ^0.8.24;

import "fhevm/lib/TFHE.sol";

/**
 * @title ERC7984Example
 * @notice Demonstrates ERC7984 confidential token standard
 * @dev Shows implementation of encrypted balance tracking
 */
contract ERC7984Example {
    // Encrypted balances
    mapping(address => euint64) private encryptedBalances;

    // Metadata
    string public name = "Confidential Token";
    string public symbol = "CONF";
    uint8 public decimals = 18;
    uint256 public totalSupply;

    // Events
    event Transfer(address indexed from, address indexed to, uint256 amount);
    event Mint(address indexed to, uint256 amount);

    /**
     * @notice Mint tokens to address with encrypted balance
     * @param to Recipient address
     * @param amount Amount to mint (plaintext for now)
     */
    function mint(address to, uint256 amount) external {
        require(to != address(0), "Invalid address");

        // Create encrypted balance from plaintext
        euint64 encryptedAmount = TFHE.asEuint64(uint64(amount));

        // Add to recipient's encrypted balance
        encryptedBalances[to] = TFHE.add(encryptedBalances[to], encryptedAmount);

        totalSupply += amount;

        TFHE.allowThis(encryptedBalances[to]);
        TFHE.allow(encryptedBalances[to], to);

        emit Mint(to, amount);
    }

    /**
     * @notice Transfer encrypted tokens
     * @param toEuint64 Recipient address
     * @param toProof Recipient proof
     * @param amountEuint64 Transfer amount (encrypted)
     * @param amountProof Transfer proof
     */
    function transfer(address to, externalEuint64 amountEuint64, bytes calldata amountProof) external {
        require(to != address(0), "Invalid address");

        euint64 amount = TFHE.fromExternal(amountEuint64, amountProof);

        // Deduct from sender
        encryptedBalances[msg.sender] = TFHE.sub(encryptedBalances[msg.sender], amount);

        TFHE.allowThis(encryptedBalances[msg.sender]);
        TFHE.allow(encryptedBalances[msg.sender], msg.sender);

        // Add to recipient
        encryptedBalances[to] = TFHE.add(encryptedBalances[to], amount);

        TFHE.allowThis(encryptedBalances[to]);
        TFHE.allow(encryptedBalances[to], to);

        emit Transfer(msg.sender, to, 0); // Amount not disclosed
    }

    /**
     * @notice Get encrypted balance for caller
     * @return The encrypted balance
     */
    function balanceOf() external returns (euint64) {
        euint64 balance = encryptedBalances[msg.sender];

        TFHE.allowThis(balance);
        TFHE.allow(balance, msg.sender);

        return balance;
    }

    /**
     * @notice Check if balance exceeds amount (encrypted comparison)
     * @param amountEuint64 Amount to check
     * @param amountProof Proof
     * @return Comparison result (encrypted)
     */
    function balanceGreaterThan(externalEuint64 amountEuint64, bytes calldata amountProof)
                               external returns (ebool) {
        euint64 amount = TFHE.fromExternal(amountEuint64, amountProof);
        euint64 balance = encryptedBalances[msg.sender];

        ebool result = TFHE.gt(balance, amount);

        TFHE.allowThis(result);
        TFHE.allow(result, msg.sender);

        return result;
    }

    /**
     * @notice Burn tokens (reduce encrypted balance)
     * @param amountEuint64 Amount to burn
     * @param amountProof Proof
     */
    function burn(externalEuint64 amountEuint64, bytes calldata amountProof) external {
        euint64 amount = TFHE.fromExternal(amountEuint64, amountProof);

        encryptedBalances[msg.sender] = TFHE.sub(encryptedBalances[msg.sender], amount);

        TFHE.allowThis(encryptedBalances[msg.sender]);
        TFHE.allow(encryptedBalances[msg.sender], msg.sender);
    }

    /**
     * @notice Get token metadata
     * @return Token name
     */
    function getName() external view returns (string memory) {
        return name;
    }

    /**
     * @notice Get token symbol
     * @return Token symbol
     */
    function getSymbol() external view returns (string memory) {
        return symbol;
    }
}
