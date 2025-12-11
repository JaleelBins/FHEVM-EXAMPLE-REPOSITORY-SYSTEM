# FHEVM Troubleshooting Guide

Solutions to common issues encountered when building FHEVM applications.

---

## 🔴 Compilation Errors

### Error: "TypeError: Cannot read property 'length' of undefined"

**Symptoms:**
```
TypeError: Cannot read property 'length' of undefined
  at ... (during compilation)
```

**Cause:** Missing or incorrect FHEVM library imports

**Solution:**
```solidity
// ✅ CORRECT
import { FHE, euint32, externalEuint32 } from "@fhevm/solidity/lib/FHE.sol";
import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

contract MyContract is ZamaEthereumConfig {
    // ...
}

// ❌ WRONG
// Missing imports or wrong imports
contract MyContract {
    // ...
}
```

**Verification:**
```bash
npm run compile  # Should compile successfully
```

---

### Error: "Not a valid Solidity version"

**Symptoms:**
```
ParserError: Source file requires different compiler version
```

**Cause:** Solidity version mismatch

**Solution:** Ensure `hardhat.config.ts` uses correct version:
```typescript
solidity: {
  version: "0.8.24",  // Must be 0.8.24 for FHEVM
  settings: {
    optimizer: {
      enabled: true,
      runs: 200,
    },
  },
},
```

---

### Error: "Undefined euint32 type"

**Symptoms:**
```
DeclarationError: Identifier not found or not unique.
```

**Cause:** Missing FHEVM imports

**Solution:**
```solidity
// ✅ CORRECT
import { FHE, euint32, externalEuint32 } from "@fhevm/solidity/lib/FHE.sol";

// ❌ WRONG
// Missing the FHE import
euint32 _value;  // Type not recognized
```

---

## 🔴 Runtime Errors

### Error: "decryption failed"

**Symptoms:**
```
Error: decryption failed
```

**This is THE most common error!**

**Causes:**
1. **Signer mismatch** - Encryption user ≠ Execution user
2. **Invalid proof** - Proof doesn't match encrypted value
3. **Wrong contract address** - Encrypted for different contract

**Solution:**

```typescript
// ❌ WRONG: Different users
const input = await createEncryptedInput(
    contractAddr,
    alice.address  // Encrypted for Alice
).add32(100).encrypt();

// Bob tries to use it - FAILS!
await contract.connect(bob).operation(input.handles[0], input.inputProof);
// → "decryption failed"

// ✅ CORRECT: Same user
const userAddress = await signer.getAddress();
const input = await createEncryptedInput(
    contractAddr,
    userAddress  // Encrypt for this user
).add32(100).encrypt();

// Same user executes - WORKS!
await contract.connect(signer).operation(input.handles[0], input.inputProof);
// → Success!
```

**Debug Checklist:**
```
[ ] Encryption address matches execution signer
[ ] Contract address is correct
[ ] Input proof matches encrypted input
[ ] No proxy or delegatecall involved
[ ] Same network (hardhat, localhost, sepolia)
```

---

### Error: "Cannot use encrypted value in view function"

**Symptoms:**
```
Error: Cannot use encrypted value in view function
```

**Cause:** View functions cannot work with encrypted data

**Solution:**

```solidity
// ❌ WRONG: Using view function
function getValue() external view returns (euint32) {
    return _encryptedValue;  // FAILS
}

// ✅ CORRECT: Use non-view function
function getValue() external returns (euint32) {
    euint32 value = _encryptedValue;
    FHE.allowThis(value);
    FHE.allow(value, msg.sender);
    return value;
}

// ✅ ALTERNATIVE: Use FHE.decrypt for known values
function getPublicValue() external view returns (uint32) {
    return _publicValue;  // This works - it's not encrypted
}
```

---

### Error: "Cannot decrypt - missing permission"

**Symptoms:**
```
Error: User does not have permission to decrypt value
```

**Cause:** Missing `FHE.allow()` call

**Solution:**

```solidity
// ❌ WRONG: Missing FHE.allow()
function operation(externalEuint32 input, bytes calldata proof) external {
    euint32 value = FHE.fromExternal(input, proof);
    _result = FHE.add(_result, value);
    FHE.allowThis(_result);  // Only this - not enough!
}

// ✅ CORRECT: Both permissions
function operation(externalEuint32 input, bytes calldata proof) external {
    euint32 value = FHE.fromExternal(input, proof);
    _result = FHE.add(_result, value);
    FHE.allowThis(_result);      // Contract permission
    FHE.allow(_result, msg.sender);  // User permission
}
```

