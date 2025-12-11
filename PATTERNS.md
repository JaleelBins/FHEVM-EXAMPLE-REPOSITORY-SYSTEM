# FHEVM Core Patterns Guide

This guide documents essential patterns for building secure FHEVM contracts.

---

## 🎯 Critical Patterns

### Pattern 1: Permission Management

**The Double-Permission Pattern**

```solidity
// ✅ CORRECT: Always grant both permissions
function operation(
    externalEuint32 inputEuint32,
    bytes calldata inputProof
) external {
    euint32 encrypted = FHE.fromExternal(inputEuint32, inputProof);
    _value = FHE.add(_value, encrypted);

    // STEP 1: Grant contract permission
    FHE.allowThis(_value);

    // STEP 2: Grant user permission
    FHE.allow(_value, msg.sender);
}

// ❌ WRONG: Forgetting FHE.allowThis()
function badOperation(
    externalEuint32 inputEuint32,
    bytes calldata inputProof
) external {
    euint32 encrypted = FHE.fromExternal(inputEuint32, inputProof);
    _value = FHE.add(_value, encrypted);

    // Missing FHE.allowThis() - Contract cannot use result!
    FHE.allow(_value, msg.sender);
}
```

**Why Both Are Needed:**
- `FHE.allowThis()` → Allows the **contract** to perform operations on the encrypted value
- `FHE.allow(value, user)` → Allows the **user** to decrypt and read the value
- Without either, the operation fails

---

### Pattern 2: Encryption Binding

**User-Contract Binding**

```typescript
// ✅ CORRECT: Encryptor and executor match
const userAddress = await signer.getAddress();

const input = await fhevm.createEncryptedInput(
    contractAddress,
    userAddress  // Encrypt for this user
).add32(100).encrypt();

// Same user executes
await contract.connect(signer).operation(
    input.handles[0],
    input.inputProof
);

// ❌ WRONG: Different users
const input = await fhevm.createEncryptedInput(
    contractAddress,
    alice.address  // Encrypted for Alice
).add32(100).encrypt();

// Bob tries to use it - FAILS!
await contract.connect(bob).operation(
    input.handles[0],
    input.inputProof
);
```

**Why It Matters:**
- Input is bound to the encrypting user
- Only that user can decrypt with the proof
- Mismatch causes: `"decryption failed"`

---

### Pattern 3: Proper Type Handling

**Encrypted Type Management**

```solidity
// ✅ CORRECT: Clear type usage
contract TypeExample {
    euint8 smallValue;      // 8-bit encrypted
    euint16 mediumValue;    // 16-bit encrypted
    euint32 largeValue;     // 32-bit encrypted
    euint64 veryLarge;      // 64-bit encrypted

    function add32Values(
        externalEuint32 a,
        externalEuint32 b,
        bytes calldata proofA,
        bytes calldata proofB
    ) external {
        euint32 valA = FHE.fromExternal(a, proofA);
        euint32 valB = FHE.fromExternal(b, proofB);

        // Both are euint32, operation is valid
        euint32 result = FHE.add(valA, valB);

        FHE.allowThis(result);
        FHE.allow(result, msg.sender);
    }
}

// ❌ WRONG: Type mismatches
function badAdd(
    externalEuint32 val32,
    externalEuint8 val8,
    bytes calldata proof32,
    bytes calldata proof8
) external {
    euint32 a = FHE.fromExternal(val32, proof32);
    euint8 b = FHE.fromExternal(val8, proof8);

    // Type mismatch - cannot add euint32 and euint8 directly!
    euint32 result = FHE.add(a, b);  // Compilation error
}
```

---

### Pattern 4: Conditional Operations

**If-Then-Else on Encrypted Data**

```solidity
// ✅ CORRECT: Conditional operations
function conditionalTransfer(
    euint32 amount,
    euint32 threshold,
    address recipient
) external {
    // Compare encrypted values
    ebool shouldTransfer = FHE.lt(amount, threshold);

    // Conditional operation
    euint32 transferAmount = FHE.select(
        shouldTransfer,
        amount,        // If true: transfer amount
        FHE.asEuint32(0)  // If false: transfer zero
    );

    // Use result
    _balances[recipient] = FHE.add(_balances[recipient], transferAmount);

    FHE.allowThis(_balances[recipient]);
    FHE.allow(_balances[recipient], recipient);
}
```

