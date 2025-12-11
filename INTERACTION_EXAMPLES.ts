/**
 * FHEVM Contract Interaction Examples
 *
 * Demonstrates how to interact with deployed FHEVM contracts
 * Shows practical patterns for encryption, permission management, and state manipulation
 */

import { ethers } from 'ethers';

/**
 * ============================================================
 * 1. BASIC SETUP - Connect to Contract
 * ============================================================
 */

async function setupProvider() {
  // Connect to local Hardhat node
  const provider = new ethers.providers.JsonRpcProvider(
    'http://127.0.0.1:8545'
  );

  // Get signer (account that will sign transactions)
  const signer = provider.getSigner();
  const signerAddress = await signer.getAddress();

  console.log(`Connected as: ${signerAddress}`);

  return { provider, signer, signerAddress };
}

/**
 * ============================================================
 * 2. FHECOUNTER - Basic Encrypted Counter
 * ============================================================
 */

interface FHECounterInteractionOptions {
  contractAddress: string;
  signer: ethers.Signer;
}

async function interactWithFHECounter(options: FHECounterInteractionOptions) {
  const { contractAddress, signer } = options;

  // Contract ABI (minimal)
  const contractABI = [
    'function increment(bytes calldata encryptedInput, bytes calldata inputProof) public',
    'function add(bytes calldata encryptedInput, bytes calldata inputProof) public',
    'function getIncrementCount() public view returns (uint32)',
  ];

  // Create contract instance
  const contract = new ethers.Contract(contractABI, contractAddress, signer);

  console.log('\n📊 FHE Counter Interaction Examples');
  console.log('=====================================');

  // Example 1: Encrypt and increment
  console.log('\n1️⃣  Encrypting value and calling increment...');
  const signerAddress = await signer.getAddress();

  // Create encrypted input (in real scenario, client-side encryption)
  const input = await (ethers as any).encryptedInput(signerAddress);
  input.add32(100);
  const encrypted = await input.encrypt();

  // Call contract with encrypted value
  const tx = await contract.increment(encrypted.handles[0], encrypted.inputProof);
  const receipt = await tx.wait();

  console.log(`✅ Transaction: ${receipt.transactionHash}`);
  console.log(`⛽ Gas used: ${receipt.gasUsed.toString()}`);

  // Example 2: Add encrypted value
  console.log('\n2️⃣  Adding encrypted values...');
  const input2 = await (ethers as any).encryptedInput(signerAddress);
  input2.add32(50);
  const encrypted2 = await input2.encrypt();

  const tx2 = await contract.add(encrypted2.handles[0], encrypted2.inputProof);
  await tx2.wait();
  console.log(`✅ Addition completed`);

  // Example 3: Read public state
  console.log('\n3️⃣  Reading counter state...');
  const count = await contract.getIncrementCount();
  console.log(`📈 Counter value: ${count}`);

  return { contract, receipt };
}

/**
 * ============================================================
 * 3. ACCESS CONTROL - Permission Management
 * ============================================================
 */

interface AccessControlInteractionOptions {
  contractAddress: string;
  signer: ethers.Signer;
  targetUser: string;
}

async function interactWithAccessControl(
  options: AccessControlInteractionOptions
) {
  const { contractAddress, signer, targetUser } = options;

  const contractABI = [
    'function setPermission(address user, bytes calldata encryptedHandle) public',
    'function revokePermission(address user) public',
    'function checkPermission(address user) public view returns (bool)',
  ];

  const contract = new ethers.Contract(contractABI, contractAddress, signer);

  console.log('\n🔐 Access Control Interaction Examples');
  console.log('========================================');

  // Example 1: Grant permission
  console.log(`\n1️⃣  Granting permission to ${targetUser}...`);
  const signerAddress = await signer.getAddress();

  const input = await (ethers as any).encryptedInput(signerAddress);
  input.add32(999);
  const encrypted = await input.encrypt();

  const tx = await contract.setPermission(targetUser, encrypted.handles[0]);
  const receipt = await tx.wait();

  console.log(`✅ Permission granted`);
  console.log(`📝 Transaction: ${receipt.transactionHash}`);

  // Example 2: Check permission
  console.log(`\n2️⃣  Checking if ${targetUser} has permission...`);
  const hasPermission = await contract.checkPermission(targetUser);
  console.log(`🔑 Has permission: ${hasPermission}`);

  // Example 3: Revoke permission
  console.log(`\n3️⃣  Revoking permission from ${targetUser}...`);
  const tx2 = await contract.revokePermission(targetUser);
  await tx2.wait();
  console.log(`✅ Permission revoked`);

  return { contract, receipt };
}

