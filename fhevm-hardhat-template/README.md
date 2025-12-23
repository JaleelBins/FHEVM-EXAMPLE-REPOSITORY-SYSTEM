# FHEVM Hardhat Template

This is a base template for developing FHEVM (Fully Homomorphic Encryption Virtual Machine) smart contracts using Hardhat.

## Quick Start

### Installation

```bash
npm install
```

### Compilation

```bash
npm run compile
```

### Testing

```bash
npm run test
```

### Deployment

```bash
# Local network
npm run deploy:localhost

# Sepolia testnet
npx hardhat vars set MNEMONIC
npx hardhat vars set INFURA_API_KEY
npm run deploy:sepolia
```

## Project Structure

```
fhevm-hardhat-template/
├── contracts/          # Smart contracts
├── test/              # Test files
├── deploy/            # Deployment scripts
├── tasks/             # Hardhat tasks
├── scripts/           # Utility scripts
├── hardhat.config.ts  # Hardhat configuration
├── package.json       # Dependencies
└── tsconfig.json      # TypeScript configuration
```

## Available Scripts

- `npm run compile` - Compile contracts
- `npm run test` - Run tests
- `npm run coverage` - Generate coverage report
- `npm run lint` - Lint code
- `npm run prettier:write` - Format code
- `npm run deploy:localhost` - Deploy to local network
- `npm run deploy:sepolia` - Deploy to Sepolia testnet
- `npm run verify:sepolia` - Verify contracts on Etherscan

## Requirements

- Node.js >= 20
- npm >= 7.0.0

## License

BSD-3-Clause-Clear License

## More Information

- [FHEVM Documentation](https://docs.zama.ai/fhevm)
- [Hardhat Documentation](https://hardhat.org/docs)
- [Zama Website](https://www.zama.ai)
