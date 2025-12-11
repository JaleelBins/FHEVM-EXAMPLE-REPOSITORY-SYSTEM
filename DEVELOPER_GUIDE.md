# Developer Guide: Building FHEVM Examples

This guide helps developers create high-quality FHEVM examples for the competition.

---

## 🎯 Getting Started

### Prerequisites

- Node.js 18.0 or higher
- npm 9.0 or higher
- Git
- Basic Solidity knowledge
- Understanding of FHEVM concepts

### Setup Development Environment

```bash
# 1. Clone base template
git clone <base-template-repo> my-project
cd my-project

# 2. Install dependencies
npm install

# 3. Verify setup
npm run compile
npm run test
```

---

## 📝 Creating Your First Example

### Step 1: Plan Your Example

Before coding, document:
- **What concept** does it teach?
- **Who is the audience?** (beginner/intermediate/advanced)
- **What files are needed?** (contracts, tests, docs)
- **What are the key patterns?** (correct usage)
- **What are the anti-patterns?** (common mistakes)

### Step 2: Write the Contract

Create your contract following best practices:

```solidity
// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { FHE, euint32, externalEuint32 } from "@fhevm/solidity/lib/FHE.sol";
import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title Your Example Title
/// @notice Clear description of what this demonstrates
/// @dev Implementation notes about the pattern
contract YourExample is ZamaEthereumConfig {
  // Clear state variable names
  euint32 private _encryptedValue;
  uint32 public operationCount;

  // Clear event names with parameters
  event OperationCompleted(address indexed user, uint value);

  constructor() {
    _encryptedValue = FHE.asEuint32(0);
  }

  /// @notice Brief description
  /// @param inputEuint32 Encrypted input
  /// @param inputProof Proof of correct encryption
  function operation(
    externalEuint32 inputEuint32,
    bytes calldata inputProof
  ) external {
    // Clear comments explaining each step
    euint32 input = FHE.fromExternal(inputEuint32, inputProof);

    // Perform operation
    _encryptedValue = FHE.add(_encryptedValue, input);

    // Always grant both permissions
    FHE.allowThis(_encryptedValue);
    FHE.allow(_encryptedValue, msg.sender);

    operationCount++;
    emit OperationCompleted(msg.sender, operationCount);
  }
}
```

### Step 3: Write Comprehensive Tests

```typescript
describe("YourExample - ✅ Success Cases", () => {
  it("should execute operation successfully", async () => {
    // Arrange: Prepare encrypted input
    const input = await createEncryptedInput(
      contractAddress,
      owner.address
    )
      .add32(100)
      .encrypt();

    // Act: Execute operation
    const tx = await contract.operation(input.handles[0], input.inputProof);

    // Assert: Verify success
    await expect(tx).to.not.be.reverted;
  });

  it("✅ should grant both permissions", async () => {
    // Test that FHE.allowThis() and FHE.allow() are called
    // Verify encrypted value is accessible to both contract and user
  });
});

describe("YourExample - ❌ Failure Cases", () => {
  it("❌ demonstrates missing FHE.allowThis()", async () => {
    // This test shows what happens without proper permissions
    // Helps developers understand why both permissions are needed
  });

  it("❌ demonstrates encryption/signer mismatch", async () => {
    // Show what happens when signer doesn't match encryption binding
  });
});
```

### Step 4: Add Documentation

Create clear comments explaining:
- What the example teaches
- Why this pattern is important
- Common mistakes to avoid
- How to extend the example

---

## 🏗️ Project Organization

### Directory Structure

