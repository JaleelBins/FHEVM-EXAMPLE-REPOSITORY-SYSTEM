# FHEVM Best Practices Guide

Comprehensive best practices for building production-quality FHEVM applications.

---

## 1. Code Quality

### 1.1 Contract Development

**✅ DO:**
- Use clear, descriptive variable names
- Add comprehensive comments explaining logic
- Follow consistent code formatting
- Use events for important state changes
- Implement proper error handling
- Keep contracts focused and modular

**Example:**
```solidity
// ✅ Good: Clear naming and documentation
/// @notice Deposit encrypted funds
/// @param encryptedAmount User's encrypted deposit amount
/// @param proof Zero-knowledge proof of encryption correctness
/// @dev Requires user to have decryption capability
function depositEncrypted(
    externalEuint32 encryptedAmount,
    bytes calldata proof
) external {
    euint32 amount = FHE.fromExternal(encryptedAmount, proof);

    // Update balance with encrypted value
    _balances[msg.sender] = FHE.add(_balances[msg.sender], amount);

    // Grant permissions for future access
    FHE.allowThis(_balances[msg.sender]);
    FHE.allow(_balances[msg.sender], msg.sender);

    emit DepositMade(msg.sender, block.timestamp);
}

// ❌ Bad: Unclear naming, missing comments
function d(externalEuint32 a, bytes calldata p) external {
    euint32 x = FHE.fromExternal(a, p);
    _b[msg.sender] = FHE.add(_b[msg.sender], x);
    FHE.allow(_b[msg.sender], msg.sender);
}
```

### 1.2 Security Practices

**✅ DO:**
- Always grant both permissions (FHE.allowThis + FHE.allow)
- Verify input proofs are valid
- Use appropriate data types
- Implement access control for sensitive functions
- Handle edge cases and boundaries
- Test with malicious inputs

**❌ DON'T:**
- Use hardcoded addresses or values
- Skip input validation
- Assume user permissions are granted
- Mix encrypted and unencrypted values without care
- Deploy unaudited contracts to mainnet

### 1.3 Contract Patterns

**✅ DO:**
- Use modifiers for access control
- Emit events for all important operations
- Implement proper state management
- Use interfaces for external contracts
- Follow OpenZeppelin patterns when applicable

**Pattern Example:**
```solidity
// ✅ Good: Proper structure with modifiers and events
contract BestPractices {
    event OperationCompleted(address indexed user, uint timestamp);

    modifier onlyAuthorized() {
        require(_authorized[msg.sender], "Not authorized");
        _;
    }

    function operation(externalEuint32 input, bytes calldata proof)
        external
        onlyAuthorized
    {
        euint32 value = FHE.fromExternal(input, proof);
        _executeOperation(value);
        emit OperationCompleted(msg.sender, block.timestamp);
    }

    function _executeOperation(euint32 value) internal {
        // Implementation
    }
}
```

---

## 2. Testing Practices

### 2.1 Test Coverage

**✅ DO:**
- Test success cases (happy path)
- Test failure cases (error conditions)
- Test edge cases (boundaries)
- Test state consistency
- Test access control
- Test gas efficiency

**Test Structure:**
```typescript
describe("Contract", () => {
  // ✅ Success Cases (60%)
  describe("✅ SUCCESS", () => {
    it("should work normally", async () => { ... });
  });

  // ❌ Failure Cases (20%)
  describe("❌ FAILURE", () => {
    it("should reject unauthorized users", async () => { ... });
  });

  // 🔍 Edge Cases (20%)
  describe("🔍 EDGE", () => {
    it("should handle max values", async () => { ... });
  });
});
```

### 2.2 Test Quality

**✅ DO:**
- Use clear, descriptive test names
- One assertion per test (or related assertions)
- Use Arrange-Act-Assert pattern
- Test both success and failure paths
- Explain what each test demonstrates
- Use fixtures for common setups

