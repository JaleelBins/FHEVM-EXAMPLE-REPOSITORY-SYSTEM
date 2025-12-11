# Example Categories & Implementation Reference

This document outlines all the example categories and specific examples that should be included in your submission.

---

## 📊 Category Overview

Your submission should include examples across these categories:

| Category | Examples | Difficulty | Priority |
|----------|----------|-----------|----------|
| **Basic** | 7-9 | Beginner | REQUIRED |
| **Access Control** | 3-4 | Intermediate | REQUIRED |
| **Anti-patterns** | 3-4 | Intermediate | REQUIRED |
| **OpenZeppelin** | 3-5 | Advanced | REQUIRED |
| **Advanced** | 2-4 | Advanced | OPTIONAL |

**Total Minimum: 18-20 examples**
**Recommended: 25+ examples**

---

## 🟢 BASIC CATEGORY (7-9 Examples)

### Purpose
Teach fundamental FHEVM operations and concepts.

### 1. FHE Counter
**Description:** Simple encrypted counter demonstrating FHE.add and FHE.sub
**Concepts:** Encryption, arithmetic, permissions
**Difficulty:** Beginner
**Key Patterns:**
```solidity
euint32 _count;
_count = FHE.add(_count, encryptedValue);
FHE.allowThis(_count);
FHE.allow(_count, msg.sender);
```

**Test Cases:**
- ✅ Increment encrypted counter
- ✅ Decrement encrypted counter
- ✅ Verify permissions are set
- ❌ Show missing FHE.allowThis()

### 2. FHE Addition (FHE.add)
**Description:** Demonstrates FHE addition operation
**Concepts:** FHE.add operation, encrypted arithmetic
**Difficulty:** Beginner
**Key Patterns:**
```solidity
euint32 result = FHE.add(a, b);
// Result is encrypted, operations are hidden
```

### 3. FHE Subtraction (FHE.sub)
**Description:** Demonstrates FHE subtraction operation
**Concepts:** FHE.sub operation, underflow handling
**Difficulty:** Beginner
**Key Patterns:**
```solidity
euint32 result = FHE.sub(a, b);
// Handle potential underflow
```

### 4. FHE Equality (FHE.eq)
**Description:** Demonstrates FHE equality comparison
**Concepts:** FHE.eq operation, comparison operations
**Difficulty:** Beginner
**Key Patterns:**
```solidity
ebool isEqual = FHE.eq(a, b);
// Result is encrypted boolean
```

### 5. Encrypt Single Value
**Description:** Encrypt a single value and store encrypted result
**Concepts:** fromExternal, input binding, single value handling
**Difficulty:** Beginner
**Key Patterns:**
```solidity
euint32 encrypted = FHE.fromExternal(externalValue, inputProof);
// Value is now encrypted and bound to contract/user
```

### 6. Encrypt Multiple Values
**Description:** Handle multiple encrypted values in single operation
**Concepts:** Multiple encrypted values, array handling
**Difficulty:** Beginner
**Key Patterns:**
```solidity
euint32 val1 = FHE.fromExternal(ext1, proof1);
euint32 val2 = FHE.fromExternal(ext2, proof2);
// Both values encrypted independently
```

### 7. User Decrypt Single Value
**Description:** Allow user to decrypt single encrypted value
**Concepts:** User decryption, permissions, result disclosure
**Difficulty:** Beginner
**Key Patterns:**
```solidity
FHE.allow(_encryptedValue, msg.sender);
// User can decrypt the value
```

### 8. User Decrypt Multiple Values
**Description:** Allow user to decrypt multiple encrypted values
**Concepts:** Multiple decryptions, batch operations
**Difficulty:** Beginner
**Key Patterns:**
```solidity
FHE.allow(val1, msg.sender);
FHE.allow(val2, msg.sender);
// Multiple values accessible to user
```

### 9. Public Decrypt Single Value
**Description:** Decrypt value for public disclosure
**Concepts:** Public decryption, value disclosure
**Difficulty:** Intermediate
**Key Patterns:**
```solidity
// Special handling for public decryption
// Value becomes known to all
```