```
your-repository/
├── fhevm-hardhat-template/    # Base template
├── contracts/                  # All example contracts
│   ├── basic/
│   │   ├── FHECounter.sol
│   │   ├── FHEAdd.sol
│   │   └── ...
│   ├── access-control/
│   ├── anti-patterns/
│   └── advanced/
├── test/                       # All test files
│   ├── basic/
│   ├── access-control/
│   └── ...
├── scripts/                    # Automation tools
│   ├── create-fhevm-example.ts
│   ├── create-fhevm-category.ts
│   ├── generate-docs.ts
│   └── config.ts
├── examples/                   # Generated documentation
│   ├── SUMMARY.md
│   └── *.md files
├── docs/                       # Developer documentation
│   ├── DEVELOPER_GUIDE.md
│   ├── PATTERNS.md
│   ├── TROUBLESHOOTING.md
│   └── BEST_PRACTICES.md
├── package.json
└── README.md
```

---

## ✨ Best Practices

### Contract Development

**DO:**
- ✅ Use clear, descriptive names
- ✅ Include comprehensive comments
- ✅ Grant permissions correctly
- ✅ Validate inputs
- ✅ Handle errors gracefully
- ✅ Follow Solidity style guide
- ✅ Demonstrate best patterns

**DON'T:**
- ❌ Hardcode values
- ❌ Skip security checks
- ❌ Use vague variable names
- ❌ Forget FHE.allowThis()
- ❌ Create overly complex contracts
- ❌ Leave code uncommented
- ❌ Ignore edge cases

### Test Development

**DO:**
- ✅ Test success cases
- ✅ Test failure cases
- ✅ Test edge cases
- ✅ Include clear descriptions
- ✅ Use ✅/❌ markers
- ✅ Show both patterns and anti-patterns
- ✅ Verify gas efficiency

**DON'T:**
- ❌ Only test happy path
- ❌ Skip error cases
- ❌ Use unclear test names
- ❌ Leave code undocumented
- ❌ Test unrelated functionality
- ❌ Ignore performance

### Documentation

**DO:**
- ✅ Explain concepts clearly
- ✅ Show usage examples
- ✅ Include code snippets
- ✅ List prerequisites
- ✅ Provide further reading
- ✅ Document edge cases
- ✅ Include troubleshooting

**DON'T:**
- ❌ Assume prior knowledge
- ❌ Use jargon without explanation
- ❌ Leave examples incomplete
- ❌ Ignore common mistakes
- ❌ Create overly verbose docs
- ❌ Forget error messages

---

## 🔍 Code Quality Standards

### Solidity Code

```solidity
// ✅ Good: Clear, documented, follows patterns
/// @title Simple FHE Counter
/// @notice Demonstrates FHE.add and permission management
/// @dev Uses euint32 for encrypted state
contract Counter is ZamaEthereumConfig {
  euint32 private _count;

  /// @notice Increment counter
  /// @param value Encrypted increment value
  /// @param proof Input proof for encryption verification
  function increment(externalEuint32 value, bytes calldata proof) external {
    euint32 encrypted = FHE.fromExternal(value, proof);
    _count = FHE.add(_count, encrypted);
    FHE.allowThis(_count);
    FHE.allow(_count, msg.sender);
  }
}

// ❌ Bad: Unclear, unformatted, missing patterns
contract BadCounter {
  euint32 cnt;
  function inc(externalEuint32 v, bytes calldata p) external {
    cnt = FHE.add(cnt, FHE.fromExternal(v, p)); // Missing permissions!
  }
}
```

### TypeScript Tests

```typescript
// ✅ Good: Clear test structure, good naming
describe("FHECounter - Permission Management", () => {
  it("✅ should grant both contract and user permissions", async () => {
    // Clear arrange-act-assert pattern
    const input = await createEncryptedInput(address, owner.address)
      .add32(100)
      .encrypt();

    const tx = await contract.increment(
      input.handles[0],
      input.inputProof
    );

    await expect(tx).to.not.be.reverted;
  });

  it("❌ demonstrates missing FHE.allowThis() permission", async () => {
    // Shows what happens without proper permission
    // Helps developers understand the requirement
  });
});

// ❌ Bad: Unclear naming, insufficient tests
describe("test", () => {
  it("works", async () => {
    // Unclear what this tests
  });
});
```

