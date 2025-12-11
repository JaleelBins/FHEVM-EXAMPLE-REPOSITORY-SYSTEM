# Privacy Compliance Audit: FHEVM Example Repository Competition

## 📋 Overview

This competition invites developers to build comprehensive, standalone FHEVM (Fully Homomorphic Encryption Virtual Machine) example repositories that demonstrate privacy-preserving smart contracts using Fully Homomorphic Encryption.

The challenge focuses on creating well-documented, highly reusable example projects with automated scaffolding tools and clear implementation patterns.

**Total Prize Pool: $10,000**
- 🥇 1st Place: $5,000
- 🥈 2nd Place: $3,000
- 🥉 3rd Place: $2,000

---

## 📅 Important Dates

| Event | Date |
|-------|------|
| **Competition Start** | December 1, 2025 |
| **Submission Deadline** | December 31, 2025 (23:59 UTC) |
| **Judging Period** | January 1-15, 2026 |
| **Winners Announcement** | January 20, 2026 |

---

## 🎯 Competition Objectives

Create a system that enables developers to:
- Understand FHEVM core concepts through practical examples
- Quickly scaffold working FHEVM projects
- Learn proper patterns and avoid common pitfalls
- Access high-quality documentation and guides

Your submission should provide:
1. **Standalone Example Repositories** - Individual projects demonstrating specific FHEVM concepts
2. **Automation Tools** - Scripts and CLI tools for scaffolding new examples
3. **Complete Documentation** - Auto-generated GitBook-compatible guides
4. **Comprehensive Tests** - Test suites showing both correct usage and anti-patterns
5. **Maintenance Guides** - Documentation for updating examples when dependencies change

---

## 📋 Requirements

### 1. Project Structure & Simplicity

- **Use Hardhat exclusively** for all examples
- **One repository per example** (no monorepos)
- Keep each repository minimal and focused:
  - `contracts/` - Solidity contracts
  - `test/` - Test files
  - `hardhat.config.ts` - Configuration
  - `package.json` - Dependencies
  - `README.md` - Documentation

- Provide a **shared base template** that can be cloned and customized
- Generate documentation following the official FHEVM documentation standards

### 2. Scaffolding & Automation Tools

Create automation scripts that:
- Clone and customize the base Hardhat template
- Inject specific Solidity contracts into the `contracts/` directory
- Generate matching test files
- Auto-generate documentation from code annotations
- Create standalone, ready-to-use repositories

**Required CLI/Scripts:**
- `create-fhevm-example` - Generate single example repositories
- `create-fhevm-category` - Generate category-based projects with multiple examples
- `generate-docs` - Create GitBook-compatible documentation

### 3. Example Categories & Types

#### Basic Examples (Required)
Each should be implemented as a standalone example repository:

**Core Operations:**
- Simple FHE Counter
- Arithmetic Operations (FHE.add, FHE.sub)
- Equality Comparison (FHE.eq)

**Encryption Patterns:**
- Single Value Encryption
- Multiple Value Encryption
- Handling encrypted types

**Decryption Methods:**

*User Decryption:*
- User Decrypt Single Value
- User Decrypt Multiple Values

*Public Decryption:*
- Public Decrypt Single Value
- Public Decrypt Multiple Values

#### Access Control Examples (Required)

- **Access Control Fundamentals** - Explanation and usage patterns
- **FHE.allow and FHE.allowTransient** - Permission management
- **FHE.allowThis() Pattern** - Contract-level permissions
- **Permission Verification** - Understanding permission requirements

#### Input Proofs & Security

- **Input Proof Concepts** - What input proofs are and why they're needed
- **Correct Input Proof Usage** - Proper implementation patterns
- **Zero-Knowledge Proof Verification** - Understanding the verification process

#### Anti-patterns & Common Mistakes (Required)

- **View Functions with Encrypted Values** - Why this pattern fails
- **Missing FHE.allowThis() Permissions** - Consequences and fixes
- **Signer Mismatch** - Encryption/decryption binding issues
- **Handle Lifecycle Errors** - Incorrect handle usage

#### Advanced Patterns

- **Blind Auction Implementation** - Sealed-bid auctions with confidential bids
- **Confidential Dutch Auction** - Dutch auction with encrypted prices
- **Conditional Operations** - If-then-else on encrypted values

#### OpenZeppelin Confidential Contracts (Required)