**Example:**
```typescript
// ✅ Good: Clear structure and naming
describe("Encryption", () => {
  let contract: EncryptionExample;
  let owner: ethers.Signer;
  let ownerAddress: string;

  beforeEach(async () => {
    [owner] = await ethers.getSigners();
    ownerAddress = await owner.getAddress();
    const Factory = await ethers.getContractFactory("EncryptionExample");
    contract = await Factory.deploy();
  });

  it("✅ should encrypt and store value correctly", async () => {
    // Arrange
    const input = await createEncryptedInput(
      contract.address,
      ownerAddress
    ).add32(100).encrypt();

    // Act
    const tx = await contract.storeEncrypted(
      input.handles[0],
      input.inputProof
    );

    // Assert
    await expect(tx).to.not.be.reverted;
    const value = await contract.getEncryptedValue();
    expect(value).to.not.be.undefined;
  });
});

// ❌ Bad: Unclear test structure
it("test", async () => {
  // What is this testing?
  // No clear arrange-act-assert
  // Unclear assertions
  const input = await createEncryptedInput(...).add32(100).encrypt();
  await contract.store(input.handles[0], input.inputProof);
  const val = await contract.getValue();
  expect(val).to.not.be.undefined;
});
```

---

## 3. Documentation Practices

### 3.1 Code Documentation

**✅ DO:**
- Use JSDoc/TSDoc for functions
- Document parameters and return values
- Explain non-obvious logic
- Provide usage examples
- Document important constants
- Note security considerations

**Example:**
```solidity
/// @title Encrypted Storage Contract
/// @notice Demonstrates secure encrypted value storage
/// @dev Uses FHEVM for all operations

contract StorageExample is ZamaEthereumConfig {
    /// @notice Stores encrypted value for user
    /// @param encryptedValue External encrypted value
    /// @param proof Zero-knowledge proof of correct encryption
    /// @dev Critical: Both FHE.allowThis() and FHE.allow() must be called
    ///      to grant contract and user permissions respectively
    function store(
        externalEuint32 encryptedValue,
        bytes calldata proof
    ) external {
        // ...
    }
}
```

### 3.2 Documentation Structure

**README should include:**
- Overview of what the example teaches
- Concepts demonstrated
- Prerequisites
- Installation instructions
- How to run tests
- Key patterns used
- Common mistakes to avoid
- Further reading resources

---

## 4. Performance Best Practices

### 4.1 Gas Optimization

**✅ DO:**
- Batch operations when possible
- Minimize state changes
- Use efficient data structures
- Cache frequently accessed values
- Use appropriate types (smaller types = less gas)

**❌ DON'T:**
- Perform unnecessary operations
- Update state multiple times for single operation
- Use inefficient loops
- Waste storage with poor design

**Example:**
```solidity
// ✅ Optimized: Batch operations
function batchAdd(
    externalEuint32[] calldata values,
    bytes[] calldata proofs
) external {
    euint32 sum = FHE.asEuint32(0);

    for (uint i = 0; i < values.length; i++) {
        euint32 value = FHE.fromExternal(values[i], proofs[i]);
        sum = FHE.add(sum, value);
    }

    _result = sum;
    FHE.allowThis(_result);
    FHE.allow(_result, msg.sender);
}

// ❌ Inefficient: Separate operations
function inefficientAdd(
    externalEuint32[] calldata values,
    bytes[] calldata proofs
) external {
    for (uint i = 0; i < values.length; i++) {
        euint32 value = FHE.fromExternal(values[i], proofs[i]);

        // Updates state and permissions multiple times!
        _result = FHE.add(_result, value);
        FHE.allowThis(_result);
        FHE.allow(_result, msg.sender);
    }
}
```

### 4.2 Testing Performance

**✅ DO:**
- Measure gas usage
- Track performance over time
- Optimize hot paths
- Test with realistic data sizes

```typescript
it("should use reasonable gas", async () => {
  const input = await createEncryptedInput(...)
    .add32(100).encrypt();

  const tx = await contract.operation(input.handles[0], input.inputProof);
  const receipt = await tx.wait();

  console.log(`Gas used: ${receipt?.gasUsed}`);
  expect(receipt?.gasUsed).to.be.lt(500000);
});
```

---

## 5. Security Best Practices

### 5.1 Input Validation

**✅ DO:**
- Validate input proofs before use
- Check for zero addresses
- Verify user permissions
- Implement reentrancy guards if needed
- Use safe math operations

### 5.2 Permission Management

**✅ DO:**
- Always use both FHE.allowThis() and FHE.allow()
- Grant minimum necessary permissions
- Understand encryption binding
- Verify signer matches encryption

**Critical Checklist:**
```
[ ] FHE.allowThis() called for contract operations
[ ] FHE.allow() called for user decryption
[ ] Encryption signer matches transaction signer
[ ] Input proofs are validated
[ ] Access control implemented
[ ] No hardcoded values
[ ] Events emitted for important operations
```