---

## 🔄 Iteration & Improvement

### Getting Feedback

1. **Test in Generated Repository**
   ```bash
   npm run create-example your-example ./test-output
   cd ./test-output
   npm install
   npm run compile
   npm run test
   ```

2. **Peer Review Checklist**
   - [ ] Code is clear and understandable
   - [ ] Comments explain the "why"
   - [ ] Tests cover success and failure cases
   - [ ] Documentation is complete
   - [ ] Example runs without errors

3. **Community Feedback**
   - Share draft with peers
   - Ask for clarity feedback
   - Verify understanding

### Common Issues & Fixes

**Issue: Tests fail to compile**
- Check import paths
- Verify contract names match
- Ensure TypeScript types are correct

**Issue: Permission errors in tests**
- Verify FHE.allowThis() is called
- Check encryption signer matches
- Ensure input proof is valid

**Issue: Unclear documentation**
- Add more inline comments
- Provide concrete examples
- Explain the "why" not just "what"

---

## 📊 Example Complexity Levels

### Beginner (1-2 concepts)
- Single FHE operation
- Basic encryption/decryption
- Simple test coverage

**Examples:**
- FHE Counter
- Encrypt Single Value
- User Decrypt

### Intermediate (2-3 concepts)
- Multiple operations
- Complex state management
- Comprehensive tests

**Examples:**
- Multi-value encryption
- Access control patterns
- Conditional operations

### Advanced (3+ concepts)
- Complex real-world patterns
- Multiple concepts combined
- Extensive tests and docs

**Examples:**
- Blind Auction
- ERC7984 Implementation
- Advanced DeFi patterns

---

## 🧪 Testing Strategy

### Test Pyramid

```
       /\
      /  \        Edge Cases (5%)
     /    \       - Boundary values
    /------\      - Zero values
   /        \     - Max values
  /   Integration\ (20%)
 /                \ - Multiple operations
/                  \ - State changes
/----Integration----\ - Error conditions
|                   |
|      Unit Tests   | (75%)
|                   | - Individual functions
|  - Happy path     | - Input validation
|  - Error cases    | - Permissions
|  - Edge cases     |
|                   |
\___________________/
```

### Test Coverage Goals

- ✅ Unit tests: 80%+ coverage
- ✅ Integration tests: All main workflows
- ✅ Edge cases: All boundary conditions
- ✅ Anti-patterns: Common mistakes demonstrated

---

## 📚 Documentation Checklist

For each example, create:

- [ ] **Contract Code**
  - [ ] Clear title and description
  - [ ] Detailed JSDoc comments
  - [ ] Inline comments for complex logic
  - [ ] Example usage comments

- [ ] **Test Code**
  - [ ] Clear test descriptions
  - [ ] ✅/❌ markers
  - [ ] Explanatory comments
  - [ ] Arrange-Act-Assert pattern

- [ ] **README**
  - [ ] Overview section
  - [ ] Concepts explained
  - [ ] Prerequisites
  - [ ] How to run
  - [ ] Key patterns
  - [ ] Common mistakes
  - [ ] Further reading

- [ ] **Generated Documentation**
  - [ ] Markdown file with code
  - [ ] Formatted correctly
  - [ ] Indexed in SUMMARY.md
  - [ ] Cross-linked to related examples

---

## 🚀 Performance Optimization

### Gas Optimization

1. **Minimize Storage Operations**
   - Batch multiple changes
   - Use memory variables
   - Avoid redundant operations

2. **Optimize Arithmetic**
   - Use appropriate types
   - Avoid unnecessary conversions
   - Leverage FHE operations

3. **Test Gas Usage**
   ```typescript
   const tx = await contract.operation(...);
   const receipt = await tx.wait();
   console.log(`Gas used: ${receipt.gasUsed}`);
   ```

### Code Efficiency