### 10. Public Decrypt Multiple Values
**Description:** Decrypt multiple values for public disclosure
**Concepts:** Multiple public decryptions
**Difficulty:** Intermediate

---

## 🔐 ACCESS CONTROL CATEGORY (3-4 Examples)

### Purpose
Teach proper permission management and access control patterns.

### 1. Access Control Fundamentals
**Description:** Introduction to FHE permission system
**Concepts:**
- Why permissions are needed
- Contract vs user permissions
- Permission lifecycle
**Difficulty:** Intermediate

**Key Concepts:**
```solidity
// Two levels of permission needed:
1. Contract permission: FHE.allowThis()
2. User permission: FHE.allow(value, user)

// Example:
FHE.allowThis(_encryptedValue);        // Contract can use it
FHE.allow(_encryptedValue, msg.sender); // User can decrypt it
```

### 2. FHE.allow Usage Patterns
**Description:** Proper use of FHE.allow() for user permissions
**Concepts:** User access, selective disclosure
**Difficulty:** Intermediate

**Patterns Demonstrated:**
- Granting permission to single user
- Granting permission to multiple users
- When to grant permissions
- Permission lifecycle

### 3. FHE.allowThis() Pattern
**Description:** Contract-level permissions explained
**Concepts:** Contract access, internal operations
**Difficulty:** Intermediate

**Critical Pattern:**
```solidity
// MUST call this before FHE.allow()
FHE.allowThis(_encryptedValue);

// Without it, even FHE.allow() won't work
```

### 4. FHE.allowTransient() Pattern (Advanced)
**Description:** Temporary permissions for transient values
**Concepts:** Transient permissions, temporary access
**Difficulty:** Advanced

**Pattern:**
```solidity
FHE.allowTransient(_tempValue);
// Permissions valid only for current transaction
```

---

## ❌ ANTI-PATTERNS CATEGORY (3-4 Examples)

### Purpose
Teach developers what NOT to do and why it fails.

### 1. View Functions with Encrypted Values
**Description:** Why you cannot use encrypted values in view functions
**Concepts:** Function visibility, encrypted operations
**Difficulty:** Intermediate

**Anti-pattern Demonstrated:**
```solidity
// ❌ WRONG - view functions cannot use encrypted values
function getEncryptedValue() external view returns (euint32) {
    return _encryptedValue;  // FAILS
}

// ✅ CORRECT - use non-view function with permissions
function getEncryptedValue() external returns (euint32) {
    euint32 value = _encryptedValue;
    FHE.allow(value, msg.sender);
    return value;
}
```

### 2. Missing FHE.allowThis() Permission
**Description:** Why both permissions are critical
**Concepts:** Permission requirement, common mistake
**Difficulty:** Intermediate

**Anti-pattern Demonstrated:**
```solidity
// ❌ WRONG - missing FHE.allowThis()
function update(externalEuint32 input, bytes calldata proof) external {
    euint32 enc = FHE.fromExternal(input, proof);
    _value = FHE.add(_value, enc);
    FHE.allow(_value, msg.sender);  // Still fails without allowThis
}

// ✅ CORRECT - grant both permissions
function update(externalEuint32 input, bytes calldata proof) external {
    euint32 enc = FHE.fromExternal(input, proof);
    _value = FHE.add(_value, enc);
    FHE.allowThis(_value);           // Contract permission
    FHE.allow(_value, msg.sender);   // User permission
}
```

### 3. Encryption/Signer Mismatch
**Description:** Why encryption binding must match signer
**Concepts:** Encryption binding, signer matching
**Difficulty:** Intermediate

**Anti-pattern Demonstrated:**
```typescript
// ❌ WRONG - encrypt with alice, execute with bob
const enc = await fhevm.createEncryptedInput(
    contractAddress,
    alice.address  // Encrypted for alice
).add32(100).encrypt();

await contract.connect(bob).operation(
    enc.handles[0],
    enc.inputProof  // FAILS - bob wasn't the original signer
);

// ✅ CORRECT - same signer for encrypt and execute
const enc = await fhevm.createEncryptedInput(
    contractAddress,
    bob.address  // Encrypted for bob
).add32(100).encrypt();

await contract.connect(bob).operation(
    enc.handles[0],
    enc.inputProof  // Works - bob was the signer
);
```

