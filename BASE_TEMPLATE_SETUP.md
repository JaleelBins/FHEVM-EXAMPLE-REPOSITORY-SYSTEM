# Base Template Setup Guide

The base template is the foundation for all generated examples. It should be a complete, ready-to-use Hardhat project configured for FHEVM development.

---

## 📋 Base Template Structure

```
base-template/
├── contracts/
│   ├── FHEExample.sol      # Example contract to replace
│   └── Counter.sol         # Alternative example
├── test/
│   └── FHEExample.ts       # Example tests to replace
├── deploy/
│   └── deploy.ts           # Deployment script
├── hardhat.config.ts       # Hardhat configuration
├── package.json            # Dependencies
├── package-lock.json
├── tsconfig.json          # TypeScript configuration
├── .gitignore
├── .env.example           # Environment variables template
├── README.md              # Setup instructions
└── LICENSE                # BSD-3-Clause-Clear

```

---

## 📦 package.json Configuration

```json
{
  "name": "fhevm-example-template",
  "version": "1.0.0",
  "description": "Template for FHEVM example repositories",
  "main": "index.js",
  "scripts": {
    "compile": "hardhat compile",
    "test": "hardhat test",
    "test:debug": "hardhat test --network localhost",
    "deploy": "hardhat run deploy/deploy.ts",
    "clean": "hardhat clean",
    "lint": "solhint 'contracts/**/*.sol'",
    "format": "prettier --write .",
    "type-check": "tsc --noEmit"
  },
  "keywords": [
    "fhevm",
    "fully homomorphic encryption",
    "privacy",
    "smart contracts",
    "hardhat"
  ],
  "author": "",
  "license": "BSD-3-Clause-Clear",
  "dependencies": {
    "@fhevm/solidity": "^0.9.1",
    "@fhevm/hardhat-plugin": "^0.3.0",
    "@zama-fhe/relayer-sdk": "^1.0.0"
  },
  "devDependencies": {
    "@nomicfoundation/hardhat-toolbox": "^4.0.0",
    "@nomicfoundation/hardhat-ethers": "^3.0.0",
    "@types/node": "^20.0.0",
    "ethers": "^6.8.0",
    "hardhat": "^10.0.0",
    "hardhat-deploy": "^0.11.0",
    "hardhat-gas-reporter": "^1.0.0",
    "solhint": "^4.0.0",
    "prettier": "^3.0.0",
    "typescript": "^5.0.0"
  }
}
```

---

## ⚙️ hardhat.config.ts Configuration

```typescript
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@fhevm/hardhat-plugin";
import "hardhat-deploy";
import "hardhat-gas-reporter";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },

  networks: {
    hardhat: {
      // FHEVM testing network configuration
      initialBaseFeePerGas: 0,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
    },
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  },

  gasReporter: {
    enabled: process.env.REPORT_GAS === "true",
    currency: "USD",
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
  },

  paths: {
    sources: "./contracts",
    tests: "./test",
    artifacts: "./artifacts",
    cache: "./cache",
  },

  typechain: {
    outDir: "typechain-types",
    target: "ethers-v6",
  },
};

export default config;
```

---

## 📝 TypeScript Configuration (tsconfig.json)

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,

    /* Path mapping */
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["contracts", "test", "scripts", "deploy"],
  "exclude": ["node_modules"],
  "ts-node": {
    "compilerOptions": {
      "module": "commonjs"
    },
    "transpileOnly": true,
    "files": true
  }
}
```

---

## 📄 Example Contract File

```solidity
// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { FHE, euint32, externalEuint32 } from "@fhevm/solidity/lib/FHE.sol";
import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title Example FHE Contract
/// @notice This is a template contract demonstrating FHEVM patterns
/// @dev Replace this with your example contract
contract FHEExample is ZamaEthereumConfig {
  euint32 private _encryptedValue;
  uint32 public counter;

  event ValueChanged(uint indexed newValue);

  constructor() {
    _encryptedValue = FHE.asEuint32(0);
    counter = 0;
  }

  /// @notice Update encrypted value
  /// @param inputEuint32 Encrypted value
  /// @param inputProof Proof of correct encryption
  function setValue(
    externalEuint32 inputEuint32,
    bytes calldata inputProof
  ) external {
    euint32 encryptedInput = FHE.fromExternal(inputEuint32, inputProof);
    _encryptedValue = encryptedInput;

    FHE.allowThis(_encryptedValue);
    FHE.allow(_encryptedValue, msg.sender);

    counter++;
    emit ValueChanged(counter);
  }

  /// @notice Get encrypted value
  function getEncryptedValue() external view returns (euint32) {
    return _encryptedValue;
  }

  /// @notice Get counter
  function getCounter() external view returns (uint32) {
    return counter;
  }
}
```

---

## 🧪 Example Test File

```typescript
import { expect } from "chai";
import { ethers } from "hardhat";
import { FHEExample } from "../typechain-types";
import { createEncryptedInput } from "hardhat-fhevm/gateway";

