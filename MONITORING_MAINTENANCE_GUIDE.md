# FHEVM Contract Monitoring & Maintenance Guide

**Complete guide for monitoring, maintaining, and managing deployed FHEVM smart contracts**

---

## Table of Contents

1. [Overview](#overview)
2. [Pre-Production Setup](#pre-production-setup)
3. [Real-Time Monitoring](#real-time-monitoring)
4. [Health Checks](#health-checks)
5. [Performance Tracking](#performance-tracking)
6. [Error Detection & Response](#error-detection--response)
7. [Maintenance Procedures](#maintenance-procedures)
8. [Upgrade Management](#upgrade-management)
9. [Disaster Recovery](#disaster-recovery)
10. [Monitoring Dashboard](#monitoring-dashboard)

---

## Overview

### Objectives

Deployed FHEVM contracts require continuous monitoring to ensure:

- **Availability**: Contract is accessible and functioning
- **Security**: No unauthorized access or attacks detected
- **Performance**: Gas consumption within expected ranges
- **Correctness**: Encrypted operations producing correct results
- **Compliance**: All operations follow security policies

### Monitoring Stack

```
┌─────────────────────────────────────────────────┐
│         Application Layer (DApp)                │
│         - User interactions                      │
│         - Error reporting                        │
└─────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────┐
│    Monitoring & Alerting Layer                  │
│    - Events tracking                            │
│    - Transaction monitoring                     │
│    - Performance metrics                        │
└─────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────┐
│    Blockchain Layer (Ethereum/Testnet)         │
│    - Contract execution                         │
│    - State changes                              │
│    - Event logs                                 │
└─────────────────────────────────────────────────┘
```

---

## Pre-Production Setup

### Monitoring Infrastructure

- [ ] **Blockchain Node Access**
  - [ ] Full node or archive node running
  - [ ] RPC endpoint accessible and authenticated
  - [ ] Node synced and responsive

  ```bash
  # Test node connectivity
  curl -X POST http://localhost:8545 \
    -H "Content-Type: application/json" \
    -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
  ```

- [ ] **Data Aggregation Service**
  - [ ] Subgraph or indexer running
  - [ ] Event logs being indexed
  - [ ] Query endpoints available

  ```bash
  # Test indexer connectivity
  curl https://api.thegraph.com/subgraphs/name/your/subgraph \
    -X POST \
    -H "Content-Type: application/json" \
    -d '{"query":"{ contracts { id } }"}'
  ```

- [ ] **Alerting System**
  - [ ] Alert service configured (PagerDuty, Opsgenie, etc.)
  - [ ] Notification channels established (Slack, email, SMS)
  - [ ] Escalation policies defined

  ```yaml
  # Alert configuration example
  alerts:
    - name: "High Gas Usage"
      threshold: 5000000
      action: "notify_team"
      escalate_after: 30m

    - name: "Failed Transaction"
      threshold: 3
      window: "5m"
      action: "page_on_call"
  ```

- [ ] **Logging Infrastructure**
  - [ ] Centralized log aggregation (ELK, Datadog, etc.)
  - [ ] Log retention policy defined
  - [ ] Log search capabilities available

---

## Real-Time Monitoring

### Event Tracking

```typescript
// Monitor smart contract events
import { ethers } from 'ethers';

async function setupEventMonitoring(contractAddress: string) {
  const provider = new ethers.providers.JsonRpcProvider('http://localhost:8545');

  const contractABI = [
    'event FHEOperationExecuted(indexed address operator, bytes32 operation, uint256 gasUsed)',
    'event PermissionGranted(indexed address user, bytes32 encryptedValue)',
    'event PermissionRevoked(indexed address user)',
  ];

  const contract = new ethers.Contract(contractABI, contractAddress, provider);

  // Monitor FHE operations
  contract.on('FHEOperationExecuted', (operator, operation, gasUsed, event) => {
    console.log(`FHE Operation from ${operator}`);
    console.log(`  Operation: ${operation}`);
    console.log(`  Gas used: ${gasUsed}`);
    console.log(`  Block: ${event.blockNumber}`);
    console.log(`  Hash: ${event.transactionHash}`);

    // Send to monitoring service
    sendMetric({
      type: 'fhe_operation',
      operator,
      operation,
      gasUsed: gasUsed.toNumber(),
      timestamp: Date.now(),
    });
  });

  // Monitor permission changes
  contract.on('PermissionGranted', (user, encryptedValue, event) => {
    console.log(`Permission granted to ${user}`);
    logSecurityEvent('permission_grant', {
      user,
      timestamp: Date.now(),
      blockNumber: event.blockNumber,
    });
  });

  contract.on('PermissionRevoked', (user, event) => {
    console.log(`Permission revoked for ${user}`);
    logSecurityEvent('permission_revoke', {
      user,
      timestamp: Date.now(),
      blockNumber: event.blockNumber,
    });
  });
}

// Helper function to send metrics
async function sendMetric(metric: any) {
  // Send to monitoring service (Prometheus, InfluxDB, etc.)
  console.log('Metric:', metric);
}

async function logSecurityEvent(eventType: string, data: any) {
  // Log security-relevant events
  console.log(`[SECURITY] ${eventType}:`, data);
}
```

### Transaction Monitoring

```typescript
// Monitor pending and confirmed transactions
async function monitorTransactions(contractAddress: string) {
  const provider = new ethers.providers.JsonRpcProvider('http://localhost:8545');

  const transactions = new Map();

  // Listen for pending transactions
  provider.on('pending', async (txHash) => {
    try {
      const tx = await provider.getTransaction(txHash);

      if (tx.to === contractAddress) {
        console.log(`Pending transaction to contract: ${txHash}`);

        transactions.set(txHash, {
          from: tx.from,
          to: tx.to,
          gasPrice: tx.gasPrice.toString(),
          startTime: Date.now(),
          status: 'pending',
        });
      }
    } catch (error) {
      // Transaction might have been dropped
    }
  });

  // Monitor transaction confirmations
  const interval = setInterval(async () => {
    for (const [txHash, txData] of transactions.entries()) {
      try {
        const receipt = await provider.getTransactionReceipt(txHash);

        if (receipt) {
          const confirmationTime = Date.now() - txData.startTime;

          console.log(`Transaction confirmed: ${txHash}`);
          console.log(`  Status: ${receipt.status === 1 ? 'Success' : 'Failed'}`);
          console.log(`  Gas used: ${receipt.gasUsed.toString()}`);
          console.log(`  Time to confirm: ${confirmationTime}ms`);

          transactions.delete(txHash);

          // Alert if failed
          if (receipt.status === 0) {
            alertOperations('Transaction failed', {
              txHash,
              from: txData.from,
              gasUsed: receipt.gasUsed.toString(),
            });
          }
        }
      } catch (error) {
        console.error(`Error checking transaction ${txHash}:`, error);
      }
    }
  }, 5000); // Check every 5 seconds

  return () => clearInterval(interval);
}
```

### Gas Price Monitoring

```typescript
// Track gas price trends and alert on spikes
async function monitorGasPrices() {
  const provider = new ethers.providers.JsonRpcProvider('http://localhost:8545');

  const gasHistory: number[] = [];
  const ALERT_THRESHOLD_MULTIPLIER = 2; // Alert if 2x normal

  setInterval(async () => {
    try {
      const gasPrice = await provider.getGasPrice();
      const gasPriceGwei = parseFloat(ethers.utils.formatUnits(gasPrice, 'gwei'));

      gasHistory.push(gasPriceGwei);

      if (gasHistory.length > 100) {
        gasHistory.shift(); // Keep last 100 readings
      }

      const avgGasPrice =
        gasHistory.reduce((a, b) => a + b, 0) / gasHistory.length;
      const currentMultiplier = gasPriceGwei / avgGasPrice;

      console.log(`Current gas price: ${gasPriceGwei.toFixed(2)} gwei`);
      console.log(`  Average: ${avgGasPrice.toFixed(2)} gwei`);
      console.log(`  Multiplier: ${currentMultiplier.toFixed(2)}x`);

      if (currentMultiplier > ALERT_THRESHOLD_MULTIPLIER) {
        alertOperations('High gas price spike detected', {
          currentGasPrice: gasPriceGwei,
          averageGasPrice: avgGasPrice,
          multiplier: currentMultiplier,
        });
      }
    } catch (error) {
      console.error('Error monitoring gas prices:', error);
    }
  }, 30000); // Check every 30 seconds
}
```

---

## Health Checks

### Contract Availability

```typescript
// Verify contract is deployed and functional
async function performHealthCheck(contractAddress: string): Promise<boolean> {
  try {
    const provider = new ethers.providers.JsonRpcProvider('http://localhost:8545');

    // Check 1: Code exists at address
    const code = await provider.getCode(contractAddress);
    if (code === '0x') {
      console.error('❌ No contract code at address');
      return false;
    }
    console.log('✅ Contract code verified');

    // Check 2: Contract is readable
    const contractABI = [
      'function getOwner() public view returns (address)',
      'function isActive() public view returns (bool)',
    ];

    const contract = new ethers.Contract(contractABI, contractAddress, provider);

    try {
      const owner = await contract.getOwner?.();
      console.log(`✅ Contract readable, owner: ${owner}`);
    } catch (error) {
      // Function might not exist
      console.log('⚠️  Could not call view function');
    }

    // Check 3: Storage accessible
    const balance = await provider.getBalance(contractAddress);
    console.log(`✅ Contract balance: ${ethers.utils.formatEther(balance)} ETH`);

    // Check 4: State is consistent
    const latestBlock = await provider.getBlock('latest');
    console.log(`✅ Latest block: ${latestBlock.number}`);

    return true;
  } catch (error) {
    console.error('❌ Health check failed:', error);
    return false;
  }
}

// Run periodic health checks
async function setupHealthCheckSchedule(contractAddress: string) {
  // Run every 5 minutes
  setInterval(async () => {
    const healthy = await performHealthCheck(contractAddress);

    if (!healthy) {
      alertOperations('Contract health check failed', {
        contractAddress,
        timestamp: new Date().toISOString(),
      });
    }
  }, 5 * 60 * 1000);
}
```

### State Validation

```typescript
// Verify contract state integrity
interface ContractStateSnapshot {
  owner: string;
  totalOperations: number;
  lastOperationTime: number;
  blockhash: string;
}

async function validateContractState(
  contractAddress: string,
  expectedState: ContractStateSnapshot
): Promise<boolean> {
  const provider = new ethers.providers.JsonRpcProvider('http://localhost:8545');
  const block = await provider.getBlock('latest');

  // Verify state at expected block
  const currentState: ContractStateSnapshot = {
    owner: await getContractOwner(contractAddress),
    totalOperations: await getOperationCount(contractAddress),
    lastOperationTime: await getLastOperationTime(contractAddress),
    blockhash: block.hash,
  };

  // Compare with expected state
  if (currentState.owner !== expectedState.owner) {
    console.error('❌ Owner mismatch');
    return false;
  }

  if (currentState.blockhash !== expectedState.blockhash) {
    console.warn('⚠️  Block changed since snapshot');
  }

  console.log('✅ State validation passed');
  return true;
}
```

---

## Performance Tracking

### Gas Usage Patterns

```typescript
// Track gas consumption over time
interface GasMetric {
  timestamp: number;
  operation: string;
  gasUsed: number;
  gasPrice: number;
  costUSD: number;
}

const gasMetrics: GasMetric[] = [];

async function recordGasUsage(
  operation: string,
  gasUsed: number,
  gasPrice: number
) {
  const ethPriceUSD = 2500; // Example price
  const costUSD = (gasUsed * gasPrice) / 1e18 * ethPriceUSD;

  const metric: GasMetric = {
    timestamp: Date.now(),
    operation,
    gasUsed,
    gasPrice,
    costUSD,
  };

  gasMetrics.push(metric);

  console.log(`Gas usage: ${operation} - ${gasUsed} gas (${costUSD.toFixed(4)} USD)`);
}

function analyzeGasUsage() {
  const operations = new Map<string, GasMetric[]>();

  // Group by operation type
  for (const metric of gasMetrics) {
    if (!operations.has(metric.operation)) {
      operations.set(metric.operation, []);
    }
    operations.get(metric.operation)!.push(metric);
  }

  console.log('\n📊 Gas Usage Analysis');
  console.log('====================');

  for (const [operation, metrics] of operations) {
    const avgGas = metrics.reduce((sum, m) => sum + m.gasUsed, 0) / metrics.length;
    const avgCost = metrics.reduce((sum, m) => sum + m.costUSD, 0) / metrics.length;
    const minGas = Math.min(...metrics.map(m => m.gasUsed));
    const maxGas = Math.max(...metrics.map(m => m.gasUsed));

    console.log(`\n${operation}:`);
    console.log(`  Average gas: ${avgGas.toFixed(0)}`);
    console.log(`  Min/Max: ${minGas} - ${maxGas}`);
    console.log(`  Average cost: ${avgCost.toFixed(6)} USD`);
  }
}
```

### Throughput Monitoring

```typescript
// Monitor transaction throughput
interface ThroughputMetric {
  timestamp: number;
  transactionCount: number;
  successCount: number;
  failureCount: number;
  avgGasUsed: number;
}

async function monitorThroughput(contractAddress: string) {
  const provider = new ethers.providers.JsonRpcProvider('http://localhost:8545');

  setInterval(async () => {
    try {
      const currentBlock = await provider.getBlock('latest');
      const previousBlockNumber = currentBlock.number - 1;
      const previousBlock = await provider.getBlock(previousBlockNumber);

      // Count contract interactions in block
      const contractTxs = currentBlock.transactions.filter((txHash: string) => {
        // Would need to check each tx, simplified here
        return true;
      });

      const metric: ThroughputMetric = {
        timestamp: Date.now(),
        transactionCount: contractTxs.length,
        successCount: contractTxs.length, // Would need to verify
        failureCount: 0,
        avgGasUsed: 0,
      };

      console.log(`Block ${currentBlock.number}: ${contractTxs.length} contract transactions`);
    } catch (error) {
      console.error('Error monitoring throughput:', error);
    }
  }, 12000); // Check every block (~12 seconds on Ethereum)
}
```

---

## Error Detection & Response

### Automated Response System

```typescript
// Detect and respond to errors automatically
interface Alert {
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: string;
  message: string;
  data: any;
  timestamp: number;
  resolved: boolean;
}

const activeAlerts: Map<string, Alert> = new Map();

async function detectAndRespond(error: any, context: any) {
  // Classify error severity
  let severity: Alert['severity'] = 'low';
  let type = 'unknown_error';

  if (error.code === 'CALL_EXCEPTION') {
    type = 'contract_execution_failure';
    severity = 'high';
  } else if (error.code === 'TIMEOUT') {
    type = 'rpc_timeout';
    severity = 'medium';
  } else if (error.code === 'NETWORK_ERROR') {
    type = 'network_failure';
    severity = 'critical';
  }

  const alert: Alert = {
    severity,
    type,
    message: error.message,
    data: context,
    timestamp: Date.now(),
    resolved: false,
  };

  const alertId = `${type}-${alert.timestamp}`;
  activeAlerts.set(alertId, alert);

  // Automatic response based on severity
  switch (severity) {
    case 'critical':
      await handleCritical(alert);
      break;
    case 'high':
      await handleHigh(alert);
      break;
    case 'medium':
      await handleMedium(alert);
      break;
    case 'low':
      // Log and continue
      console.log('Low severity alert:', alert);
      break;
  }

  return alertId;
}

async function handleCritical(alert: Alert) {
  console.error('🚨 CRITICAL ALERT:', alert.message);

  // Immediate actions
  await pauseOperations();
  await notifyManagementImmediately(alert);
  await initiateIncidentResponse();
  await enableDetailedLogging();
}

async function handleHigh(alert: Alert) {
  console.error('⚠️ HIGH SEVERITY ALERT:', alert.message);

  // Escalated response
  await notifyTeamLead(alert);
  await increaseMonitoringFrequency();
  await prepareRollback();
}

async function handleMedium(alert: Alert) {
  console.warn('⚠️ MEDIUM SEVERITY ALERT:', alert.message);

  // Standard response
  await notifyTeam(alert);
  await collectDiagnostics();
}

// Placeholder functions
async function pauseOperations() { console.log('Pausing operations...'); }
async function notifyManagementImmediately(alert: Alert) { console.log('Notifying management...'); }
async function initiateIncidentResponse() { console.log('Starting incident response...'); }
async function enableDetailedLogging() { console.log('Enabling detailed logs...'); }
async function notifyTeamLead(alert: Alert) { console.log('Notifying team lead...'); }
async function increaseMonitoringFrequency() { console.log('Increasing monitoring frequency...'); }
async function prepareRollback() { console.log('Preparing rollback...'); }
async function notifyTeam(alert: Alert) { console.log('Notifying team...'); }
async function collectDiagnostics() { console.log('Collecting diagnostics...'); }
```

---

## Maintenance Procedures

### Regular Maintenance Schedule

```markdown
# Maintenance Calendar

## Daily (Automated)
- Health checks every 5 minutes
- Gas price monitoring every 30 seconds
- Event log ingestion continuous
- Alert processing real-time

## Weekly
- Review transaction patterns
- Analyze gas consumption trends
- Check security event logs
- Verify backup integrity

## Monthly
- Performance benchmark execution
- Security audit review
- Documentation updates
- Dependency updates (non-breaking)

## Quarterly
- Comprehensive security audit
- Contract upgrade planning
- Disaster recovery drill
- Compliance verification

## Annually
- Full security assessment
- Architecture review
- Long-term performance analysis
- Roadmap planning
```

### Backup & Snapshot Procedures

```bash
#!/bin/bash
# Backup contract state and configuration

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="backups/${DATE}"

mkdir -p $BACKUP_DIR

# Export contract state
echo "Exporting contract state..."
npm run export:state -- \
  --contract-address $CONTRACT_ADDRESS \
  --output $BACKUP_DIR/contract-state.json

# Export configuration
echo "Backing up configuration..."
cp .env $BACKUP_DIR/.env.backup
cp hardhat.config.ts $BACKUP_DIR/

# Export deployment info
echo "Backing up deployment info..."
cp deployments/* $BACKUP_DIR/ 2>/dev/null

# Create archive
tar -czf backups/backup_${DATE}.tar.gz $BACKUP_DIR

# Verify backup
if [ -f "backups/backup_${DATE}.tar.gz" ]; then
  echo "✅ Backup created successfully"
  # Upload to secure storage
  aws s3 cp backups/backup_${DATE}.tar.gz s3://backup-bucket/fhevm/
else
  echo "❌ Backup failed"
  exit 1
fi

# Cleanup
rm -rf $BACKUP_DIR
```

---

## Upgrade Management

### Safe Upgrade Procedure

```typescript
// Execute contract upgrade safely
async function upgradeContract(
  proxyAddress: string,
  newImplementationAddress: string
): Promise<string> {
  // Pre-upgrade checks
  console.log('📋 Running pre-upgrade checks...');

  // 1. Verify new implementation
  const codeValid = await verifyImplementation(newImplementationAddress);
  if (!codeValid) throw new Error('Invalid implementation');

  // 2. Run full test suite
  const testsPass = await runFullTestSuite();
  if (!testsPass) throw new Error('Tests failed');

  // 3. Snapshot current state
  const snapshot = await snapshotContractState(proxyAddress);
  console.log('✅ State snapshot created');

  // 4. Execute upgrade
  console.log('🔄 Executing upgrade...');
  const signer = await ethers.getSigner();
  const admin = ITransparentUpgradeableProxy__factory.connect(proxyAddress, signer);

  const upgradeTx = await admin.upgradeTo(newImplementationAddress);
  const receipt = await upgradeTx.wait();
  console.log(`✅ Upgrade executed: ${receipt.transactionHash}`);

  // 5. Post-upgrade verification
  console.log('🔍 Running post-upgrade verification...');
  const stateValid = await verifyStateIntegrity(proxyAddress, snapshot);
  if (!stateValid) {
    console.error('❌ State integrity check failed - ROLLBACK INITIATED');
    await rollbackUpgrade(proxyAddress);
    throw new Error('Upgrade verification failed');
  }

  console.log('✅ Upgrade completed successfully');
  return receipt.transactionHash;
}

async function rollbackUpgrade(proxyAddress: string) {
  // Implement rollback logic
  console.log('⚠️  Rolling back to previous implementation');
  // ... rollback code
}
```

---

## Disaster Recovery

### Recovery Plan

```markdown
# Disaster Recovery Plan

## Recovery Time Objectives (RTO)
- Critical issue: < 1 hour
- High severity: < 4 hours
- Medium severity: < 1 day
- Low severity: < 1 week

## Recovery Point Objectives (RPO)
- Blockchain state: Immutable (on-chain data safe)
- Off-chain data: < 5 minutes
- Configuration: < 1 minute

## Recovery Procedures

### Scenario 1: Contract Malfunction
1. Pause operations (if pausable)
2. Investigate root cause
3. Deploy fixed implementation
4. Execute upgrade
5. Verify state integrity
6. Resume operations

### Scenario 2: Compromised Private Key
1. Revoke compromised key permissions
2. Rotate to new key
3. Update all dependent systems
4. Monitor for unauthorized access
5. Audit transaction history

### Scenario 3: Data Corruption
1. Halt operations immediately
2. Restore from most recent verified backup
3. Re-apply valid transactions
4. Verify state consistency
5. Gradually resume operations

### Scenario 4: Network/Node Failure
1. Switch to backup RPC provider
2. Verify blockchain state synchronization
3. Check contract accessibility
4. Re-establish monitoring
5. Investigate root cause
```

---

## Monitoring Dashboard

### Metrics to Track

```markdown
# Key Performance Indicators (KPIs)

## Availability
- Contract uptime: 99.9%+
- RPC endpoint availability: 99.99%+
- Mean time to recovery: < 1 hour

## Performance
- Average gas per transaction: < 3M
- Transaction confirmation time: < 2 blocks
- Throughput: X transactions/hour

## Security
- Authorization failures per day: 0
- Suspicious activities detected: Real-time
- Security audit findings: 0 critical

## Operational
- System errors per day: < 1
- Alert false positive rate: < 5%
- Mean time to acknowledge alert: < 5 min
```

### Sample Dashboard Queries (for The Graph/Subgraph)

```graphql
query ContractMetrics {
  fheOperations(first: 100, orderBy: timestamp, orderDirection: desc) {
    id
    operator
    operation
    gasUsed
    timestamp
    transactionHash
  }

  permissionEvents(first: 50, orderBy: timestamp, orderDirection: desc) {
    id
    user
    action
    timestamp
    transactionHash
  }

  dailyStats(first: 30, orderBy: date, orderDirection: desc) {
    date
    totalOperations
    totalGasUsed
    averageGasPerTx
    failureCount
  }
}
```

---

## Escalation Procedures

```
Level 1: Automated Response
↓
Level 2: Team Alert (Slack/Email)
↓
Level 3: Team Lead Notification
↓
Level 4: Incident Commander
↓
Level 5: Executive Escalation
↓
Level 6: Crisis Management
```

---

## Checklist for Production Deployment

- [ ] Monitoring infrastructure deployed
- [ ] Health checks configured and tested
- [ ] Alerting rules established and tuned
- [ ] Backup procedures automated
- [ ] Disaster recovery plan documented
- [ ] Team training completed
- [ ] Runbooks prepared for common issues
- [ ] On-call rotation established
- [ ] Incident response templates created
- [ ] Post-incident review process defined

---

**Last Updated**: December 2025
**Status**: Production Ready
**Next Review**: January 2026