/**
 * ============================================================
 * 4. FHE OPERATIONS - Arithmetic and Comparisons
 * ============================================================
 */

interface FHEOperationsInteractionOptions {
  fheAddAddress: string;
  fheEqAddress: string;
  signer: ethers.Signer;
}

async function interactWithFHEOperations(
  options: FHEOperationsInteractionOptions
) {
  const { fheAddAddress, fheEqAddress, signer } = options;

  const operationABI = [
    'function add(bytes calldata encryptedInput, bytes calldata inputProof) public',
    'function compare(bytes calldata encryptedInput, bytes calldata inputProof) public',
  ];

  const fheAddContract = new ethers.Contract(
    operationABI,
    fheAddAddress,
    signer
  );
  const fheEqContract = new ethers.Contract(operationABI, fheEqAddress, signer);

  console.log('\n➕ FHE Operations Interaction Examples');
  console.log('========================================');

  const signerAddress = await signer.getAddress();

  // Example 1: Addition
  console.log('\n1️⃣  Performing encrypted addition...');
  const input1 = await (ethers as any).encryptedInput(signerAddress);
  input1.add32(25);
  const encrypted1 = await input1.encrypt();

  const tx1 = await fheAddContract.add(encrypted1.handles[0], encrypted1.inputProof);
  const receipt1 = await tx1.wait();
  console.log(`✅ Addition: 25 + value completed`);
  console.log(`⛽ Gas: ${receipt1.gasUsed.toString()}`);

  // Example 2: Comparison
  console.log('\n2️⃣  Performing encrypted comparison...');
  const input2 = await (ethers as any).encryptedInput(signerAddress);
  input2.add32(50);
  const encrypted2 = await input2.encrypt();

  const tx2 = await fheEqContract.compare(
    encrypted2.handles[0],
    encrypted2.inputProof
  );
  const receipt2 = await tx2.wait();
  console.log(`✅ Comparison: (50 == value) completed`);
  console.log(`⛽ Gas: ${receipt2.gasUsed.toString()}`);

  // Example 3: Multiple operations
  console.log('\n3️⃣  Performing batch operations...');
  const operations = [];

  for (let i = 0; i < 3; i++) {
    const input = await (ethers as any).encryptedInput(signerAddress);
    input.add32(10 + i);
    const encrypted = await input.encrypt();

    operations.push(
      fheAddContract.add(encrypted.handles[0], encrypted.inputProof)
    );
  }

  const results = await Promise.all(operations.map(tx => tx.wait()));
  console.log(`✅ Completed ${results.length} batch operations`);

  const totalGas = results.reduce((sum, r) => sum.add(r.gasUsed), ethers.BigNumber.from(0));
  console.log(`⛽ Total gas: ${totalGas.toString()}`);

  return { fheAddContract, fheEqContract };
}

/**
 * ============================================================
 * 5. BATCH OPERATIONS - Efficient Multi-Operation Execution
 * ============================================================
 */

interface BatchOperationOptions {
  contractAddress: string;
  signer: ethers.Signer;
  operationCount: number;
}