---

### Error: "Contract does not have permission"

**Symptoms:**
```
Error: Contract does not have permission to use encrypted value
```

**Cause:** Missing `FHE.allowThis()` call

**Solution:**

```solidity
// ❌ WRONG: Missing FHE.allowThis()
function operation(externalEuint32 input, bytes calldata proof) external {
    euint32 value = FHE.fromExternal(input, proof);
    _result = FHE.add(_result, value);
    FHE.allow(_result, msg.sender);  // Only this - not enough!
}

// ✅ CORRECT: Both permissions
function operation(externalEuint32 input, bytes calldata proof) external {
    euint32 value = FHE.fromExternal(input, proof);
    _result = FHE.add(_result, value);
    FHE.allowThis(_result);      // Contract permission - CRITICAL
    FHE.allow(_result, msg.sender);  // User permission
}
```

**Key Point:** Always call **both**:
- `FHE.allowThis(value)` → Contract can use it
- `FHE.allow(value, address)` → User can decrypt it

---

## 🟡 Test Failures

### Tests Pass Locally But Fail in CI

**Symptoms:**
```
✓ Test passes when I run locally
✗ Test fails in CI pipeline
```

**Causes:**
1. Different Node.js versions
2. Different compiler versions
3. Environment variables not set
4. Hardhat cache issues

**Solution:**

```bash
# Clear all caches
npm run clean
rm -rf artifacts
rm -rf cache

# Reinstall dependencies
rm -rf node_modules
npm install

# Recompile
npm run compile

# Run tests
npm test
```

**CI Configuration (package.json):**
```json
{
  "scripts": {
    "ci:test": "npm run clean && npm install && npm run compile && npm test"
  }
}
```

---

### Test Timeout

**Symptoms:**
```
Error: Timeout of 5000ms exceeded
```

**Cause:** Test took too long (FHEVM operations can be slow)

**Solution:** Increase timeout in `hardhat.config.ts`:

```typescript
mocha: {
  timeout: 200000  // 200 seconds for FHEVM tests
},
```

---

### Test Compilation Error

**Symptoms:**
```
TypeError: Cannot find module 'hardhat-fhevm/gateway'
```

**Cause:** Dependencies not installed

**Solution:**
```bash
npm install
npm install --save-dev hardhat-fhevm
npm run compile
npm test
```

---

## 🟡 Setup Issues

### npm install Fails

**Symptoms:**
```
npm ERR! code E403
npm ERR! 403 Forbidden
```

**Cause:** Permission or authentication issues

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Reinstall
npm install

# Or use yarn
yarn install
```

---

### FHEVM Plugin Not Loading

**Symptoms:**
```
Error: Cannot find module '@fhevm/hardhat-plugin'
```

**Cause:** Plugin not installed

**Solution:**
```bash
npm install @fhevm/hardhat-plugin @fhevm/solidity

# Verify in hardhat.config.ts
import "@fhevm/hardhat-plugin";
import "@nomicfoundation/hardhat-toolbox";
```

---

### Cannot Resolve "hardhat-fhevm/gateway"

**Symptoms:**
```
ModuleNotFoundError: Cannot resolve 'hardhat-fhevm/gateway'
```

**Cause:** Incorrect import path

**Solution:**
```typescript
// ❌ WRONG
import { createEncryptedInput } from "hardhat-fhevm/gateway";

// ✅ CORRECT (might vary by version)
import { createEncryptedInput } from "hardhat-fhevm/gateway";

// Check version in package.json
npm ls @fhevm/hardhat-plugin
```

---

## 🟡 Type Errors

### TypeScript Compilation Error

**Symptoms:**
```
error TS2304: Cannot find name 'euint32'
```

**Cause:** TypeScript doesn't recognize encrypted types

**Solution:**
```typescript
// ✅ CORRECT: Proper imports in test file
import { ethers } from "hardhat";
import { FHECounter } from "../typechain-types";
import { createEncryptedInput } from "hardhat-fhevm/gateway";