describe("FHEExample", () => {
  let contract: FHEExample;
  let owner: ethers.Signer;
  let contractAddress: string;

  before(async () => {
    [owner] = await ethers.getSigners();
  });

  beforeEach(async () => {
    const Factory = await ethers.getContractFactory("FHEExample");
    contract = await Factory.deploy();
    await contract.deployed();
    contractAddress = contract.address;
  });

  describe("setValue", () => {
    it("✅ should set encrypted value correctly", async () => {
      const input = await createEncryptedInput(
        contractAddress,
        owner.address
      )
        .add32(100)
        .encrypt();

      const tx = await contract.setValue(input.handles[0], input.inputProof);
      await tx.wait();

      const counter = await contract.getCounter();
      expect(counter).to.equal(1);
    });

    it("✅ should grant proper permissions", async () => {
      const input = await createEncryptedInput(
        contractAddress,
        owner.address
      )
        .add32(50)
        .encrypt();

      await contract.setValue(input.handles[0], input.inputProof);

      const encrypted = await contract.getEncryptedValue();
      expect(encrypted).to.not.be.undefined;
    });
  });

  describe("getCounter", () => {
    it("✅ should return correct counter value", async () => {
      const initialCounter = await contract.getCounter();
      expect(initialCounter).to.equal(0);

      const input = await createEncryptedInput(
        contractAddress,
        owner.address
      )
        .add32(100)
        .encrypt();

      await contract.setValue(input.handles[0], input.inputProof);

      const updatedCounter = await contract.getCounter();
      expect(updatedCounter).to.equal(1);
    });
  });
});
```

---

## 🚀 Deployment Script

```typescript
// deploy/deploy.ts

import { ethers, getNamedAccounts, deployments } from "hardhat";

export default async function () {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  console.log("Deploying FHEExample contract...");

  const deployment = await deploy("FHEExample", {
    from: deployer,
    args: [],
    log: true,
  });

  console.log(`FHEExample deployed to: ${deployment.address}`);

  // Verify contract if needed
  if (process.env.VERIFY === "true") {
    console.log("Verifying contract...");
    // Add verification logic here
  }
}

export const tags = ["FHEExample"];
```

---

## 📖 README Template

```markdown
# FHEVM Example Template

This is a complete base template for FHEVM example repositories.

## Overview

This template provides:
- Complete Hardhat configuration for FHEVM
- Example contract and test files
- Deployment scripts
- TypeScript support
- Development utilities

## Requirements

- Node.js 18+
- npm or yarn
- Git

## Installation

\`\`\`bash
# Clone the template
git clone <template-repo> my-example
cd my-example

# Install dependencies
npm install
\`\`\`

## Project Structure

- \`contracts/\` - Solidity smart contracts
- \`test/\` - Test files (TypeScript/JavaScript)
- \`deploy/\` - Deployment scripts
- \`hardhat.config.ts\` - Hardhat configuration
- \`package.json\` - Project dependencies

## Compilation

\`\`\`bash
npm run compile
\`\`\`

## Running Tests

\`\`\`bash
npm run test
\`\`\`

## Deployment

\`\`\`bash
npm run deploy
\`\`\`

## Code Quality

\`\`\`bash
# Lint Solidity code
npm run lint

# Format code
npm run format

# Type check
npm run type-check
\`\`\`

## Environment Variables

Copy \`.env.example\` to \`.env\` and fill in your values:

\`\`\`bash
cp .env.example .env
\`\`\`

## Customization

1. Replace contracts in \`contracts/\`
2. Update tests in \`test/\`
3. Modify deployment in \`deploy/\`
4. Update \`hardhat.config.ts\` as needed

## FHEVM Documentation

- [FHEVM Docs](https://docs.zama.ai/fhevm)
- [Hardhat Plugin](https://docs.zama.ai/fhevm/hardhat)
- [Smart Contract Examples](https://docs.zama.ai/fhevm/examples)

## License

BSD-3-Clause-Clear

## Support

For questions and support, visit the Zama community resources.
```

---

## 🔧 .env.example File

```
# Network Configuration
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
PRIVATE_KEY=your_private_key_here

# Optional: Gas reporting
REPORT_GAS=true
COINMARKETCAP_API_KEY=your_api_key_here

# Optional: Contract verification
ETHERSCAN_API_KEY=your_etherscan_key_here
VERIFY=false
```

---

## 📋 .gitignore File

```
# Dependencies
node_modules/
*.lock

# Build artifacts
artifacts/
cache/
dist/
build/

# Hardhat
typechain-types/

# Environment
.env
.env.local
.env.*.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Testing
coverage/
.coverage/

# Temporary
.tmp/
temp/
```

---

## ✅ Template Validation Checklist

Before releasing your base template:

- [ ] All dependencies are compatible with FHEVM
- [ ] `npm install` completes without errors
- [ ] `npm run compile` succeeds
- [ ] `npm run test` passes
- [ ] No hardcoded values or secrets
- [ ] README is clear and complete
- [ ] Example contract is clear and well-commented
- [ ] Example tests demonstrate key patterns
- [ ] TypeScript configuration is correct
- [ ] Hardhat configuration is optimized
- [ ] Gas reporting is available
- [ ] Deployment scripts work
- [ ] Environment variables are documented
- [ ] License is properly declared
- [ ] Directory structure is clean

---

## 🔄 Updating the Template

When FHEVM dependencies are updated:

1. Update `package.json` with new versions
2. Test `npm install` in a clean directory
3. Verify `npm run compile` and `npm run test`
4. Update documentation if needed
5. Test in generated examples

---

## 🎯 Template Best Practices

1. **Minimal & Clean**
   - Only include essential files
   - Remove any unnecessary code
   - Keep file structure simple

2. **Well-Documented**
   - Clear comments in code
   - Comprehensive README
   - Example usage included

3. **Easy to Customize**
   - Comments indicate what to change
   - Configuration is centralized
   - Imports are clear

4. **Production-Ready**
   - Follows best practices
   - Proper error handling
   - Security considerations

5. **Future-Proof**
   - Compatible with upcoming versions
   - Extensible structure
   - Update-friendly design

---

This base template serves as the foundation for all generated examples. Keep it simple, clean, and well-maintained.

