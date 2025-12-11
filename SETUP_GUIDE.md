# Project Setup Guide

**Complete setup instructions for FHEVM Example Repository**

---

## 📋 Prerequisites

### Required
- Node.js 18.0 or higher
- npm 9.0 or higher
- Git 2.0 or higher

### Recommended
- Visual Studio Code or similar editor
- Hardhat extension for your editor
- Solidity syntax highlighting

### Verify Installation
```bash
node --version    # Should be v18.0.0 or higher
npm --version     # Should be 9.0.0 or higher
git --version     # Should be 2.0.0 or higher
```

---

## 🚀 Quick Start (5 minutes)

### 1. Clone/Download Repository
```bash
# Clone the repository
git clone https://github.com/your-username/fhevm-examples.git
cd fhevm-examples

# Or extract downloaded files
cd fhevm-examples
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Compile Contracts
```bash
npm run compile
```

### 4. Run Tests
```bash
npm test
```

### 5. Deploy (Optional)
```bash
npx hardhat run scripts/deploy.ts --network localhost
```

---

## 🔧 Detailed Setup

### Step 1: Environment Setup

#### Create `.env` File
```bash
cp .env.example .env
```

#### Edit `.env`
```env
# Network RPC URLs
TESTNET_RPC_URL=http://localhost:8545
MAINNET_RPC_URL=https://...

# Private Key (for deployment)
PRIVATE_KEY=your-private-key-here

# API Keys (optional)
ETHERSCAN_API_KEY=your-key-here

# Configuration
REPORT_GAS=false
```

### Step 2: Install FHEVM Dependencies

```bash
npm install @fhevm/solidity@latest
npm install --save-dev hardhat-tfhe
npm install --save-dev @nomicfoundation/hardhat-toolbox
```

### Step 3: Verify Installation

```bash
# Check if all dependencies are installed
npm list

# Check Node.js version
node --version

# Check npm version
npm --version
```

---

## 💻 Common Setup Issues & Solutions

### Issue: Cannot find module '@fhevm/solidity'
**Solution:**
```bash
npm install @fhevm/solidity --legacy-peer-deps
```

### Issue: Hardhat not found
**Solution:**
```bash
npm install -g hardhat
# or use npx: npx hardhat
```

### Issue: Port 8545 already in use
**Solution:**
```bash
# Kill the process using the port
# Windows: netstat -ano | findstr :8545
# Mac/Linux: lsof -i :8545 | grep LISTEN

# Or change the port in hardhat.config.ts
```

### Issue: Gas estimation failed
**Solution:**
```bash
# Clear cache and try again
npx hardhat clean
npm run compile
```

### Issue: TypeScript compilation errors
**Solution:**
```bash
# Regenerate typechain types
npx hardhat typechain

# Clear cache
npx hardhat clean
```

---

## 📂 Project Structure

```
fhevm-examples/
├── contracts/
│   ├── basic/
│   │   ├── FHECounter.sol
│   │   ├── FHEAdd.sol
│   │   └── ...
│   ├── access-control/
│   │   ├── AccessControlFundamentals.sol
│   │   └── ...
│   ├── anti-patterns/
│   │   └── ...
│   └── advanced/
│       └── ...
├── test/
│   ├── FHECounter.test.ts
│   └── ...
├── scripts/
│   ├── deploy.ts
│   └── ...
├── docs/
│   ├── GETTING_STARTED.md
│   └── ...
├── hardhat.config.ts
├── package.json
├── tsconfig.json
├── .env.example
├── .gitignore
└── README.md
```

---

## 🛠️ Build & Compilation

### Compile All Contracts
```bash
npm run compile
```

### Compile Specific Contract
```bash
npx hardhat compile --quiet
```

### View Compilation Output
```bash
npx hardhat compile --verbose
```

### Clean Build
```bash
npx hardhat clean
npm run compile
```

---

## 🧪 Testing

### Run All Tests
```bash
npm test
```

### Run Specific Test File
```bash
npm test test/FHECounter.test.ts
```

### Run Tests with Coverage
```bash
npx hardhat coverage
```

### Watch Mode (auto-rerun on file changes)
```bash
npm test -- --watch
```

### Show Gas Usage
```bash
REPORT_GAS=true npm test
```

---

## 🚀 Running Local Network

### Start Hardhat Node
```bash
npx hardhat node
```

This will:
- Start a local blockchain at `http://127.0.0.1:8545`
- Display 20 pre-funded accounts
- Show network information

### In Another Terminal, Deploy
```bash
npx hardhat run scripts/deploy.ts --network localhost
```

---

## 📦 Deploying Contracts

### Deploy to Localhost
```bash
npx hardhat run scripts/deploy.ts --network localhost
```

### Deploy to Testnet
```bash
npx hardhat run scripts/deploy.ts --network testnet
```

### Verify After Deployment
```bash
npx hardhat verify --network testnet DEPLOYED_ADDRESS "constructor args"
```

---

## 🔍 Debugging

### Enable Debug Output
```bash
DEBUG=hardhat npm test
```

### Run with Debugger
```bash
node --inspect-brk node_modules/.bin/hardhat test
```

### Check Configuration
```bash
npx hardhat config
```

---

## 📝 Code Generation

### Generate TypeChain Types
```bash
npx hardhat typechain
```

### Regenerate After Contract Changes
```bash
npm run compile  # Compiles contracts
npx hardhat typechain  # Generates types
```

---

## 🔐 Security Best Practices

### Protect Private Keys
```bash
# Add to .gitignore (should already be there)
.env
.env.local
.env.*.local
```

### Never Commit Secrets
```bash
# Verify no secrets in git
git log -p --all -S "private_key" | head -20
```

### Use Environment Variables
```typescript
// In your code
const privateKey = process.env.PRIVATE_KEY;
```

---

## 🧬 Version Management

### Check Dependency Versions
```bash
npm list
npm list @fhevm/solidity
```

### Update Dependencies
```bash
npm update
```

### Update Specific Package
```bash
npm update @fhevm/solidity
```

---

## 📊 Project Verification

### Verify Setup with Checklist

- [ ] Node.js 18+ installed
- [ ] npm 9+ installed
- [ ] Git installed
- [ ] `.env` file created and configured
- [ ] Dependencies installed (`npm install` runs without errors)
- [ ] Contracts compile (`npm run compile` succeeds)
- [ ] Tests pass (`npm test` shows all passing)
- [ ] Hardhat node starts (`npx hardhat node` runs without errors)

---

## 🆘 Getting Help

### Check Documentation
- DEVELOPER_GUIDE.md - Development workflow
- PATTERNS.md - FHEVM patterns
- TROUBLESHOOTING.md - Common issues

### Check Hardhat Docs
- https://hardhat.org/docs

### Check FHEVM Docs
- https://docs.zama.ai/fhevm

### Check Community
- GitHub Issues
- Zama Discord
- Stack Overflow

---

## 📞 Support Resources

### Documentation Files
- QUICK_START.md - Fast setup
- DEVELOPER_GUIDE.md - Full workflow
- TROUBLESHOOTING.md - Problem solving

### External Resources
- Hardhat: https://hardhat.org
- FHEVM: https://docs.zama.ai/fhevm
- Solidity: https://docs.soliditylang.org
- Zama: https://www.zama.ai

---

## ✅ Next Steps

1. **Complete Setup** - Follow the Quick Start section
2. **Review Documentation** - Read QUICK_START.md
3. **Explore Examples** - Review example contracts
4. **Run Tests** - Execute `npm test`
5. **Start Development** - Build on the examples

---

**Setup Status**: Ready to Begin
**Last Updated**: December 2025
