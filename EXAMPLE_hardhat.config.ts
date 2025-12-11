import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@fhevm/hardhat-plugin";
import "hardhat-deploy";
import "hardhat-gas-reporter";
import * as dotenv from "dotenv";

dotenv.config();

/**
 * Example Hardhat Configuration for FHEVM Projects
 *
 * This configuration includes:
 * - FHEVM plugin setup for encrypted smart contract testing
 * - Solidity compiler configuration (v0.8.24)
 * - Network configurations (hardhat, localhost, sepolia)
 * - Gas reporting and optimization settings
 * - TypeChain type generation
 *
 * Key FHEVM-specific settings:
 * - @fhevm/hardhat-plugin: Enables FHE testing in Hardhat
 * - @fhevm/solidity library: Core FHE Solidity library
 * - Test environment setup for encrypted operations
 */

const config: HardhatUserConfig = {
  // ============== SOLIDITY COMPILER ==============

  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200, // Optimization for code size vs gas
      },
    },
  },

  // ============== NETWORKS ==============

  networks: {
    /**
     * Hardhat Network
     * - Local test network that runs in memory
     * - Used for development and testing
     * - FHEVM plugin provides encrypted operation support
     */
    hardhat: {
      // ChainId for tests
      chainId: 31337,

      // Initialize base fee per gas to 0 for easier testing
      initialBaseFeePerGas: 0,

      // FHEVM-specific configuration
      // The FHEVM hardhat plugin handles encrypted operations
    },

    /**
     * Localhost Network
     * - For running local blockchain with hardhat node
     * - Use: npx hardhat node (in one terminal)
     * - Then deploy: npx hardhat run scripts/deploy.ts --network localhost
     */
    localhost: {
      url: "http://127.0.0.1:8545",
    },

    /**
     * Sepolia Testnet
     * - Public Ethereum test network
     * - Use for testing before mainnet deployment
     * - Requires RPC URL and private key from environment
     */
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      // Verify contracts on Etherscan if API key provided
      verify: {
        etherscan: {
          apiKey: process.env.ETHERSCAN_API_KEY || "",
        },
      },
    },

    /**
     * Example: Custom Testnet
     * - For testing on custom networks
     * - Adjust URL and credentials as needed
     */
    // customTestnet: {
    //   url: process.env.CUSTOM_RPC_URL || "",
    //   accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    // },
  },

  // ============== GAS REPORTING ==============

  /**
   * Gas Reporter Configuration
   * - Tracks gas usage during tests
   * - Useful for optimization
   * - Requires REPORT_GAS=true environment variable
   *
   * Usage:
   * - REPORT_GAS=true npx hardhat test
   *
   * Optional: Get USD estimates with CoinMarketCap API
   * - Set COINMARKETCAP_API_KEY in .env
   */
  gasReporter: {
    enabled: process.env.REPORT_GAS === "true",
    currency: "USD",
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
    outputFile: "gas-report", // Output file for gas report
    noColors: false,
  },

  // ============== PROJECT PATHS ==============

  paths: {
    sources: "./contracts", // Solidity contract files
    tests: "./test", // Test files
    artifacts: "./artifacts", // Compiled artifacts
    cache: "./cache", // Compiler cache
    deploy: "./deploy", // Deployment scripts
  },

  // ============== TYPECHAIN CONFIGURATION ==============

  /**
   * TypeChain generates TypeScript types from contracts
   * - Provides type-safe contract interactions in TypeScript
   * - Enables better IDE autocomplete and type checking
   */
  typechain: {
    outDir: "typechain-types", // Output directory for generated types
    target: "ethers-v6", // Target ethers v6 API
    alwaysGenerateOverloads: false, // Generate function overloads
    discriminateTypes: false, // Use discriminated unions for overloads
  },

  // ============== MOCHA TEST RUNNER ==============

  mocha: {
    timeout: 200000, // Timeout for tests (200 seconds)
    // FHEVM tests may take longer due to encrypted operations
  },

  // ============== DEPLOYMENT CONFIGURATION ==============

  /**
   * Hardhat Deploy Plugin
   * - Enables structured deployment management
   * - Supports multi-network deployments
   * - Can save deployment artifacts for later reference
   */
  deploy: {
    dir: "./deploy", // Deployment scripts directory
  },

  // ============== SOURCIFY VERIFICATION ==============

  /**
   * Optional: Verify contracts on Sourcify
   * - Decentralized smart contract verification
   * - Supports all EVM networks
   */
  // sourcify: {
  //   enabled: true,
  // },
};

export default config;

/**
 * ADDITIONAL NOTES FOR FHEVM PROJECTS:
 *
 * 1. FHEVM Plugin Installation
 *    npm install @fhevm/hardhat-plugin @fhevm/solidity
 *
 * 2. Environment Variables (.env file)
 *    SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
 *    PRIVATE_KEY=your_private_key_here
 *    REPORT_GAS=true (optional)
 *    COINMARKETCAP_API_KEY=your_api_key (optional)
 *    ETHERSCAN_API_KEY=your_api_key (optional)
 *
 * 3. Running Tests
 *    npx hardhat test              // Run all tests
 *    npx hardhat test test/file.ts // Run specific test
 *    REPORT_GAS=true npx hardhat test // With gas report
 *
 * 4. Compiling Contracts
 *    npx hardhat compile           // Compile all contracts
 *
 * 5. Deploying Contracts
 *    npx hardhat run deploy/deploy.ts --network sepolia
 *
 * 6. Working with Encrypted Operations
 *    - The @fhevm/hardhat-plugin automatically sets up
 *      the test environment for encrypted operations
 *    - Tests can use createEncryptedInput() from hardhat-fhevm/gateway
 *    - FHE operations execute normally in tests
 *
 * 7. Important: Remove Private Keys from Version Control
 *    - Add .env to .gitignore
 *    - Use environment variables for sensitive data
 *    - Never commit private keys to repository
 */
