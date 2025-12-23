// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { FHE, euint32 } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title Counter Contract
/// @notice A simple counter contract for demonstration purposes
contract Counter is SepoliaConfig {
    euint32 private _count;

    constructor() {
        _count = FHE.asEuint32(0);
    }

    /// @notice Get the current count
    function getCount() external view returns (euint32) {
        return _count;
    }

    /// @notice Increment the counter
    function increment() external {
        _count = FHE.add(_count, FHE.asEuint32(1));
        FHE.allowThis(_count);
        FHE.allow(_count, msg.sender);
    }

    /// @notice Decrement the counter
    function decrement() external {
        _count = FHE.sub(_count, FHE.asEuint32(1));
        FHE.allowThis(_count);
        FHE.allow(_count, msg.sender);
    }
}