### 4. Handle Lifecycle Errors
**Description:** Incorrect handle usage and lifetime management
**Concepts:** Handle management, lifecycle
**Difficulty:** Advanced

**Anti-patterns:**
```solidity
// ❌ WRONG - reusing handles after operation
handle = encrypted;
operation1(handle);
operation2(handle);  // Handle may no longer be valid

// ✅ CORRECT - create fresh handles as needed
handle1 = encrypted;
operation1(handle1);
handle2 = encrypted;  // Fresh handle
operation2(handle2);
```

---

## 🔒 OPENZEPPELIN CONFIDENTIAL CATEGORY (3-5 Examples)

### Purpose
Demonstrate OpenZeppelin's confidential token standards.

### 1. ERC7984 Standard Implementation
**Description:** Basic ERC7984 confidential token example
**Concepts:** ERC7984, confidential tokens, standard compliance
**Difficulty:** Advanced

**Key Features:**
- Confidential balances
- Confidential transfers
- Encryption integration
- Standard interface

### 2. ERC7984 to ERC20 Wrapper
**Description:** Wrap confidential token as standard ERC20
**Concepts:** Token wrapping, interoperability
**Difficulty:** Advanced

**Pattern:**
```solidity
// Confidential token with ERC20 interface
contract ERC7984Wrapper is ERC20 {
    IERC7984 confidentialToken;

    // Deposit confidential, withdraw clear
    function deposit(euint256 amount) external { ... }
    function withdraw(uint256 amount) external { ... }
}
```

### 3. Swap ERC7984 to ERC20
**Description:** Convert between confidential and standard tokens
**Concepts:** Token swapping, liquidity
**Difficulty:** Advanced

### 4. Swap ERC7984 to ERC7984
**Description:** Direct confidential-to-confidential swapping
**Concepts:** Cross-token operations, privacy
**Difficulty:** Advanced

### 5. Vesting Wallet with Confidential Tokens
**Description:** Time-locked release of confidential tokens
**Concepts:** Vesting schedule, token release, privacy
**Difficulty:** Advanced

**Pattern:**
```solidity
// Time-locked confidential token release
contract ConfidentialVestingWallet {
    euint256 vestingSchedule;
    euint256 vestedAmount;

    function releaseVested() external { ... }
}
```

---

## 🚀 ADVANCED CATEGORY (2-4 Examples)

### Purpose
Demonstrate complex, real-world FHEVM applications.

### 1. Blind Auction
**Description:** Sealed-bid auction with confidential bids
**Concepts:**
- Confidentiality throughout process
- Bid hiding
- Winner determination
- Privacy preservation

**Key Patterns:**
```solidity
contract BlindAuction {
    euint256 private _highestBid;
    address private _highestBidder;

    function bid(euint256 amount, bytes calldata proof) external {
        euint256 encryptedAmount = FHE.fromExternal(amount, proof);

        // Compare bids without revealing
        ebool isBetter = FHE.gt(encryptedAmount, _highestBid);

        // Conditional update based on encrypted comparison
        // ...
    }
}
```

### 2. Confidential Dutch Auction
**Description:** Dutch auction with encrypted price decay
**Concepts:** Dynamic pricing, privacy, auction mechanisms
**Difficulty:** Advanced

### 3. Confidential Marketplace
**Description:** Private trading of encrypted assets
**Concepts:** Marketplace patterns, privacy
**Difficulty:** Advanced

### 4. FHE Games (e.g., FHE Wordle)
**Description:** Game logic with hidden state
**Concepts:** Game mechanics, privacy, randomness
**Difficulty:** Advanced

---

## 🎮 OPTIONAL/BONUS CATEGORY (Examples Beyond Requirements)

### Bonus Example Ideas