---

### Pattern 5: User Decryption Flow

**Proper Decryption Authorization**

```solidity
// ✅ CORRECT: Authorization before decryption
contract DecryptionExample {
    euint32 private _encryptedBalance;

    // User wants to decrypt their balance
    function requestDecryption() external {
        // Grant permission for current transaction
        FHE.allow(_encryptedBalance, msg.sender);

        // Contract emits event that user can listen to
        // User calls relayer with the encrypted value
        emit DecryptionRequested(msg.sender, _encryptedBalance);
    }

    // Relayer calls this with decrypted value
    function receiveDecryptedValue(uint32 decryptedBalance) external {
        // Verify the decrypted value matches
        // (This is simplified - production needs proper verification)
        emit BalanceRevealed(msg.sender, decryptedBalance);
    }
}

// ❌ WRONG: Trying to decrypt without permission
function badDecryption() external view returns (uint32) {
    // View functions cannot work with encrypted values
    // And even if they could, user has no permission!
    return uint32(_encryptedBalance);
}
```

---

### Pattern 6: State Preservation

**Maintaining Encrypted State**

```solidity
// ✅ CORRECT: Preserve encrypted state properly
contract StatePreservation {
    euint32 private _count;

    function increment(
        externalEuint32 amount,
        bytes calldata proof
    ) external {
        // Get current state
        euint32 current = _count;

        // Perform operation
        euint32 newValue = FHE.add(current, FHE.fromExternal(amount, proof));

        // Save new state
        _count = newValue;

        // Grant permissions
        FHE.allowThis(_count);
        FHE.allow(_count, msg.sender);
    }

    // Subsequent operation uses preserved state
    function doubleIncrement(
        externalEuint32 amount,
        bytes calldata proof
    ) external {
        // _count still has previous value
        euint32 newValue = FHE.add(_count, FHE.fromExternal(amount, proof));
        _count = newValue;

        FHE.allowThis(_count);
        FHE.allow(_count, msg.sender);
    }
}
```

---

## 🔒 Security Patterns

### Pattern 7: Input Validation

**Validate Before Encryption**

```solidity
// ✅ CORRECT: Validate after decryption
function deposit(
    externalEuint32 amount,
    bytes calldata proof
) external {
    euint32 decrypted = FHE.fromExternal(amount, proof);

    // Note: Cannot directly validate encrypted values
    // Validation happens when user decrypts and submits proof

    _deposits[msg.sender] = FHE.add(_deposits[msg.sender], decrypted);
    FHE.allowThis(_deposits[msg.sender]);
    FHE.allow(_deposits[msg.sender], msg.sender);
}

// ❌ WRONG: Trying to validate encrypted values
function badDeposit(
    externalEuint32 amount,
    bytes calldata proof
) external {
    euint32 encrypted = FHE.fromExternal(amount, proof);

    // Cannot validate encrypted values!
    // require(encrypted > 0);  // INVALID
}
```

### Pattern 8: Access Control

**Granular Permission Management**

```solidity
// ✅ CORRECT: Multiple user access
contract MultiUserAccess {
    euint32 private _sharedSecret;
    mapping(address => bool) private _authorized;

    function authorize(address user) external onlyOwner {
        _authorized[user] = true;
    }

    function getSharedSecret() external returns (euint32) {
        require(_authorized[msg.sender], "Not authorized");

        euint32 value = _sharedSecret;
        FHE.allowThis(value);
        FHE.allow(value, msg.sender);  // Grant to authorized user

        return value;
    }
}
```

---

## 🧮 Arithmetic Patterns

### Pattern 9: Safe Arithmetic

**Handling Overflow/Underflow**

```solidity
// ✅ CONSIDERED: Acknowledge overflow behavior
function addWithCap(
    euint32 value
) external {
    // euint32 arithmetic wraps around (like uint32)
    // 2^32 - 1 + 1 = 0

    _sum = FHE.add(_sum, value);

    // Production code should implement range checks
    // This is application-specific

    FHE.allowThis(_sum);
    FHE.allow(_sum, msg.sender);
}

// ✅ PATTERN: Use smaller types for bounded values
function safeIncrement(euint8 increment) external {
    // euint8: 0-255 range
    // Smaller overflow risk
    _smallValue = FHE.add(_smallValue, increment);

    FHE.allowThis(_smallValue);
    FHE.allow(_smallValue, msg.sender);
}
```

