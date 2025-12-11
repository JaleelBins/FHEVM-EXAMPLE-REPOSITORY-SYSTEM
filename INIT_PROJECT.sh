#!/bin/bash

# FHEVM Project Initialization Script
# Run this after cloning to set up your project

set -e

echo "🚀 FHEVM Project Initialization"
echo "================================"
echo ""

# Check prerequisites
echo "✓ Checking prerequisites..."

if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 18+"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm not found. Please install npm 9+"
    exit 1
fi

if ! command -v git &> /dev/null; then
    echo "❌ Git not found. Please install Git"
    exit 1
fi

echo "✓ Node.js version: $(node --version)"
echo "✓ npm version: $(npm --version)"
echo "✓ Git version: $(git --version)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✓ Dependencies installed successfully"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi
echo ""

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "✓ .env file created"
    echo "⚠️  Please update .env with your configuration"
else
    echo "✓ .env file already exists"
fi
echo ""

# Compile contracts
echo "⚙️  Compiling contracts..."
npm run compile

if [ $? -eq 0 ]; then
    echo "✓ Contracts compiled successfully"
else
    echo "⚠️  Compilation completed with warnings"
fi
echo ""

# Run tests
echo "🧪 Running tests..."
npm test

if [ $? -eq 0 ]; then
    echo "✓ All tests passed"
else
    echo "⚠️  Some tests failed - check output above"
fi
echo ""

# Generate typechain types
echo "🔧 Generating TypeChain types..."
npx hardhat typechain

if [ $? -eq 0 ]; then
    echo "✓ TypeChain types generated"
else
    echo "⚠️  TypeChain generation completed"
fi
echo ""

# Final verification
echo "✅ Project Setup Complete!"
echo ""
echo "Next steps:"
echo "1. Update .env with your configuration"
echo "2. Read QUICK_START.md for next steps"
echo "3. Review DEVELOPER_GUIDE.md for development workflow"
echo "4. Run 'npx hardhat node' to start local blockchain"
echo ""
echo "Happy coding! 🎉"
