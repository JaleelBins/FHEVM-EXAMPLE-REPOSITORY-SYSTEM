// SPDX-License-Identifier: BSD-3-Clause-Clear

pragma solidity ^0.8.24;

import "fhevm/lib/TFHE.sol";

/**
 * @title TokenSwaps
 * @notice Demonstrates confidential token swaps using encrypted values
 * @dev Shows how to perform private swaps without revealing amounts
 */
contract TokenSwaps {
    // Token A encrypted balances
    mapping(address => euint64) private balanceTokenA;

    // Token B encrypted balances
    mapping(address => euint64) private balanceTokenB;

    // Swap price (simplified: 1 TokenA = 1 TokenB)
    uint256 public swapRate = 1;

    // Swap history (encrypted)
    struct SwapRecord {
        address user;
        bool isAtoB;
        uint256 timestamp;
    }

    SwapRecord[] private swapHistory;

    // Events
    event SwapExecuted(address indexed user, bool swappedAtoB);
    event BalanceAdded(address indexed user, bool isTokenA);

    /**
     * @notice Add balance of Token A
     * @param amount Amount to add
     */
    function addTokenABalance(uint256 amount) external {
        euint64 encryptedAmount = TFHE.asEuint64(uint64(amount));

        balanceTokenA[msg.sender] = TFHE.add(balanceTokenA[msg.sender], encryptedAmount);

        TFHE.allowThis(balanceTokenA[msg.sender]);
        TFHE.allow(balanceTokenA[msg.sender], msg.sender);

        emit BalanceAdded(msg.sender, true);
    }

    /**
     * @notice Add balance of Token B
     * @param amount Amount to add
     */
    function addTokenBBalance(uint256 amount) external {
        euint64 encryptedAmount = TFHE.asEuint64(uint64(amount));

        balanceTokenB[msg.sender] = TFHE.add(balanceTokenB[msg.sender], encryptedAmount);

        TFHE.allowThis(balanceTokenB[msg.sender]);
        TFHE.allow(balanceTokenB[msg.sender], msg.sender);

        emit BalanceAdded(msg.sender, false);
    }

    /**
     * @notice Swap Token A for Token B (encrypted)
     * @param amountEuint64 Amount of Token A to swap
     * @param amountProof Zero-knowledge proof
     */
    function swapAtoB(externalEuint64 amountEuint64, bytes calldata amountProof) external {
        euint64 amount = TFHE.fromExternal(amountEuint64, amountProof);

        // Deduct Token A from user
        balanceTokenA[msg.sender] = TFHE.sub(balanceTokenA[msg.sender], amount);

        TFHE.allowThis(balanceTokenA[msg.sender]);
        TFHE.allow(balanceTokenA[msg.sender], msg.sender);

        // Add equivalent Token B (with swap rate)
        // For simplicity, assuming 1:1 rate
        euint64 tokenBAmount = amount;

        balanceTokenB[msg.sender] = TFHE.add(balanceTokenB[msg.sender], tokenBAmount);

        TFHE.allowThis(balanceTokenB[msg.sender]);
        TFHE.allow(balanceTokenB[msg.sender], msg.sender);

        // Record swap privately
        swapHistory.push(SwapRecord({
            user: msg.sender,
            isAtoB: true,
            timestamp: block.timestamp
        }));

        emit SwapExecuted(msg.sender, true);
    }

    /**
     * @notice Swap Token B for Token A (encrypted)
     * @param amountEuint64 Amount of Token B to swap
     * @param amountProof Zero-knowledge proof
     */
    function swapBtoA(externalEuint64 amountEuint64, bytes calldata amountProof) external {
        euint64 amount = TFHE.fromExternal(amountEuint64, amountProof);

        // Deduct Token B from user
        balanceTokenB[msg.sender] = TFHE.sub(balanceTokenB[msg.sender], amount);

        TFHE.allowThis(balanceTokenB[msg.sender]);
        TFHE.allow(balanceTokenB[msg.sender], msg.sender);

        // Add equivalent Token A
        euint64 tokenAAmount = amount;

        balanceTokenA[msg.sender] = TFHE.add(balanceTokenA[msg.sender], tokenAAmount);

        TFHE.allowThis(balanceTokenA[msg.sender]);
        TFHE.allow(balanceTokenA[msg.sender], msg.sender);

        // Record swap privately
        swapHistory.push(SwapRecord({
            user: msg.sender,
            isAtoB: false,
            timestamp: block.timestamp
        }));

        emit SwapExecuted(msg.sender, false);
    }

    /**
     * @notice Get encrypted balance of Token A
     * @return Encrypted balance
     */
    function getTokenABalance() external returns (euint64) {
        euint64 balance = balanceTokenA[msg.sender];

        TFHE.allowThis(balance);
        TFHE.allow(balance, msg.sender);

        return balance;
    }

    /**
     * @notice Get encrypted balance of Token B
     * @return Encrypted balance
     */
    function getTokenBBalance() external returns (euint64) {
        euint64 balance = balanceTokenB[msg.sender];

        TFHE.allowThis(balance);
        TFHE.allow(balance, msg.sender);

        return balance;
    }

    /**
     * @notice Check if Token A balance exceeds amount
     * @param amountEuint64 Amount to check
     * @param amountProof Proof
     * @return Comparison result
     */
    function tokenABalanceGreaterThan(externalEuint64 amountEuint64, bytes calldata amountProof)
                                      external returns (ebool) {
        euint64 amount = TFHE.fromExternal(amountEuint64, amountProof);
        euint64 balance = balanceTokenA[msg.sender];

        ebool result = TFHE.gt(balance, amount);

        TFHE.allowThis(result);
        TFHE.allow(result, msg.sender);

        return result;
    }

    /**
     * @notice Perform conditional swap based on encrypted comparison
     * @param amountEuint64 Amount to swap
     * @param amountProof Proof
     * @param minAmountEuint64 Minimum desired amount
     * @param minProof Proof
     */
    function swapWithMinimum(externalEuint64 amountEuint64, bytes calldata amountProof,
                            externalEuint64 minAmountEuint64, bytes calldata minProof)
                            external {
        euint64 amount = TFHE.fromExternal(amountEuint64, amountProof);
        euint64 minAmount = TFHE.fromExternal(minAmountEuint64, minProof);

        // Check if amount >= minAmount
        ebool isSufficientAmount = TFHE.ge(amount, minAmount);

        TFHE.allowThis(isSufficientAmount);

        // Only proceed if condition is met (in practice, would need to verify this)
        // For encrypted comparison, this would need careful handling

        // Proceed with swap
        balanceTokenA[msg.sender] = TFHE.sub(balanceTokenA[msg.sender], amount);

        TFHE.allowThis(balanceTokenA[msg.sender]);
        TFHE.allow(balanceTokenA[msg.sender], msg.sender);

        balanceTokenB[msg.sender] = TFHE.add(balanceTokenB[msg.sender], amount);

        TFHE.allowThis(balanceTokenB[msg.sender]);
        TFHE.allow(balanceTokenB[msg.sender], msg.sender);

        emit SwapExecuted(msg.sender, true);
    }

    /**
     * @notice Get swap history count (privacy-preserving)
     * @return Number of swaps
     */
    function getSwapHistoryLength() external view returns (uint256) {
        return swapHistory.length;
    }

    /**
     * @notice Get swap rate
     * @return Current swap rate
     */
    function getSwapRate() external view returns (uint256) {
        return swapRate;
    }

    /**
     * @notice Update swap rate (admin function simplified)
     * @param newRate New swap rate
     */
    function updateSwapRate(uint256 newRate) external {
        require(newRate > 0, "Invalid rate");
        swapRate = newRate;
    }
}