Implementations showcasing OpenZeppelin's confidential token standards:
- ERC7984 Confidential Token Standard
- ERC7984 to ERC20 Wrapper
- Cross-token Swaps (ERC7984 ↔ ERC20)
- Cross-confidential Swaps (ERC7984 ↔ ERC7984)
- Vesting Wallet with Confidential Tokens
- Multi-signature Operations

#### Additional Examples (Optional - Bonus Points)

- Games (e.g., FHE-based Wordle)
- DeFi Protocols
- Privacy-preserving marketplaces
- Novel FHEVM use cases

### 4. Documentation Strategy

- **Code Comments** - JSDoc/TSDoc-style annotations in test files
- **Auto-generation** - Tools to extract and format documentation
- **Markdown Format** - GitBook-compatible documentation
- **README Per Example** - Clear setup and usage instructions
- **Category Organization** - Logical grouping of related examples
- **Tagging System** - Mark examples by topic (e.g., "chapter: access-control")

---

## 📂 Deliverables Checklist

Your submission **MUST** include:

- [ ] **base-template/** - Complete, ready-to-clone Hardhat template
  - [ ] `contracts/` with example contract
  - [ ] `test/` with example test
  - [ ] `hardhat.config.ts` configured for FHEVM
  - [ ] `package.json` with correct dependencies
  - [ ] Deploy scripts
  - [ ] README with setup instructions

- [ ] **Automation Scripts** - TypeScript/JavaScript tools:
  - [ ] `create-fhevm-example.ts` - Single example generator
  - [ ] `create-fhevm-category.ts` - Category project generator
  - [ ] `generate-docs.ts` - Documentation generator
  - [ ] Configuration files for all scripts

- [ ] **Example Repositories** - At least 12 working examples:
  - [ ] All basic examples (7 minimum)
  - [ ] Access control examples (3 minimum)
  - [ ] Input proofs and anti-patterns (3 minimum)
  - [ ] OpenZeppelin examples (3 minimum)
  - [ ] Advanced examples (blind auction, etc.)

- [ ] **Documentation Files**:
  - [ ] `SUMMARY.md` - GitBook index file
  - [ ] Individual markdown files for each example
  - [ ] Installation and setup guides
  - [ ] Troubleshooting guide

- [ ] **Developer Guide** - Instructions for:
  - [ ] Adding new examples
  - [ ] Updating dependencies
  - [ ] Regenerating documentation
  - [ ] Testing the scaffolding tools
  - [ ] Best practices and patterns

- [ ] **Complete Test Suites**:
  - [ ] Success cases with ✅ markers
  - [ ] Failure cases with ❌ markers
  - [ ] Edge cases
  - [ ] Gas optimization tests

- [ ] **Demonstration Video** *(MANDATORY)*:
  - [ ] Project setup demonstration
  - [ ] Key features showcase
  - [ ] Example execution walkthrough
  - [ ] Automation scripts in action
  - [ ] Documentation generation demo
  - [ ] Duration: 5-15 minutes recommended

---

## 🔍 Judging Criteria

Submissions will be evaluated on:

1. **Code Quality** (25 points)
   - Clean, readable, well-commented code
   - Proper error handling
   - Security best practices
   - Adherence to Solidity conventions

2. **Automation Completeness** (20 points)
   - All required scripts functional
   - Proper error messages and validation
   - Configuration flexibility
   - Ease of customization

3. **Example Quality** (20 points)
   - Clear demonstration of concepts
   - Correct FHEVM patterns
   - Realistic use cases
   - Variety of examples covered

4. **Documentation** (15 points)
   - Clear, comprehensive guides
   - Proper API documentation
   - Usage examples included
   - Troubleshooting assistance

5. **Maintenance & Sustainability** (10 points)
   - Tools for dependency updates
   - Versioning strategy
   - Future-proof architecture
   - Migration guides

6. **Innovation & Bonus Features** (10 points)
   - Additional examples beyond requirements
   - Novel FHEVM patterns
   - Developer tools and utilities
   - Exceptional documentation quality

**Mandatory Requirement:** Demonstration video is required for all submissions.

---

## ⭐ Bonus Points

Earn additional points by implementing:

- **Creative Examples** - Novel FHEVM use cases demonstrating creativity
- **Advanced Patterns** - Complex but well-explained implementations
- **Clean Automation** - Particularly elegant or maintainable scripts
- **Exceptional Documentation** - Going beyond basic requirements
- **Comprehensive Testing** - Edge case coverage and stress tests
- **Error Handling** - Examples of common mistakes and how to avoid them
- **Category Organization** - Well-structured, intuitive categorization
- **Maintenance Tools** - Automated dependency update tools
- **Interactive Tutorials** - Step-by-step learning guides
- **Performance Analysis** - Gas cost analysis and optimization guides

---

## 🚀 Getting Started

### Step 1: Review Examples

Examine the reference repositories:
- **FHEVM Documentation**: Official FHEVM docs and patterns
- **Base Template**: Hardhat template structure and configuration
- **dApps Examples**: Real-world implementation examples
- **OpenZeppelin Confidential**: Standard library implementations

### Step 2: Set Up Development Environment

```bash
# Install Node.js 18+
# Install necessary tools
npm install -g ts-node typescript

# Create your working directory
mkdir my-fhevm-competition
cd my-fhevm-competition
```

### Step 3: Create Base Template

Start with the provided Hardhat template and customize:
- Update package.json with correct versions
- Configure hardhat.config.ts for your examples
- Set up deployment scripts
- Create comprehensive README

### Step 4: Develop Examples

For each example:
1. Create contract in `contracts/<category>/ExampleName.sol`
2. Write tests in `test/<category>/ExampleName.ts`
3. Add JSDoc comments explaining concepts
4. Include both ✅ correct and ❌ incorrect patterns

### Step 5: Build Automation Tools

Implement scaffolding scripts:
1. Base template cloning logic
2. Contract and test insertion
3. Configuration updates
4. Documentation generation

### Step 6: Generate Documentation

Create tools to:
1. Extract code and tests
2. Format markdown automatically
3. Generate GitBook index
4. Create category summaries

### Step 7: Create Demonstration Video

Record a video showing:
1. Environment setup
2. Running automation scripts
3. Generated example usage
4. Test execution
5. Documentation viewing

### Step 8: Package & Submit

Prepare your submission:
1. Create GitHub repository
2. Include all deliverables
3. Add comprehensive README
4. Provide setup instructions
5. Submit through competition platform

---

## 📚 Key Concepts

### FHEVM Encryption Model

FHEVM binds encrypted values to `[contract, user]` pairs:

1. **Encryption Binding** - Values encrypted locally, bound to specific contract/user
2. **Input Proofs** - Zero-knowledge proofs verify correct binding
3. **Permission System** - Both contract and user need FHE permissions

### Critical Patterns

**✅ Correct Pattern:**
```solidity
FHE.allowThis(encryptedValue);        // Contract permission
FHE.allow(encryptedValue, msg.sender); // User permission
```

**❌ Common Mistake:**
```solidity
FHE.allow(encryptedValue, msg.sender); // Missing allowThis - FAILS!
```

**✅ Correct Encryption Signer:**
```typescript
const enc = await fhevm.createEncryptedInput(contractAddr, alice.address)
    .add32(123).encrypt();
await contract.connect(alice).operate(enc.handles[0], enc.inputProof);
```

**❌ Signer Mismatch (FAILS):**
```typescript
const enc = await fhevm.createEncryptedInput(contractAddr, alice.address)
    .add32(123).encrypt();
await contract.connect(bob).operate(enc.handles[0], enc.inputProof);
```

---

## 🔗 Reference Resources

- **FHEVM Documentation**: https://docs.zama.ai/fhevm
- **Protocol Examples**: https://docs.zama.org/protocol/examples
- **Hardhat Template**: Base template repository with configuration
- **dApps Repository**: Real-world application examples
- **OpenZeppelin Confidential**: Standard library implementations

---

## 💡 Tips for Success

1. **Start Simple** - Begin with basic examples before complex ones
2. **Test Thoroughly** - Include both success and failure test cases
3. **Document Well** - Clear documentation is highly valued
4. **Maintain Clean Code** - Follow consistent patterns throughout
5. **Consider Maintenance** - Design tools for easy dependency updates
6. **Be Creative** - Go beyond requirements for bonus points
7. **Show Your Work** - Excellent demonstration video is essential
8. **Seek Feedback** - Use community forums for guidance

---

## 📞 Support Resources

- **Community Forum** - Zama Community Forum for questions
- **Discord Server** - Real-time support from developers
- **GitHub Issues** - Report bugs and request features
- **Documentation** - Official FHEVM and Hardhat docs

---

## ⚖️ License

Your submission should use the BSD-3-Clause-Clear License consistent with FHEVM ecosystem projects.

---

## 📝 Notes

- All submissions must be original work
- Code must be properly licensed
- Documentation must be in English
- Video submission is mandatory
- Plagiarism will result in disqualification

---

**Good luck with your submission! 🎉**

**For questions and support, connect with the Zama community on Discord or the Community Forum.**