### Pattern 10: Comparison Operations

**Encrypted Comparisons**

```solidity
// ✅ CORRECT: Comparison patterns
function compareAndAct(
    euint32 a,
    euint32 b
) external {
    // Equal
    ebool isEqual = FHE.eq(a, b);

    // Less than
    ebool isLess = FHE.lt(a, b);

    // Less than or equal
    ebool isLessOrEqual = FHE.le(a, b);

    // Greater than
    ebool isGreater = FHE.gt(a, b);

    // Use results in conditional operations
    euint32 result = FHE.select(
        isGreater,
        a,  // Return a if a > b
        b   // Return b otherwise
    );

    FHE.allowThis(result);
    FHE.allow(result, msg.sender);
}
```

---

## 📊 Testing Patterns

### Pattern 11: Test Structure

**Comprehensive Test Suite**

```typescript
describe("ContractName", () => {
  // ✅ Success Cases
  describe("✅ SUCCESS: Happy Path", () => {
    it("should work as expected", async () => {
      const input = await createEncryptedInput(...)
        .add32(100).encrypt();

      await expect(contract.operation(...))
        .to.not.be.reverted;
    });
  });

  // ❌ Failure Cases
  describe("❌ FAILURE: Error Handling", () => {
    it("should fail with wrong signer", async () => {
      const input = await createEncryptedInput(..., alice.address)...;

      await expect(contract.connect(bob).operation(...))
        .to.be.revertedWith("decryption failed");
    });
  });

  // 🔍 Edge Cases
  describe("🔍 EDGE CASES: Boundary Conditions", () => {
    it("should handle max values", async () => {
      const maxValue = 2 ** 32 - 1;
      const input = await createEncryptedInput(...)
        .add32(maxValue).encrypt();

      await expect(contract.operation(...))
        .to.not.be.reverted;
    });
  });
});
```

---

## 🚀 Performance Patterns

### Pattern 12: Gas Optimization

**Efficient Operations**

```solidity
// ✅ OPTIMIZED: Batch operations
function batchUpdate(
    externalEuint32[] calldata inputs,
    bytes[] calldata proofs
) external {
    euint32 accumulated = FHE.asEuint32(0);

    // Process multiple operations
    for (uint i = 0; i < inputs.length; i++) {
        euint32 value = FHE.fromExternal(inputs[i], proofs[i]);
        accumulated = FHE.add(accumulated, value);
    }

    // Single state update at end
    _total = accumulated;

    // Single permission grant
    FHE.allowThis(_total);
    FHE.allow(_total, msg.sender);
}

// ❌ INEFFICIENT: Individual operations
function inefficientUpdate(
    externalEuint32[] calldata inputs,
    bytes[] calldata proofs
) external {
    // Multiple state updates and permission grants
    for (uint i = 0; i < inputs.length; i++) {
        euint32 value = FHE.fromExternal(inputs[i], proofs[i]);
        _total = FHE.add(_total, value);

        // Inefficient: Update state multiple times
        FHE.allowThis(_total);
        FHE.allow(_total, msg.sender);
    }
}
```

---

## 📋 Pattern Checklist

Use this checklist when writing FHEVM contracts:

- [ ] **Permissions**: Always call both `FHE.allowThis()` and `FHE.allow()`
- [ ] **Binding**: Ensure encryptor and executor match
- [ ] **Types**: Use consistent encrypted types
- [ ] **State**: Properly preserve encrypted state
- [ ] **Input**: Validate proofs and inputs
- [ ] **Access**: Implement proper access control
- [ ] **Tests**: Include ✅ success, ❌ failure, 🔍 edge cases
- [ ] **Documentation**: Clear comments explaining patterns
- [ ] **Gas**: Optimize expensive operations
- [ ] **Security**: No hardcoded values, proper error handling

---

## Summary

These patterns represent best practices from the FHEVM community. Following them ensures:
- ✅ Correct functionality
- ✅ Proper security
- ✅ Good performance
- ✅ Maintainability
- ✅ Clear code

**Always test thoroughly and get code reviewed before deployment!**