describe("Test", () => {
  let contract: FHECounter;

  it("should work", async () => {
    const input = await createEncryptedInput(...)...;
    // Types should be recognized
  });
});
```

---

### "Property 'euint32' does not exist on type 'FHE'"

**Symptoms:**
```
error TS2339: Property 'euint32' does not exist on type 'FHE'
```

**Cause:** Solidity type not imported in TypeScript

**Solution:**
```typescript
// In TypeScript tests, you don't need to import encrypted types
// They're used in Solidity contracts only

// For contract interactions, use the contract's type definitions
const contract: MyContract = ...;

// The contract handles encrypted types internally
await contract.operation(input.handles[0], input.inputProof);
```

---

## 🟡 Performance Issues

### Tests Running Very Slowly

**Symptoms:**
```
Test suite took 10+ minutes to run
```

**Causes:**
1. Too many tests
2. Inefficient test structure
3. Creating new contract for each test
4. Large inputs

**Solution:**
```typescript
// ❌ WRONG: New contract per test (slow)
describe("Tests", () => {
  it("test 1", async () => {
    const contract = await deploy();
    // ...
  });
  it("test 2", async () => {
    const contract = await deploy();  // Deploys again!
    // ...
  });
});

// ✅ CORRECT: Shared contract (fast)
describe("Tests", () => {
  let contract: MyContract;

  before(async () => {
    contract = await deploy();  // Deploy once
  });

  it("test 1", async () => {
    // Use same contract
  });
  it("test 2", async () => {
    // Use same contract
  });
});
```

---

### High Gas Usage

**Symptoms:**
```
Gas used: 5,000,000 (very high)
```

**Cause:** Inefficient implementation

**Solution:** See [Gas Optimization](BEST_PRACTICES.md#41-gas-optimization)

---

## 🟢 Best Debugging Practices

### 1. Add Logging

```typescript
it("should work", async () => {
  console.log("Before operation");
  await contract.operation(...);
  console.log("After operation");

  const result = await contract.getValue();
  console.log("Result:", result);
});
```

### 2. Run Single Test

```bash
npx hardhat test --grep "specific test name"
```

### 3. Enable Verbose Output

```bash
npm test -- --verbose
```

### 4. Use Debugger

```bash
node --inspect-brk ./node_modules/.bin/hardhat test
```

### 5. Check Contract State

```typescript
// Add temporary view of state during tests
function debugState() {
  console.log("Public var:", publicVar.toString());
  // Can't directly see encrypted values, but can verify they exist
}
```

---

## 📋 Common Issues Quick Reference

| Issue | Cause | Solution |
|-------|-------|----------|
| "decryption failed" | Signer mismatch | Use same user for encrypt and execute |
| Missing permission | No FHE.allow() | Always call both FHE.allowThis() and FHE.allow() |
| No contract permission | No FHE.allowThis() | Call FHE.allowThis() before FHE.allow() |
| View function error | Can't use encrypted in view | Use non-view function with permissions |
| Timeout | Test too slow | Increase timeout in hardhat.config.ts |
| Type not found | Missing imports | Import from "@fhevm/solidity/lib/FHE.sol" |
| Slow tests | New contract per test | Share contract across tests |

---

## 🆘 Getting Help

**If problem not listed above:**

1. **Check the documentation:**
   - FHEVM Docs: https://docs.zama.ai/fhevm
   - Hardhat Docs: https://hardhat.org

2. **Review code examples:**
   - Example implementations in this competition
   - Official FHEVM examples
   - Community projects

3. **Ask the community:**
   - Zama Discord: https://discord.com/invite/zama
   - Zama Forum: https://www.zama.ai/community
   - GitHub Discussions: https://github.com/zama-ai/fhevm/discussions

4. **Create a minimal reproduction:**
   - Isolate the problem
   - Create smallest possible example
   - Share with community for help

---

## Summary

**Most common issues and fixes:**
1. ✅ Signer mismatch → Use same user for encryption and execution
2. ✅ Missing permissions → Always call both FHE.allowThis() and FHE.allow()
3. ✅ View function error → Use non-view function with proper permissions
4. ✅ Type errors → Ensure correct imports from "@fhevm/solidity"
5. ✅ Slow tests → Share contract instance across tests

**Remember:** The most common error is "decryption failed" due to signer mismatch. Always ensure the user who encrypts the input is the one executing the transaction!