async function performBatchOperations(options: BatchOperationOptions) {
  const { contractAddress, signer, operationCount } = options;

  const contractABI = [
    'function batchAdd(bytes[] calldata encryptedInputs, bytes calldata inputProof) public',
  ];

  const contract = new ethers.Contract(contractABI, contractAddress, signer);

  console.log('\n📦 Batch Operations Examples');
  console.log('==============================');

  const signerAddress = await signer.getAddress();

  // Example 1: Sequential operations (less efficient)
  console.log('\n1️⃣  Sequential operations (baseline)...');
  const startSequential = Date.now();

  for (let i = 0; i < operationCount; i++) {
    const input = await (ethers as any).encryptedInput(signerAddress);
    input.add32(i + 1);
    const encrypted = await input.encrypt();

    const tx = await contract.add(encrypted.handles[0], encrypted.inputProof);
    await tx.wait();
  }

  const sequentialTime = Date.now() - startSequential;
  console.log(`⏱️  Time: ${sequentialTime}ms for ${operationCount} operations`);
  console.log(`📊 Average: ${(sequentialTime / operationCount).toFixed(2)}ms per operation`);

  // Example 2: Batch operations (more efficient)
  console.log('\n2️⃣  Batch operations (optimized)...');
  const startBatch = Date.now();

  const encryptedValues = [];
  for (let i = 0; i < operationCount; i++) {
    const input = await (ethers as any).encryptedInput(signerAddress);
    input.add32(i + 1);
    encryptedValues.push(await input.encrypt());
  }

  // If contract supports batch
  if (contract.batchAdd) {
    const handles = encryptedValues.map(e => e.handles[0]);
    const tx = await contract.batchAdd(handles, encryptedValues[0].inputProof);
    await tx.wait();
  }

  const batchTime = Date.now() - startBatch;
  console.log(`⏱️  Time: ${batchTime}ms for ${operationCount} operations`);
  console.log(`📊 Average: ${(batchTime / operationCount).toFixed(2)}ms per operation`);

  // Efficiency comparison
  const improvement = ((sequentialTime - batchTime) / sequentialTime * 100).toFixed(2);
  console.log(`\n🚀 Batch efficiency: ${improvement}% faster`);

  return { contract };
}

/**
 * ============================================================
 * 6. STATE MANAGEMENT - Read and Update State
 * ============================================================
 */

interface StateManagementOptions {
  contractAddress: string;
  signer: ethers.Signer;
}

async function manageContractState(options: StateManagementOptions) {
  const { contractAddress, signer } = options;

  const contractABI = [
    'function getValue() public view returns (bytes)',
    'function setValue(bytes calldata value) public',
    'function getOwner() public view returns (address)',
    'function getBalance(address user) public view returns (uint256)',
  ];

  const contract = new ethers.Contract(contractABI, contractAddress, signer);

  console.log('\n📋 State Management Examples');
  console.log('==============================');

  // Example 1: Read public state
  console.log('\n1️⃣  Reading public state...');
  try {
    const owner = await contract.getOwner();
    console.log(`👤 Owner: ${owner}`);
  } catch (error) {
    console.log('⚠️  Could not read owner (function may not exist)');
  }

  // Example 2: Read user balance
  console.log('\n2️⃣  Reading user balance...');
  const signerAddress = await signer.getAddress();
  try {
    const balance = await contract.getBalance(signerAddress);
    console.log(`💰 Balance: ${balance.toString()} wei`);
  } catch (error) {
    console.log('⚠️  Could not read balance');
  }

  // Example 3: Update state
  console.log('\n3️⃣  Updating contract state...');
  try {
    const newValue = ethers.utils.toUtf8Bytes('new value');
    const tx = await contract.setValue(newValue);
    const receipt = await tx.wait();
    console.log(`✅ State updated`);
    console.log(`📝 Transaction: ${receipt.transactionHash}`);
  } catch (error) {
    console.log('⚠️  Could not update state');
  }

  return { contract };
}

/**
 * ============================================================
 * 7. MULTI-SIGNER INTERACTIONS - Different Users
 * ============================================================
 */

interface MultiSignerInteractionOptions {
  contractAddress: string;
  signers: ethers.Signer[];
}

async function multiSignerInteraction(
  options: MultiSignerInteractionOptions
) {
  const { contractAddress, signers } = options;

  const contractABI = [
    'function increment(bytes calldata encryptedInput, bytes calldata inputProof) public',
  ];

  console.log('\n👥 Multi-Signer Interaction Examples');
  console.log('=====================================');

  for (let i = 0; i < signers.length; i++) {
    const signer = signers[i];
    const address = await signer.getAddress();

    console.log(`\n${i + 1}️⃣  Signer ${i + 1}: ${address}`);

    const contract = new ethers.Contract(contractABI, contractAddress, signer);

    // Each user encrypts with their own key
    const input = await (ethers as any).encryptedInput(address);
    input.add32(100 + i);
    const encrypted = await input.encrypt();

    const tx = await contract.increment(encrypted.handles[0], encrypted.inputProof);
    const receipt = await tx.wait();

    console.log(`   ✅ Transaction: ${receipt.transactionHash}`);
    console.log(`   ⛽ Gas: ${receipt.gasUsed.toString()}`);
  }
}