- Remove unused code
- Consolidate repeated patterns
- Use clear algorithms
- Profile before optimizing

---

## 🔐 Security Considerations

### Common FHEVM Pitfalls

1. **Missing Permissions**
   ```solidity
   // ❌ WRONG
   FHE.allow(value, msg.sender);

   // ✅ CORRECT
   FHE.allowThis(value);
   FHE.allow(value, msg.sender);
   ```

2. **Binding Mismatches**
   ```typescript
   // ❌ WRONG
   const enc = await fhevm.createEncryptedInput(addr, alice.address)...;
   await contract.connect(bob).execute(...);

   // ✅ CORRECT
   const enc = await fhevm.createEncryptedInput(addr, bob.address)...;
   await contract.connect(bob).execute(...);
   ```

3. **Invalid Input Proofs**
   - Always verify input proofs are valid
   - Don't trust external input
   - Validate proof format

### Security Best Practices

- ✅ Always grant permissions correctly
- ✅ Validate all inputs
- ✅ Handle errors gracefully
- ✅ Use appropriate types
- ✅ Document security assumptions
- ✅ Test failure cases

---

## 🎬 Creating Your Demonstration Video

### Video Requirements

**Technical Setup:**
- Screen resolution: 1080p minimum
- Frame rate: 30fps minimum
- Audio: Clear, properly leveled
- Duration: 5-15 minutes

**Content Coverage:**
- [ ] Project overview
- [ ] Directory structure
- [ ] Base template explanation
- [ ] Example generation (create-fhevm-example)
- [ ] Generated repository walkthrough
- [ ] Test execution and results
- [ ] Documentation viewing
- [ ] Your unique contributions

**Recording Tips:**
- Use screen recording software (OBS, ScreenFlow, etc.)
- Add captions or subtitles
- Show your face briefly in intro/outro
- Speak clearly and at moderate pace
- Highlight key concepts
- Show terminal output clearly

---

## 📋 Submission Checklist

Before submitting:

- [ ] All contracts compile without errors
- [ ] All tests pass successfully
- [ ] Documentation is complete
- [ ] Automation scripts work correctly
- [ ] Base template is clean
- [ ] README files are comprehensive
- [ ] No hardcoded secrets or credentials
- [ ] Code follows style guidelines
- [ ] Comments explain important concepts
- [ ] Examples demonstrate key patterns
- [ ] Edge cases are covered
- [ ] Demonstration video is recorded
- [ ] Video is uploaded and accessible
- [ ] Repository is public on GitHub
- [ ] All deliverables are included

---

## 🎓 Learning Resources

### FHEVM Documentation
- [FHEVM Official Docs](https://docs.zama.ai/fhevm)
- [Protocol Examples](https://docs.zama.org/protocol/examples)
- [FHE Concepts](https://docs.zama.ai/fhevm/concepts)

### Hardhat Resources
- [Hardhat Documentation](https://hardhat.org)
- [Hardhat Testing Guide](https://hardhat.org/hardhat-runner/docs/guides/testing)

### Solidity Learning
- [Solidity Documentation](https://docs.soliditylang.org)
- [Solidity by Example](https://solidity-by-example.org)

### Community Support
- [Zama Discord](https://discord.com/invite/zama)
- [Zama Community Forum](https://www.zama.ai/community)
- [GitHub Discussions](https://github.com/zama-ai/fhevm/discussions)

---

## 🎯 Next Steps

1. **Choose Your Example**
   - Pick a FHEVM concept you want to teach
   - Consider difficulty level
   - Plan the implementation

2. **Implement & Test**
   - Write contract and tests
   - Verify everything works
   - Get feedback

3. **Document Well**
   - Add comprehensive comments
   - Create clear documentation
   - Record demonstration video

4. **Prepare Submission**
   - Package everything together
   - Run final verification
   - Submit before deadline

---

Good luck with your FHEVM examples! We're excited to see what you create! 🚀

