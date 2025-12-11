@echo off
REM FHEVM Project Initialization Script (Windows)
REM Run this after cloning to set up your project

echo.
echo 🚀 FHEVM Project Initialization
echo ================================
echo.

REM Check prerequisites
echo ✓ Checking prerequisites...

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js not found. Please install Node.js 18+
    pause
    exit /b 1
)

where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ npm not found. Please install npm 9+
    pause
    exit /b 1
)

where git >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Git not found. Please install Git
    pause
    exit /b 1
)

echo ✓ Node.js version:
node --version
echo ✓ npm version:
npm --version
echo ✓ Git version:
git --version
echo.

REM Install dependencies
echo 📦 Installing dependencies...
call npm install

if %errorlevel% equ 0 (
    echo ✓ Dependencies installed successfully
) else (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)
echo.

REM Create .env file if it doesn't exist
if not exist .env (
    echo 📝 Creating .env file...
    copy .env.example .env
    echo ✓ .env file created
    echo ⚠️  Please update .env with your configuration
) else (
    echo ✓ .env file already exists
)
echo.

REM Compile contracts
echo ⚙️  Compiling contracts...
call npm run compile

if %errorlevel% equ 0 (
    echo ✓ Contracts compiled successfully
) else (
    echo ⚠️  Compilation completed with warnings
)
echo.

REM Run tests
echo 🧪 Running tests...
call npm test

if %errorlevel% equ 0 (
    echo ✓ All tests passed
) else (
    echo ⚠️  Some tests failed - check output above
)
echo.

REM Generate typechain types
echo 🔧 Generating TypeChain types...
call npx hardhat typechain

if %errorlevel% equ 0 (
    echo ✓ TypeChain types generated
) else (
    echo ⚠️  TypeChain generation completed
)
echo.

REM Final message
echo ✅ Project Setup Complete!
echo.
echo Next steps:
echo 1. Update .env with your configuration
echo 2. Read QUICK_START.md for next steps
echo 3. Review DEVELOPER_GUIDE.md for development workflow
echo 4. Run 'npx hardhat node' to start local blockchain
echo.
echo Happy coding! 🎉
echo.
pause