/**
 * ============================================================
 * 8. ERROR HANDLING - Graceful Failure Management
 * ============================================================
 */

interface ErrorHandlingOptions {
  contractAddress: string;
  signer: ethers.Signer;
}

async function demonstrateErrorHandling(options: ErrorHandlingOptions) {
  const { contractAddress, signer } = options;

  const contractABI = [
    'function increment(bytes calldata encryptedInput, bytes calldata inputProof) public',
  ];

  const contract = new ethers.Contract(contractABI, contractAddress, signer);

  console.log('\n⚠️  Error Handling Examples');
  console.log('============================');

  // Example 1: Handle invalid input
  console.log('\n1️⃣  Handling invalid input...');
  try {
    const tx = await contract.increment('0x', '0x');
    await tx.wait();
  } catch (error: any) {
    console.log(`❌ Error caught: ${error.message}`);
    if (error.code === 'INSUFFICIENT_DATA') {
      console.log('   → Invalid encrypted data provided');
    }
  }

  // Example 2: Handle transaction failure
  console.log('\n2️⃣  Handling transaction failure...');
  try {
    // Attempt with wrong proof
    const input = await (ethers as any).encryptedInput(await signer.getAddress());
    input.add32(50);
    const encrypted = await input.encrypt();

    // Modify proof to make it invalid
    const invalidProof = '0x' + '00'.repeat(32);

    const tx = await contract.increment(encrypted.handles[0], invalidProof);
    await tx.wait();
  } catch (error: any) {
    console.log(`❌ Transaction failed: ${error.reason || error.message}`);
    if (error.code === 'CALL_EXCEPTION') {
      console.log('   → Contract call reverted');
    }
  }

  // Example 3: Handle gas estimation failure
  console.log('\n3️⃣  Handling gas estimation issues...');
  try {
    const input = await (ethers as any).encryptedInput(await signer.getAddress());
    input.add32(100);
    const encrypted = await input.encrypt();

    const tx = await contract.increment(encrypted.handles[0], encrypted.inputProof);
    const receipt = await tx.wait();
    console.log(`✅ Transaction succeeded`);
  } catch (error: any) {
    if (error.code === 'UNPREDICTABLE_GAS_LIMIT') {
      console.log(`⚠️  Gas estimation uncertain - transaction may fail`);
    }
  }
}

/**
 * ============================================================
 * 9. GAS MONITORING - Track and Optimize Gas Usage
 * ============================================================
 */

interface GasMonitoringOptions {
  contractAddress: string;
  signer: ethers.Signer;
}

async function monitorGasUsage(options: GasMonitoringOptions) {
  const { contractAddress, signer } = options;

  const contractABI = [
    'function increment(bytes calldata encryptedInput, bytes calldata inputProof) public',
    'function add(bytes calldata encryptedInput, bytes calldata inputProof) public',
  ];

  const contract = new ethers.Contract(contractABI, contractAddress, signer);

  console.log('\n⛽ Gas Monitoring Examples');
  console.log('==========================');

  const signerAddress = await signer.getAddress();
  const gasReadings: { operation: string; gasUsed: number }[] = [];

  // Example 1: Monitor single operation
  console.log('\n1️⃣  Monitoring single operation gas usage...');
  const input1 = await (ethers as any).encryptedInput(signerAddress);
  input1.add32(50);
  const encrypted1 = await input1.encrypt();

  const tx1 = await contract.increment(encrypted1.handles[0], encrypted1.inputProof);
  const receipt1 = await tx1.wait();

  const gasUsed1 = receipt1.gasUsed.toNumber();
  gasReadings.push({ operation: 'increment', gasUsed: gasUsed1 });
  console.log(`   ⛽ Gas used: ${gasUsed1}`);

  // Example 2: Monitor different operations
  console.log('\n2️⃣  Monitoring different operations...');
  const input2 = await (ethers as any).encryptedInput(signerAddress);
  input2.add32(100);
  const encrypted2 = await input2.encrypt();

  const tx2 = await contract.add(encrypted2.handles[0], encrypted2.inputProof);
  const receipt2 = await tx2.wait();

  const gasUsed2 = receipt2.gasUsed.toNumber();
  gasReadings.push({ operation: 'add', gasUsed: gasUsed2 });
  console.log(`   ⛽ Gas used: ${gasUsed2}`);

  // Example 3: Analyze gas usage
  console.log('\n3️⃣  Analyzing gas usage patterns...');
  const avgGas = gasReadings.reduce((sum, r) => sum + r.gasUsed, 0) / gasReadings.length;
  const maxGas = Math.max(...gasReadings.map(r => r.gasUsed));
  const minGas = Math.min(...gasReadings.map(r => r.gasUsed));

  console.log(`   📊 Average gas: ${avgGas.toFixed(0)}`);
  console.log(`   📈 Max gas: ${maxGas}`);
  console.log(`   📉 Min gas: ${minGas}`);

  // Example 4: Cost estimation
  console.log('\n4️⃣  Estimating transaction costs...');
  const gasPrice = (await signer.provider?.getGasPrice())?.toNumber() || 1;
  const avgCost = (avgGas * gasPrice) / 1e18;

  console.log(`   💰 Avg gas price: ${(gasPrice / 1e9).toFixed(2)} gwei`);
  console.log(`   💵 Est. avg cost: ${avgCost.toFixed(6)} ETH`);
}

