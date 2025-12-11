// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { FHE, euint32, externalEuint32 } from "@fhevm/solidity/lib/FHE.sol";
import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title Encrypted Counter
/// @notice Demonstrates basic FHE operations with encrypted state management
/// @dev This example shows how to:
///   - Store encrypted values on-chain
///   - Perform arithmetic operations on encrypted data
///   - Manage permissions correctly (FHE.allowThis + FHE.allow)
contract FHECounter is ZamaEthereumConfig {
    // ============== State Variables ==============

    /// @notice Encrypted counter value
    /// @dev Stored encrypted on-chain. Only contract and authorized users can read it.
    euint32 private _count;

    /// @notice Number of increment operations performed
    /// @dev Public counter to track operations
    uint32 public incrementCount;

    /// @notice Number of decrement operations performed
    /// @dev Public counter to track operations
    uint32 public decrementCount;

    // ============== Events ==============

    /// @notice Emitted when counter is incremented
    /// @param operator Address that performed the operation
    /// @param newIncrementCount Updated count of increment operations
    event CounterIncremented(address indexed operator, uint32 newIncrementCount);

    /// @notice Emitted when counter is decremented
    /// @param operator Address that performed the operation
    /// @param newDecrementCount Updated count of decrement operations
    event CounterDecremented(address indexed operator, uint32 newDecrementCount);

    // ============== Constructor ==============

    /// @notice Initialize counter to zero
    constructor() {
        _count = FHE.asEuint32(0);
    }

    // ============== Main Functions ==============

    /// @notice Increment the encrypted counter
    /// @param inputEuint32 Encrypted increment value (external input)
    /// @param inputProof Zero-knowledge proof of correct encryption
    /// @dev CRITICAL PATTERN:
    ///   1. Decrypt external input: FHE.fromExternal()
    ///   2. Perform operation: FHE.add()
    ///   3. Grant permissions: FHE.allowThis() + FHE.allow()
    ///
    /// Common mistakes to avoid:
    ///   ❌ Forgetting FHE.allowThis() - contract cannot use result
    ///   ❌ Forgetting FHE.allow() - user cannot decrypt result
    ///   ❌ Input proof mismatch - decryption will fail
    function increment(
        externalEuint32 inputEuint32,
        bytes calldata inputProof
    ) external {
        // Step 1: Decrypt the external input with proof verification
        // The proof ensures the input was encrypted correctly for this contract
        euint32 encryptedInput = FHE.fromExternal(inputEuint32, inputProof);

        // Step 2: Perform arithmetic operation on encrypted values
        // Both operands are encrypted, operation result is encrypted
        _count = FHE.add(_count, encryptedInput);

        // Step 3: Grant permissions for the new encrypted result
        // CRITICAL: Always grant BOTH permissions in this order:

        // Permission 1: Allow contract to use the encrypted value
        // Without this, the contract cannot perform further operations
        FHE.allowThis(_count);

        // Permission 2: Allow caller to decrypt the result
        // Without this, user cannot retrieve the encrypted value
        FHE.allow(_count, msg.sender);

        // Step 4: Track operation (optional)
        incrementCount++;

        // Step 5: Emit event
        emit CounterIncremented(msg.sender, incrementCount);
    }

    /// @notice Decrement the encrypted counter
    /// @param inputEuint32 Encrypted decrement value (external input)
    /// @param inputProof Zero-knowledge proof of correct encryption
    /// @dev Same pattern as increment, but uses FHE.sub instead of FHE.add
    ///
    /// Note: FHE operations don't automatically prevent underflow.
    /// The result wraps around (uint32 behavior).
    function decrement(
        externalEuint32 inputEuint32,
        bytes calldata inputProof
    ) external {
        // Decrypt external input
        euint32 encryptedInput = FHE.fromExternal(inputEuint32, inputProof);

        // Subtract on encrypted data
        _count = FHE.sub(_count, encryptedInput);

        // Grant permissions
        FHE.allowThis(_count);
        FHE.allow(_count, msg.sender);

        // Track operation
        decrementCount++;

        // Emit event
        emit CounterDecremented(msg.sender, decrementCount);
    }

    /// @notice Get the encrypted counter value
    /// @return The encrypted counter (requires user to have decryption permission)
    /// @dev This returns the encrypted value. To decrypt, user needs:
    ///   1. To be in the permission list (granted by FHE.allow)
    ///   2. Access to the decryption capability through the relayer
    ///
    /// Important: This is NOT a view function because it works with encrypted data
    function getEncryptedCount() external returns (euint32) {
        // We return a copy with permissions already granted
        euint32 countCopy = _count;
        FHE.allowThis(countCopy);
        FHE.allow(countCopy, msg.sender);
        return countCopy;
    }

    /// @notice Get the number of increment operations
    /// @return Total increments performed
    function getIncrementCount() external view returns (uint32) {
        return incrementCount;
    }

    /// @notice Get the number of decrement operations
    /// @return Total decrements performed
    function getDecrementCount() external view returns (uint32) {
        return decrementCount;
    }

    // ============== Internal Helpers ==============

    /// @notice Initialize counter to a specific encrypted value
    /// @param initialValue Initial value for the counter
    /// @param proof Proof of correct encryption
    /// @dev Internal function to set initial state
    function _initializeCounter(
        externalEuint32 initialValue,
        bytes calldata proof
    ) internal {
        _count = FHE.fromExternal(initialValue, proof);
        FHE.allowThis(_count);
    }
}
