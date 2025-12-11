// SPDX-License-Identifier: BSD-3-Clause-Clear

pragma solidity ^0.8.24;

import "fhevm/lib/TFHE.sol";

/**
 * @title ERC7984Wrapper
 * @notice Demonstrates wrapping standard tokens as confidential tokens
 * @dev Shows how to create a confidential wrapper contract
 */
contract ERC7984Wrapper {
    // Base token address (would import real token)
    // For this example, we simulate with encrypted balances

    // Original public balances
    mapping(address => uint256) public publicBalances;

    // Confidential wrapper with encrypted balances
    mapping(address => euint64) private confidentialBalances;

    string public name = "Wrapped Confidential Token";
    string public symbol = "wCONF";
    uint8 public decimals = 18;

    // Events
    event Wrap(address indexed user, uint256 amount);
    event Unwrap(address indexed user, uint256 amount);
    event ConfidentialTransfer(address indexed from, address indexed to);

    /**
     * @notice Wrap public tokens into confidential tokens
     * @param amount Amount to wrap
     */
    function wrap(uint256 amount) external {
        require(amount > 0, "Amount must be positive");
        require(publicBalances[msg.sender] >= amount, "Insufficient balance");

        // Deduct from public balance
        publicBalances[msg.sender] -= amount;

        // Add to confidential balance
        euint64 wrappedAmount = TFHE.asEuint64(uint64(amount));
        confidentialBalances[msg.sender] = TFHE.add(confidentialBalances[msg.sender], wrappedAmount);

        TFHE.allowThis(confidentialBalances[msg.sender]);
        TFHE.allow(confidentialBalances[msg.sender], msg.sender);

        emit Wrap(msg.sender, amount);
    }

    /**
     * @notice Unwrap confidential tokens back to public tokens
     * @param amountEuint64 Amount to unwrap (encrypted)
     * @param amountProof Proof
     */
    function unwrap(externalEuint64 amountEuint64, bytes calldata amountProof) external {
        euint64 amount = TFHE.fromExternal(amountEuint64, amountProof);

        // Deduct from confidential balance
        confidentialBalances[msg.sender] = TFHE.sub(confidentialBalances[msg.sender], amount);

        TFHE.allowThis(confidentialBalances[msg.sender]);
        TFHE.allow(confidentialBalances[msg.sender], msg.sender);

        // In real scenario, would release public tokens
        // For example: publicBalances[msg.sender] += amountDecrypted;

        emit Unwrap(msg.sender, 0); // Amount encrypted
    }

    /**
     * @notice Transfer confidential tokens privately
     * @param to Recipient address
     * @param amountEuint64 Transfer amount
     * @param amountProof Proof
     */
    function confidentialTransfer(address to, externalEuint64 amountEuint64, bytes calldata amountProof)
                                  external {
        require(to != address(0), "Invalid recipient");

        euint64 amount = TFHE.fromExternal(amountEuint64, amountProof);

        // Deduct from sender
        confidentialBalances[msg.sender] = TFHE.sub(confidentialBalances[msg.sender], amount);

        TFHE.allowThis(confidentialBalances[msg.sender]);
        TFHE.allow(confidentialBalances[msg.sender], msg.sender);

        // Add to recipient
        confidentialBalances[to] = TFHE.add(confidentialBalances[to], amount);

        TFHE.allowThis(confidentialBalances[to]);
        TFHE.allow(confidentialBalances[to], to);

        emit ConfidentialTransfer(msg.sender, to);
    }

    /**
     * @notice Get wrapped balance
     * @return Encrypted balance
     */
    function confidentialBalanceOf() external returns (euint64) {
        euint64 balance = confidentialBalances[msg.sender];

        TFHE.allowThis(balance);
        TFHE.allow(balance, msg.sender);

        return balance;
    }

    /**
     * @notice Get public balance (unwrapped)
     * @return Public balance amount
     */
    function publicBalanceOf(address account) external view returns (uint256) {
        return publicBalances[account];
    }

    /**
     * @notice Deposit public tokens to wrap
     * @param amount Amount to deposit
     */
    function deposit(uint256 amount) external {
        publicBalances[msg.sender] += amount;

        // In real contract, would receive tokens from user
        // e.g., require(token.transferFrom(msg.sender, address(this), amount));

        emit Wrap(msg.sender, amount);
    }

    /**
     * @notice Compare confidential balances
     * @param otherEuint64 Other balance to compare
     * @param otherProof Proof
     * @return Comparison result
     */
    function compareBalances(externalEuint64 otherEuint64, bytes calldata otherProof)
                            external returns (ebool) {
        euint64 other = TFHE.fromExternal(otherEuint64, otherProof);
        euint64 myBalance = confidentialBalances[msg.sender];

        ebool result = TFHE.gt(myBalance, other);

        TFHE.allowThis(result);
        TFHE.allow(result, msg.sender);

        return result;
    }

    /**
     * @notice Get wrapper token info
     * @return name Token name
     * @return symbol Token symbol
     */
    function getTokenInfo() external view returns (string memory, string memory) {
        return (name, symbol);
    }
}
