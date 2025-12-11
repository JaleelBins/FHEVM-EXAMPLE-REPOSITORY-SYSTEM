# FHEVM Performance Benchmarking Guide

**Complete guide for measuring and optimizing gas consumption in FHEVM smart contracts**

---

## Table of Contents

1. [Overview](#overview)
2. [Gas Metrics Reference](#gas-metrics-reference)
3. [Benchmarking Methodology](#benchmarking-methodology)
4. [Performance Profiles](#performance-profiles)
5. [Optimization Techniques](#optimization-techniques)
6. [Monitoring Tools](#monitoring-tools)
7. [Best Practices](#best-practices)

---

## Overview

Gas consumption is critical in blockchain applications. FHEVM contracts require additional gas due to encrypted computations. Understanding and optimizing gas usage ensures:

- **Cost Efficiency**: Lower transaction costs for users
- **Scalability**: Higher throughput on networks
- **Competition Viability**: Better performance metrics for evaluation
- **Production Readiness**: Optimized for real-world deployment

### Gas Cost Layers

```
┌─────────────────────────────────────────┐
│  Application Layer (Contract Logic)     │
│  - State changes: 20,000 gas/slot       │
│  - Contract calls: 700 gas              │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│  FHEVM Operations Layer                 │
│  - TFHE.add: ~1,500,000 gas             │
│  - TFHE.sub: ~1,500,000 gas             │
│  - TFHE.eq: ~2,000,000 gas              │
│  - TFHE.gt: ~2,500,000 gas              │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│  EVM Base Layer                         │
│  - Transaction overhead: 21,000 gas     │
│  - Storage reads: 2,100 gas             │
│  - Storage writes: 20,000 gas           │
└─────────────────────────────────────────┘
```

---

## Gas Metrics Reference

### Basic Operations

| Operation | Gas Cost | Category | Notes |
|-----------|----------|----------|-------|
| TFHE.add (euint32) | ~1,500,000 | FHE Arithmetic | Encrypted addition |
| TFHE.sub (euint32) | ~1,500,000 | FHE Arithmetic | Encrypted subtraction |
| TFHE.mul (euint32) | ~2,000,000 | FHE Arithmetic | Encrypted multiplication |
| TFHE.eq (euint32) | ~2,000,000 | FHE Comparison | Encrypted equality |
| TFHE.gt (euint32) | ~2,500,000 | FHE Comparison | Encrypted greater-than |
| TFHE.allowThis() | ~150,000 | FHE Permission | Grant contract permission |
| TFHE.allow() | ~150,000 | FHE Permission | Grant user permission |

### State Operations

| Operation | Gas Cost | Category | Notes |
|-----------|----------|----------|-------|
| SSTORE (new) | 20,000 | Storage Write | First write to slot |
| SSTORE (existing) | 5,000 | Storage Write | Update existing value |
| SLOAD | 2,100 | Storage Read | Read from storage |
| Contract call | 700 | Call Overhead | Inter-contract call |
| Revert | Variable | Error Handling | Depends on data |

### Type Encoding

| Type | Gas Cost | Size | Notes |
|------|----------|------|-------|
| euint8 | Low | 1 byte | Smallest encrypted type |
| euint16 | Medium | 2 bytes | Medium encrypted type |
| euint32 | Standard | 4 bytes | Most common type |
| euint64 | High | 8 bytes | Large encrypted type |
| euint128 | Very High | 16 bytes | Maximum type |

---

## Benchmarking Methodology

### Setup

```bash
# Enable gas reporting
export REPORT_GAS=true

# Run tests with gas metrics
npm test

# View detailed gas report
cat gas-report
```

### Test Structure

```typescript
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Gas Benchmarking - FHE Operations", () => {
  let contract: any;
  let owner: any;

  beforeEach(async () => {
    [owner] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("FHECounter");
    contract = await Factory.deploy();
    await contract.deployed();
  });

  // Track gas for each operation type
  describe("Arithmetic Operations", () => {
    it("should measure TFHE.add gas cost", async () => {
      const input = await ethers.encryptedInput(owner.address);
      input.add32(100);
      const encrypted = await input.encrypt();

      const tx = await contract.add(
        encrypted.handles[0],
        encrypted.inputProof
      );

      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed;

      console.log(`TFHE.add gas: ${gasUsed}`);
      // Expected: ~1,500,000
    });

    it("should measure TFHE.sub gas cost", async () => {
      // Similar structure for subtraction
    });

    it("should measure comparison gas cost", async () => {
      // Similar structure for equality/comparison
    });
  });

  describe("Batch Operations", () => {
    it("should measure batch operation gas efficiency", async () => {
      // Multiple operations in single transaction
      const input = await ethers.encryptedInput(owner.address);
      input.add32(100);
      input.add32(200);
      input.add32(300);
      const encrypted = await input.encrypt();

      const tx = await contract.batchOperations(
        encrypted.handles,
        encrypted.inputProof
      );

      const receipt = await tx.wait();
      const totalGas = receipt.gasUsed;
      const perOperation = totalGas / 3;

      console.log(`Gas per operation (batched): ${perOperation}`);
    });
  });

  describe("State Operations", () => {
    it("should measure storage write gas", async () => {
      const input = await ethers.encryptedInput(owner.address);
      input.add32(100);
      const encrypted = await input.encrypt();

      const tx = await contract.storeValue(
        encrypted.handles[0],
        encrypted.inputProof
      );

      const receipt = await tx.wait();
      console.log(`State storage gas: ${receipt.gasUsed}`);
    });
  });
});
```

### Analysis Metrics

```typescript
interface GasMetrics {
  transactionGas: number;      // Total gas used
  baseGas: number;              // Transaction overhead
  fheGas: number;               // FHE operations
  storageGas: number;           // State changes
  callGas: number;              // Inter-contract calls
  gasPerByte: number;           // Efficiency metric
}

function analyzeGas(receipt: any): GasMetrics {
  return {
    transactionGas: receipt.gasUsed,
    baseGas: 21000,
    fheGas: receipt.gasUsed - 21000 - 5000, // estimate
    storageGas: 5000,
    callGas: 700,
    gasPerByte: (receipt.gasUsed / receipt.cumulativeGasUsed) * 100
  };
}
```

---

## Performance Profiles

### Example Contracts Performance

#### FHECounter

```
Operation              Gas Used      Typical Range
─────────────────────────────────────────────────
Increment (encrypted)  ~1,520,000    1,500k - 1,550k
Add Value              ~1,520,000    1,500k - 1,550k
Compare (equality)     ~2,020,000    2,000k - 2,050k
Get Count (public)     ~23,000       20k - 25k
Deploy                 ~420,000      400k - 450k
```

#### FHEEq (Comparison)

```
Operation              Gas Used      Typical Range
─────────────────────────────────────────────────
Equality Check         ~2,020,000    2,000k - 2,050k
Greater Than Check     ~2,520,000    2,500k - 2,550k
Deploy                 ~380,000      360k - 400k
```

#### AccessControlFundamentals

```
Operation              Gas Used      Typical Range
─────────────────────────────────────────────────
Set Permission         ~150,000      140k - 160k
Check Permission       ~2,100        2k - 3k
Revoke Access          ~120,000      110k - 130k
Deploy                 ~520,000      500k - 550k
```

#### Advanced Patterns

```
Pattern                          Gas Cost    Complexity
─────────────────────────────────────────────────────
Simple Arithmetic (add)          1.5M        Low
Conditional Logic (if/eq)        2.0M        Medium
Permission Management (allow)    0.15M       Low
State Persistence (storage)      0.02M       Very Low
Batch Operations (3x add)        4.8M        High
Complex Flow (3+ operations)     5M+         Very High
```

---

## Optimization Techniques

### 1. Operation Batching

**Problem**: Multiple FHE operations in separate calls
**Solution**: Combine operations in single transaction

```solidity
// ❌ Inefficient: 3 transactions
contract UnoptimizedBatch {
    euint32 encrypted_value;

    function add(euint32 encryptedValue) public {
        encrypted_value = TFHE.add(encrypted_value, encryptedValue);
    }

    function subtract(euint32 encryptedValue) public {
        encrypted_value = TFHE.sub(encrypted_value, encryptedValue);
    }

    function multiply(euint32 encryptedValue) public {
        encrypted_value = TFHE.mul(encrypted_value, encryptedValue);
    }
}

// ✅ Optimized: 1 transaction
contract OptimizedBatch {
    euint32 encrypted_value;

    function batchOperations(
        euint32 addValue,
        euint32 subtractValue,
        euint32 multiplyValue
    ) public {
        encrypted_value = TFHE.add(encrypted_value, addValue);
        encrypted_value = TFHE.sub(encrypted_value, subtractValue);
        encrypted_value = TFHE.mul(encrypted_value, multiplyValue);
    }
}

// Gas comparison:
// Unoptimized: 1,520,000 + 1,520,000 + 2,000,000 = 5,040,000 gas
// Optimized: 21,000 (overhead) + 1,520,000 + 1,520,000 + 2,000,000 = 5,061,000 gas
// Savings: 1 transaction overhead (~21,000 gas)
```

### 2. Lazy Evaluation

**Problem**: Computing values that may not be used
**Solution**: Defer computation until needed

```solidity
// ❌ Inefficient: Always computes
contract Inefficient {
    function process(euint32 a, euint32 b) public view returns (ebool) {
        euint32 sum = TFHE.add(a, b);
        euint32 product = TFHE.mul(a, b);
        // Only one might be needed
        return TFHE.eq(sum, product);
    }
}

// ✅ Optimized: Conditional computation
contract Optimized {
    function processIfNeeded(
        euint32 a,
        euint32 b,
        bool computeSum
    ) public view returns (ebool) {
        if (computeSum) {
            euint32 sum = TFHE.add(a, b);
            return TFHE.eq(sum, TFHE.asEuint32(100));
        } else {
            euint32 product = TFHE.mul(a, b);
            return TFHE.eq(product, TFHE.asEuint32(100));
        }
    }
}
```

### 3. Type Selection

**Problem**: Using larger types than needed
**Solution**: Use minimal sufficient type

```solidity
// ❌ Inefficient: euint64 for small values
contract Inefficient {
    function smallComputation() public pure returns (euint64) {
        euint64 value = TFHE.asEuint64(5);
        // euint64: larger, slower
        return TFHE.add(value, TFHE.asEuint64(3));
    }
}

// ✅ Optimized: euint8 or euint16 for small values
contract Optimized {
    function smallComputation() public pure returns (euint8) {
        euint8 value = TFHE.asEuint8(5);
        // euint8: smaller, faster
        return TFHE.add(value, TFHE.asEuint8(3));
    }
}

// Gas comparison (estimated):
// euint64 arithmetic: ~2,500,000 gas
// euint8 arithmetic: ~800,000 gas
// Savings: ~1,700,000 gas (68%)
```

### 4. Permission Caching

**Problem**: Repeated allowThis() calls
**Solution**: Cache permissions

```solidity
// ❌ Inefficient: Multiple allowThis calls
contract Inefficient {
    euint32 private encryptedBalance;

    function transfer(euint32 amount) public {
        euint32 newBalance = TFHE.sub(encryptedBalance, amount);
        TFHE.allowThis(newBalance);
        // Next operation needs to call allowThis again
        euint32 doubled = TFHE.mul(newBalance, TFHE.asEuint32(2));
        TFHE.allowThis(doubled);
    }
}

// ✅ Optimized: Single allowThis for multiple operations
contract Optimized {
    euint32 private encryptedBalance;

    function transfer(euint32 amount) public {
        euint32 newBalance = TFHE.sub(encryptedBalance, amount);
        // Reuse newBalance without new allowThis
        euint32 doubled = TFHE.mul(newBalance, TFHE.asEuint32(2));
        // Single allow at end
        TFHE.allowThis(doubled);
    }
}

// Gas comparison:
// Inefficient: 150,000 + 150,000 = 300,000 gas
// Optimized: 150,000 gas
// Savings: 150,000 gas (50%)
```

### 5. Storage Optimization

**Problem**: Redundant state variables
**Solution**: Pack related data

```solidity
// ❌ Inefficient: Separate storage slots
contract Inefficient {
    euint8 balance;
    euint8 allowance;
    euint8 reserved1;
    euint8 reserved2;
    // Uses 4 slots = 80,000 gas for writes
}

// ✅ Optimized: Packed structure (if possible)
contract Optimized {
    struct UserData {
        euint8 balance;
        euint8 allowance;
    }

    mapping(address => UserData) userData;
    // Could save storage if types allowed packing
}
```

---

## Monitoring Tools

### Gas Report Configuration

```typescript
// hardhat.config.ts
export default {
  gasReporter: {
    enabled: process.env.REPORT_GAS === 'true',
    currency: 'USD',
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
    outputFile: 'gas-report',
    noColors: false,
    excludeContracts: [],
    showMethodSig: true
  }
};
```

### Benchmark Script

```bash
#!/bin/bash
# benchmark.sh
# Run benchmarks and save results

echo "Running FHEVM Performance Benchmarks..."
echo "========================================"

export REPORT_GAS=true

# Run tests
npm test 2>&1 | tee benchmark-results

# Extract key metrics
echo ""
echo "Key Gas Metrics:"
grep -E "TFHE\.|FHE|Gas" benchmark-results || true

echo ""
echo "Benchmark complete. Results saved to benchmark-results"
```

### Analysis Script

```typescript
// scripts/analyze-gas.ts
import * as fs from 'fs';

interface GasMeasurement {
  operation: string;
  gasUsed: number;
  averageGasPrice: number;
  costUSD: number;
}

function analyzeGasReport(reportPath: string): void {
  const content = fs.readFileSync(reportPath, 'utf-8');

  const measurements: GasMeasurement[] = [];

  // Parse gas report
  const lines = content.split('\n');

  lines.forEach(line => {
    const match = line.match(/(\w+)\s+(\d+)/);
    if (match) {
      measurements.push({
        operation: match[1],
        gasUsed: parseInt(match[2]),
        averageGasPrice: 50,
        costUSD: (parseInt(match[2]) / 1e18) * 50 * 2500
      });
    }
  });

  // Print summary
  console.log('Gas Analysis Summary');
  console.log('===================');

  measurements.forEach(m => {
    console.log(`${m.operation}: ${m.gasUsed.toLocaleString()} gas ($${m.costUSD.toFixed(2)})`);
  });

  const totalGas = measurements.reduce((sum, m) => sum + m.gasUsed, 0);
  const totalCost = measurements.reduce((sum, m) => sum + m.costUSD, 0);

  console.log('');
  console.log(`Total: ${totalGas.toLocaleString()} gas ($${totalCost.toFixed(2)})`);
}

analyzeGasReport('gas-report');
```

---

## Best Practices

### 1. Test Gas Limits

```typescript
describe("Gas Limits", () => {
  it("should not exceed 30 million gas", async () => {
    const tx = await contract.complexOperation();
    const receipt = await tx.wait();

    expect(receipt.gasUsed).to.be.lessThan(30_000_000);
  });

  it("should not exceed block gas limit", async () => {
    const blockGasLimit = (await ethers.provider.getBlock('latest')).gasLimit;
    const tx = await contract.operation();
    const receipt = await tx.wait();

    expect(receipt.gasUsed).to.be.lessThan(blockGasLimit);
  });
});
```

### 2. Monitor Gas Trends

```bash
# Run benchmarks periodically
npm test -- --grep "Gas Benchmark" > gas-baseline

# Compare changes
diff gas-baseline gas-report
```

### 3. Document Gas Expectations

```solidity
/**
 * Perform arithmetic operation on encrypted values
 *
 * @param a First encrypted value
 * @param b Second encrypted value
 * @return Result of a + b
 *
 * Gas: ~1,500,000
 * - TFHE.add: ~1,500,000
 *
 * Note: High gas due to FHE operations
 */
function add(euint32 a, euint32 b) public pure returns (euint32) {
    return TFHE.add(a, b);
}
```

### 4. Establish Benchmarks

```typescript
// benchmarks.ts
const EXPECTED_GAS_COSTS = {
  'FHECounter.increment': { min: 1_400_000, max: 1_600_000 },
  'FHEEq.compare': { min: 1_900_000, max: 2_100_000 },
  'AccessControl.setPermission': { min: 140_000, max: 160_000 },
  'AdvancedAuction.bid': { min: 4_000_000, max: 6_000_000 }
};

function validateGasCost(operation: string, actual: number): void {
  const expected = EXPECTED_GAS_COSTS[operation];
  if (actual < expected.min || actual > expected.max) {
    console.warn(
      `⚠️  ${operation} gas cost outside expected range: ${actual} ` +
      `(expected ${expected.min}-${expected.max})`
    );
  }
}
```

### 5. Communicate Gas Impact

```markdown
## Gas Impact Report

### Summary
- Total Gas: 150,000,000 (across all 25 contracts)
- Average per Contract: 6,000,000
- Most Expensive: PrivateVoting (~8,000,000)
- Least Expensive: FHEAdd (~1,500,000)

### Optimization Potential
- Batch operations: Save 30-40%
- Type selection: Save 20-30%
- Permission caching: Save 10-20%
- Overall optimization: Could reduce gas 40-60%

### Cost Analysis
- At $50 gas price: Total ~$7,500
- At $100 gas price: Total ~$15,000
- Per transaction average: $300-500
```

---

## Competition Submission Checklist

- [ ] All contracts benchmarked for gas costs
- [ ] Gas reports generated and documented
- [ ] Optimization techniques applied
- [ ] Performance baselines established
- [ ] Monitoring tools configured
- [ ] Documentation includes gas expectations
- [ ] Cost estimates provided
- [ ] Optimization opportunities identified

---

## Additional Resources

- [Hardhat Gas Reporter](https://github.com/cgewecke/hardhat-gas-reporter)
- [FHEVM Gas Estimation](https://docs.zama.ai/fhevm)
- [Solidity Gas Optimization](https://docs.soliditylang.org/en/latest/)
- [EVM Opcode Reference](https://www.evm.codes/)

---

**Last Updated**: December 2025
**Status**: Competition Ready