1. **Privacy-Preserving Voting**
   - Encrypted ballots
   - Secret counting
   - Result disclosure

2. **Confidential DeFi**
   - Private lending
   - Secret trading
   - Hidden liquidity pools

3. **Privacy-Preserving NFTs**
   - Encrypted metadata
   - Secret ownership
   - Private transfers

4. **Confidential Insurance**
   - Secret claims
   - Private underwriting
   - Encrypted payouts

5. **Privacy-Enabled Supply Chain**
   - Secret shipment tracking
   - Confidential pricing
   - Private transactions

6. **Encrypted Reputation Systems**
   - Secret scoring
   - Private records
   - Confidential feedback

---

## 📋 Implementation Checklist

For each example category, ensure:

### Contract Implementation
- [ ] Clear contract title and description
- [ ] Inherits from ZamaEthereumConfig
- [ ] Uses appropriate euint types
- [ ] Proper permission management (FHE.allowThis + FHE.allow)
- [ ] Input validation
- [ ] Error handling
- [ ] Event emissions
- [ ] Gas efficiency

### Test Coverage
- [ ] All functions tested
- [ ] ✅ Success cases (happy path)
- [ ] ❌ Failure cases (error conditions)
- [ ] 🔍 Edge cases (boundary values)
- [ ] Comprehensive assertions
- [ ] Clear test descriptions
- [ ] Permission verification

### Documentation
- [ ] Clear comments in code
- [ ] JSDoc for functions
- [ ] Test documentation
- [ ] README per example
- [ ] Generated markdown
- [ ] Cross-references to related examples

### Automation
- [ ] Included in EXAMPLES_MAP
- [ ] Can be generated with create-fhevm-example
- [ ] Part of relevant category
- [ ] Documented in configuration
- [ ] Verified working

---

## 🔄 Category Organization

### Directory Structure for All Examples

```
contracts/
├── basic/
│   ├── FHECounter.sol
│   ├── FHEAdd.sol
│   ├── FHESub.sol
│   ├── FHEEq.sol
│   ├── EncryptSingleValue.sol
│   ├── EncryptMultipleValues.sol
│   ├── UserDecryptSingleValue.sol
│   └── UserDecryptMultipleValues.sol
├── access-control/
│   ├── AccessControlFundamentals.sol
│   ├── FHEAllowUsage.sol
│   ├── FHEAllowThisPattern.sol
│   └── FHEAllowTransient.sol
├── anti-patterns/
│   ├── ViewFunctionError.sol
│   ├── MissingAllowThis.sol
│   ├── SignerMismatch.sol
│   └── HandleLifecycleErrors.sol
├── openzeppelin/
│   ├── ERC7984Example.sol
│   ├── ERC7984Wrapper.sol
│   ├── SwapERC7984ToERC20.sol
│   ├── SwapERC7984ToERC7984.sol
│   └── VestingWalletConfidential.sol
└── advanced/
    ├── BlindAuction.sol
    ├── ConfidentialDutchAuction.sol
    └── [Your Creative Examples]

test/
└── [Mirror structure with .ts test files]
```

---

## 📊 Difficulty Progression

### Learning Path

1. **Start Here (Beginner)**
   - FHE Counter
   - Encrypt Single Value
   - User Decrypt

2. **Build Skills (Intermediate)**
   - Encrypt Multiple Values
   - Access Control Fundamentals
   - Anti-pattern examples

3. **Advanced Concepts (Advanced)**
   - OpenZeppelin examples
   - Blind Auction
   - Custom applications

---

## ✅ Quality Gates

Each example must meet these standards:

- ✅ Code compiles without errors
- ✅ All tests pass
- ✅ Clear documentation
- ✅ Demonstrates key concepts
- ✅ Shows both correct and anti-patterns
- ✅ Proper error handling
- ✅ Gas efficient
- ✅ Security best practices
- ✅ No hardcoded values
- ✅ Professional code quality

---

This reference guide outlines the scope and depth expected for your submission. Cover these categories comprehensively to demonstrate mastery of FHEVM concepts!