/**
 * ============================================================
 * 10. COMPLETE WORKFLOW - End-to-End Example
 * ============================================================
 */

async function completeWorkflow() {
  console.log('🚀 FHEVM Complete Interaction Workflow');
  console.log('=====================================\n');

  // Step 1: Setup
  console.log('Step 1: Setting up provider and signer...');
  const { provider, signer, signerAddress } = await setupProvider();

  // Step 2: Load contract
  console.log('Step 2: Loading contract...');
  const contractABI = [
    'function increment(bytes calldata encryptedInput, bytes calldata inputProof) public',
    'function getIncrementCount() public view returns (uint32)',
  ];

  // Replace with actual deployed contract address
  const contractAddress = '0x...'; // Your deployed contract address
  const contract = new ethers.Contract(contractABI, contractAddress, signer);

  // Step 3: Encrypt value
  console.log('Step 3: Encrypting value client-side...');
  const input = await (ethers as any).encryptedInput(signerAddress);
  input.add32(42);
  const encrypted = await input.encrypt();

  // Step 4: Send transaction
  console.log('Step 4: Sending encrypted transaction...');
  const tx = await contract.increment(encrypted.handles[0], encrypted.inputProof);

  // Step 5: Wait for confirmation
  console.log('Step 5: Waiting for transaction confirmation...');
  const receipt = await tx.wait();

  // Step 6: Verify result
  console.log('Step 6: Verifying transaction...');
  console.log(`   ✅ Transaction hash: ${receipt.transactionHash}`);
  console.log(`   ⛽ Gas used: ${receipt.gasUsed.toString()}`);
  console.log(`   📍 Block: ${receipt.blockNumber}`);

  // Step 7: Read state
  console.log('Step 7: Reading updated state...');
  const count = await contract.getIncrementCount();
  console.log(`   📊 Counter: ${count}`);

  console.log('\n✅ Workflow completed successfully!');
}

/**
 * ============================================================
 * EXPORT FUNCTIONS FOR USE IN OTHER SCRIPTS
 * ============================================================
 */

export {
  setupProvider,
  interactWithFHECounter,
  interactWithAccessControl,
  interactWithFHEOperations,
  performBatchOperations,
  manageContractState,
  multiSignerInteraction,
  demonstrateErrorHandling,
  monitorGasUsage,
  completeWorkflow,
};

/**
 * Main entry point for testing
 */
if (require.main === module) {
  completeWorkflow().catch(console.error);
}

/**
 * Usage Instructions:
 *
 * 1. Copy this file to your project
 * 2. Install dependencies: npm install ethers
 * 3. Run locally deployed contracts on Hardhat node
 * 4. Update contract addresses and ABIs as needed
 * 5. Call functions directly or via scripts
 *
 * Example in your code:
 * ```typescript
 * import { interactWithFHECounter } from './INTERACTION_EXAMPLES';
 *
 * const { signer } = await setupProvider();
 * await interactWithFHECounter({
 *   contractAddress: '0x...',
 *   signer: signer
 * });
 * ```
 */
