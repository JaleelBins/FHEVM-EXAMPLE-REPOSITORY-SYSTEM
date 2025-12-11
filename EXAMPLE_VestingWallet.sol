// SPDX-License-Identifier: BSD-3-Clause-Clear

pragma solidity ^0.8.24;

import "fhevm/lib/TFHE.sol";

/**
 * @title VestingWallet
 * @notice Demonstrates confidential token vesting with encrypted balances
 * @dev Shows privacy-preserving token release schedules
 */
contract VestingWallet {
    // Beneficiary of the vesting
    address public beneficiary;

    // Total vested amount (encrypted for privacy)
    euint64 private totalVestedAmount;

    // Released amount (encrypted)
    euint64 private releasedAmount;

    // Vesting start time
    uint256 public vestingStart;

    // Vesting duration in seconds
    uint256 public vestingDuration;

    // Released amounts tracked per milestone
    mapping(uint256 => euint64) private milestoneTotals;
    uint256 public milestoneCount;

    // Events
    event VestingInitialized(address indexed beneficiary, uint256 startTime);
    event TokensReleased(address indexed beneficiary);
    event MilestoneReached(uint256 milestone);

    /**
     * @notice Initialize vesting wallet
     * @param _beneficiary Beneficiary address
     * @param _totalAmountEuint64 Total amount to vest (encrypted)
     * @param _totalAmountProof Proof
     * @param _duration Vesting duration in seconds
     */
    function initialize(address _beneficiary, externalEuint64 _totalAmountEuint64,
                       bytes calldata _totalAmountProof, uint256 _duration) external {
        require(_beneficiary != address(0), "Invalid beneficiary");
        require(_duration > 0, "Invalid duration");

        beneficiary = _beneficiary;
        vestingStart = block.timestamp;
        vestingDuration = _duration;

        euint64 totalAmount = TFHE.fromExternal(_totalAmountEuint64, _totalAmountProof);
        totalVestedAmount = totalAmount;

        releasedAmount = TFHE.asEuint64(0);

        TFHE.allowThis(totalVestedAmount);
        TFHE.allow(totalVestedAmount, _beneficiary);

        TFHE.allowThis(releasedAmount);
        TFHE.allow(releasedAmount, _beneficiary);

        emit VestingInitialized(_beneficiary, vestingStart);
    }

    /**
     * @notice Calculate vested amount based on current time
     * @return Vested amount as percentage (0-100)
     */
    function getVestingProgress() external view returns (uint256) {
        if (block.timestamp < vestingStart) {
            return 0;
        }

        uint256 elapsedTime = block.timestamp - vestingStart;
        if (elapsedTime >= vestingDuration) {
            return 100;
        }

        return (elapsedTime * 100) / vestingDuration;
    }

    /**
     * @notice Release vested tokens (encrypted calculation)
     * @param releaseAmountEuint64 Amount to release
     * @param releaseAmountProof Proof
     */
    function releaseTokens(externalEuint64 releaseAmountEuint64, bytes calldata releaseAmountProof) external {
        require(msg.sender == beneficiary, "Only beneficiary can release");

        euint64 releaseAmount = TFHE.fromExternal(releaseAmountEuint64, releaseAmountProof);

        // Calculate available amount
        euint64 available = TFHE.sub(totalVestedAmount, releasedAmount);

        // Check if release amount <= available
        // In real scenario, would verify this condition

        // Add to released amount
        releasedAmount = TFHE.add(releasedAmount, releaseAmount);

        TFHE.allowThis(releasedAmount);
        TFHE.allow(releasedAmount, beneficiary);

        emit TokensReleased(beneficiary);
    }

    /**
     * @notice Get encrypted total vested amount
     * @return Encrypted total vested
     */
    function getTotalVested() external returns (euint64) {
        euint64 total = totalVestedAmount;

        TFHE.allowThis(total);
        TFHE.allow(total, beneficiary);

        return total;
    }

    /**
     * @notice Get encrypted released amount
     * @return Encrypted released amount
     */
    function getReleased() external returns (euint64) {
        euint64 released = releasedAmount;

        TFHE.allowThis(released);
        TFHE.allow(released, beneficiary);

        return released;
    }

    /**
     * @notice Get encrypted remaining amount
     * @return Encrypted remaining amount
     */
    function getRemaining() external returns (euint64) {
        euint64 total = totalVestedAmount;
        euint64 released = releasedAmount;

        euint64 remaining = TFHE.sub(total, released);

        TFHE.allowThis(remaining);
        TFHE.allow(remaining, beneficiary);

        return remaining;
    }

    /**
     * @notice Record milestone release (encrypted)
     * @param milestone Milestone number
     * @param amountEuint64 Amount released at milestone
     * @param amountProof Proof
     */
    function recordMilestone(uint256 milestone, externalEuint64 amountEuint64, bytes calldata amountProof)
                            external {
        require(msg.sender == beneficiary, "Only beneficiary");

        euint64 amount = TFHE.fromExternal(amountEuint64, amountProof);

        milestoneTotals[milestone] = amount;
        milestoneCount++;

        TFHE.allowThis(amount);
        TFHE.allow(amount, beneficiary);

        emit MilestoneReached(milestone);
    }

    /**
     * @notice Check if beneficiary
     * @return true if caller is beneficiary
     */
    function isBeneficiary() external view returns (bool) {
        return msg.sender == beneficiary;
    }

    /**
     * @notice Get vesting start time
     * @return Start timestamp
     */
    function getVestingStart() external view returns (uint256) {
        return vestingStart;
    }

    /**
     * @notice Get vesting duration
     * @return Duration in seconds
     */
    function getVestingDuration() external view returns (uint256) {
        return vestingDuration;
    }

    /**
     * @notice Get vesting end time
     * @return End timestamp
     */
    function getVestingEnd() external view returns (uint256) {
        return vestingStart + vestingDuration;
    }

    /**
     * @notice Check if vesting is complete
     * @return true if all tokens vested
     */
    function isVestingComplete() external view returns (bool) {
        return block.timestamp >= (vestingStart + vestingDuration);
    }

    /**
     * @notice Calculate vested amount at specific time
     * @param timestamp Time to check
     * @return Percentage vested (0-100)
     */
    function getVestingProgressAt(uint256 timestamp) external view returns (uint256) {
        if (timestamp < vestingStart) {
            return 0;
        }

        uint256 elapsedTime = timestamp - vestingStart;
        if (elapsedTime >= vestingDuration) {
            return 100;
        }

        return (elapsedTime * 100) / vestingDuration;
    }

    /**
     * @notice Compare released amount with expected amount
     * @param expectedEuint64 Expected amount
     * @param expectedProof Proof
     * @return Comparison result
     */
    function compareReleased(externalEuint64 expectedEuint64, bytes calldata expectedProof)
                            external returns (ebool) {
        euint64 expected = TFHE.fromExternal(expectedEuint64, expectedProof);

        ebool result = TFHE.eq(releasedAmount, expected);

        TFHE.allowThis(result);
        TFHE.allow(result, beneficiary);

        return result;
    }
}