### 5.3 Common Vulnerabilities to Avoid

1. **Missing Permissions**
   ```solidity
   // ❌ WRONG
   _value = FHE.add(_value, input);
   FHE.allow(_value, msg.sender);  // Missing FHE.allowThis()!
   ```

2. **Signer Mismatch**
   ```typescript
   // ❌ WRONG
   const input = await createEncryptedInput(addr, alice.address)...;
   await contract.connect(bob).operation(...);  // Bob is different from Alice
   ```

3. **View Functions with Encrypted Data**
   ```solidity
   // ❌ WRONG
   function getValue() external view returns (euint32) {
       return _encryptedValue;  // View functions can't work with encrypted values
   }
   ```

---

## 6. Development Workflow

### 6.1 Local Development

**Best Practice Flow:**
```bash
1. npm install
2. npm run compile
3. npm run test
4. npm run test:gas
5. npm run lint
6. npm run format
```

### 6.2 Testing Before Deployment

**✅ DO:**
- Compile without warnings
- All tests pass
- Gas reports reviewed
- Code linted and formatted
- Security review completed
- Documentation updated

### 6.3 Version Control

**✅ DO:**
- Use meaningful commit messages
- Keep changes atomic
- Document breaking changes
- Tag releases
- Maintain CHANGELOG

**❌ DON'T:**
- Commit private keys or secrets
- Commit node_modules
- Commit build artifacts
- Push without testing

---

## 7. Documentation Best Practices

### 7.1 README Structure

```markdown
# Example Title

## Overview
[What this demonstrates]

## Difficulty Level
[Beginner/Intermediate/Advanced]

## Concepts
[List of key concepts]

## Prerequisites
[Required knowledge]

## Installation
[Setup instructions]

## Tests
[How to run tests]

## Key Patterns
[Important patterns used]

## Common Mistakes
[What NOT to do]

## Further Learning
[Links to related resources]
```

### 7.2 Code Comments

**✅ DO:**
- Explain the "why" not just the "what"
- Document assumptions
- Explain edge cases
- Add examples where helpful
- Update comments when code changes

---

## 8. Team Collaboration

### 8.1 Code Review

**Focus Areas:**
- Does it follow FHEVM patterns?
- Are both permissions granted?
- Is input validation present?
- Are tests comprehensive?
- Is documentation clear?
- Is code secure?

### 8.2 Documentation Review

**Check:**
- Is it understandable to newcomers?
- Are examples correct and runnable?
- Do patterns match code?
- Are edge cases explained?
- Links are working?

---

## 9. Continuous Improvement

### 9.1 Monitoring

**Track:**
- Gas usage trends
- Test coverage
- Documentation updates
- Community feedback
- Security audits

### 9.2 Refactoring

**When to Refactor:**
- Code duplication (DRY principle)
- Complex functions need simplification
- Better patterns emerge
- Performance improvements found
- Documentation becomes outdated

### 9.3 Community Engagement

**✅ DO:**
- Share learnings
- Help other developers
- Report bugs clearly
- Contribute improvements
- Participate in discussions

---

## 10. Quick Checklist

Use this before committing code:

```
Code Quality:
[ ] Clear variable names
[ ] Comprehensive comments
[ ] Proper formatting
[ ] No hardcoded values

Security:
[ ] FHE.allowThis() called
[ ] FHE.allow() called
[ ] Input validation present
[ ] Access control implemented

Testing:
[ ] All tests pass
[ ] Success cases tested
[ ] Failure cases tested
[ ] Edge cases tested

Documentation:
[ ] Functions documented
[ ] README complete
[ ] Examples provided
[ ] Edge cases explained

Performance:
[ ] Gas optimized
[ ] No unnecessary operations
[ ] State changes minimized

Deployment:
[ ] Compiles without warnings
[ ] All tests passing
[ ] Linted and formatted
[ ] Code reviewed
[ ] Security audit completed
```

---

## Summary

Following these best practices ensures:
- ✅ **Quality**: Professional code and documentation
- ✅ **Security**: Proper FHEVM patterns and validation
- ✅ **Performance**: Efficient and optimized code
- ✅ **Maintainability**: Clear and documented
- ✅ **Reliability**: Comprehensive testing

**Excellence requires attention to detail!**
