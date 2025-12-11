# Submission Requirements & Guidelines

## 📋 Submission Checklist

Before submitting your project, ensure all items below are completed:

### Repository Structure
- [ ] All code is in a single GitHub repository
- [ ] Repository has clear README with setup instructions
- [ ] All files follow consistent naming conventions
- [ ] No sensitive data or credentials in repository
- [ ] Repository is public and accessible

### Base Template
- [ ] `base-template/` directory with complete Hardhat project
- [ ] `contracts/` folder with example contract(s)
- [ ] `test/` folder with working tests
- [ ] `hardhat.config.ts` properly configured
- [ ] `package.json` with all required dependencies
- [ ] `deploy/` scripts for deployment
- [ ] `README.md` with clear instructions
- [ ] All dependencies compatible with FHEVM v0.9.1+
- [ ] Tests pass: `npm run test`
- [ ] Code compiles: `npm run compile`

### Automation Scripts
- [ ] `create-fhevm-example.ts` script functional
  - [ ] Clones base template correctly
  - [ ] Injects contracts properly
  - [ ] Generates tests automatically
  - [ ] Creates configuration files
  - [ ] Generates README for example
  - [ ] Error handling with clear messages

- [ ] `create-fhevm-category.ts` script functional
  - [ ] Creates multi-example projects
  - [ ] Includes all examples from category
  - [ ] Proper file structure maintained
  - [ ] Configuration updated correctly

- [ ] `generate-docs.ts` script functional
  - [ ] Extracts contract code
  - [ ] Processes test files
  - [ ] Creates markdown files
  - [ ] Updates SUMMARY.md
  - [ ] GitBook-compatible output

### Example Implementations

**Minimum Requirements (12+ examples):**

Basic Examples:
- [ ] Simple FHE Counter
- [ ] FHE Addition (FHE.add)
- [ ] FHE Subtraction (FHE.sub)
- [ ] FHE Equality Comparison (FHE.eq)
- [ ] Single Value Encryption
- [ ] Multiple Value Encryption
- [ ] User Decrypt Single Value
- [ ] User Decrypt Multiple Values

Access Control:
- [ ] Access Control Fundamentals
- [ ] FHE.allow Usage
- [ ] FHE.allowThis() Pattern

Anti-patterns:
- [ ] View Functions with Encrypted Values
- [ ] Missing FHE.allowThis() Permissions
- [ ] Handle Lifecycle Errors

Advanced (Recommended):
- [ ] Blind Auction
- [ ] OpenZeppelin ERC7984 Example

**Each Example Must Include:**
- [ ] Working Solidity contract
- [ ] Comprehensive test file
- [ ] Clear code comments
- [ ] JSDoc/TSDoc annotations
- [ ] Generated README
- [ ] Documentation file

### Test Coverage
- [ ] All examples have working tests
- [ ] Tests pass: `npm run test` in each generated repo
- [ ] Tests include success cases (✅ markers)
- [ ] Tests include failure cases (❌ markers)
- [ ] Tests demonstrate correct patterns
- [ ] Tests demonstrate anti-patterns
- [ ] Edge cases covered
- [ ] Error messages are clear

### Documentation
- [ ] `SUMMARY.md` GitBook index file
- [ ] Individual `.md` file for each example
- [ ] Installation and setup guide
- [ ] Quick start guide
- [ ] API documentation
- [ ] Troubleshooting section
- [ ] Common mistakes section
- [ ] Best practices guide
- [ ] Category organization clear

### Developer Guide
- [ ] Instructions for adding new examples
- [ ] Dependency update guide
- [ ] Documentation regeneration instructions
- [ ] Testing procedures
- [ ] Pattern explanations
- [ ] Common issues and solutions
- [ ] Version upgrade guide

### Quality Standards

**Code Quality:**
- [ ] Code follows Solidity style guide
- [ ] Tests follow JavaScript/TypeScript conventions
- [ ] No unused imports or variables
- [ ] Clear variable and function names
- [ ] Consistent indentation and formatting
- [ ] Comments explain "why" not "what"
- [ ] No console.log or debug code

**Security:**
- [ ] No hardcoded secrets or credentials
- [ ] Proper error handling
- [ ] Input validation where needed
- [ ] Safe contracts for examples
- [ ] Security best practices demonstrated
- [ ] No vulnerable patterns in examples

**Performance:**
- [ ] Efficient contract implementations
- [ ] Reasonable gas usage
- [ ] Quick test execution
- [ ] Fast documentation generation
- [ ] Efficient automation scripts

**Compatibility:**
- [ ] Compatible with FHEVM v0.9.1+
- [ ] Works with Hardhat 10.0+
- [ ] Node.js 18+ support
- [ ] Cross-platform (Windows, macOS, Linux)
- [ ] No platform-specific code
- [ ] All dependencies updated

### Demonstration Video
**MANDATORY - All submissions require a video**

Video Requirements:
- [ ] Duration: 5-15 minutes recommended
- [ ] Clear audio and video quality
- [ ] Screen recording of your development environment
- [ ] Shows project setup/installation
- [ ] Demonstrates automation script execution
- [ ] Shows generated example repository
- [ ] Runs tests successfully
- [ ] Shows documentation rendering
- [ ] Explains key features and innovations
- [ ] Demonstrates your unique contributions
- [ ] Video hosted on accessible platform (YouTube, Vimeo, etc.)
- [ ] Video link provided in submission

**Video Content Checklist:**
- [ ] Environment setup and dependencies
- [ ] Repository structure overview
- [ ] Base template explanation
- [ ] `create-fhevm-example` script demo
- [ ] `create-fhevm-category` script demo
- [ ] Generated repository walkthrough
- [ ] Tests execution and results
- [ ] Documentation viewing
- [ ] Code quality examples
- [ ] Error handling demonstration
- [ ] Feature highlights
- [ ] Future enhancements (if any)

---

## 📦 Submission Package Contents

Your final submission should include:

```
your-fhevm-submission/
├── README.md (comprehensive setup guide)
├── base-template/
│   ├── contracts/
│   ├── test/
│   ├── hardhat.config.ts
│   ├── package.json
│   ├── deploy/
│   └── README.md
├── contracts/
│   ├── basic/
│   │   ├── FHECounter.sol
│   │   ├── FHEAdd.sol
│   │   └── ...
│   ├── access-control/
│   │   └── ...
│   ├── anti-patterns/
│   │   └── ...
│   └── advanced/
│       └── ...
├── test/
│   ├── basic/
│   │   └── ...
│   └── ...
├── examples/
│   ├── SUMMARY.md
│   ├── basic/
│   │   ├── fhe-counter.md
│   │   └── ...
│   └── ...
├── scripts/
│   ├── create-fhevm-example.ts
│   ├── create-fhevm-category.ts
│   ├── generate-docs.ts
│   ├── config.ts
│   └── README.md
├── docs/
│   ├── DEVELOPER_GUIDE.md
│   ├── PATTERNS.md
│   ├── TROUBLESHOOTING.md
│   └── BEST_PRACTICES.md
├── package.json
├── tsconfig.json
├── VIDEO_SUBMISSION.md (link to your demo video)
└── LICENSE (BSD-3-Clause-Clear)
```

---

## 📝 README Contents

Your main README should include:

- **Project Title** - Clear, descriptive name
- **Overview** - What this project provides
- **Quick Start** - Installation and first example generation
- **Features** - Key capabilities and innovations
- **Project Structure** - Directory organization
- **Examples List** - All available examples with descriptions
- **Usage Instructions** - How to use automation tools
- **Requirements** - Node.js version, dependencies
- **Testing** - How to run tests
- **Documentation** - How to view documentation
- **Contributing** - Guidelines for adding examples
- **Support** - Links to resources
- **License** - BSD-3-Clause-Clear

---

## 🎬 Video Submission Details

**How to Submit Video:**
1. Record your demonstration
2. Upload to YouTube, Vimeo, or similar platform
3. Make video public or unlisted (provide link)
4. Include video link in your submission
5. Document in `VIDEO_SUBMISSION.md` file

**Video Tips:**
- Use high-resolution screen recording (1080p minimum)
- Speak clearly and pace appropriately
- Use captions or subtitles if possible
- Have backup video in case of playback issues
- Test video link before submission
- Keep background environment professional

---

## ✅ Final Verification Checklist

Before submitting:

```bash
# 1. Test in fresh directory
mkdir test-submission
cd test-submission
git clone <your-repo>
cd <your-project>

# 2. Install dependencies
npm install

# 3. Test base template
cd base-template
npm install
npm run compile
npm run test
cd ..

# 4. Test automation scripts
npm run create-example fhe-counter ../test-output/example
cd ../test-output/example
npm install
npm run compile
npm run test
cd ../../<your-project>

# 5. Test documentation generation
npm run generate-docs --all

# 6. Verify all files are present
# Check for:
# - README.md
# - LICENSE
# - All example contracts
# - All test files
# - All automation scripts
# - Documentation files
# - Developer guide

# 7. Verify no sensitive data
grep -r "PRIVATE_KEY\|SECRET\|PASSWORD" .
# Should return no results
```

---

## 📤 Submission Process

1. **Create GitHub Repository**
   - Make it public
   - Add appropriate .gitignore
   - Include comprehensive README

2. **Prepare Video**
   - Record demonstration
   - Upload to public platform
   - Test accessibility

3. **Final Review**
   - Run verification checklist
   - Verify all deliverables present
   - Test complete workflow

4. **Submit Through Platform**
   - Navigate to competition submission page
   - Fill in submission form
   - Provide GitHub repository link
   - Provide video link
   - Add any additional notes
   - Submit before deadline

5. **Confirmation**
   - Receive submission confirmation
   - Save confirmation details
   - Monitor for judging updates

---

## ⏰ Deadline

**Submission Deadline: December 31, 2025 (23:59 UTC)**

Submissions received after this time will not be accepted. Plan to submit well before the deadline.

---

## 🚫 Common Mistakes to Avoid

- ❌ Forgetting to include demonstration video
- ❌ Not testing in a clean directory
- ❌ Missing base template files
- ❌ Incomplete documentation
- ❌ Non-functional automation scripts
- ❌ Failing tests
- ❌ Using outdated FHEVM version
- ❌ Hardcoded credentials or secrets
- ❌ Repository set to private
- ❌ Poor code quality or no comments
- ❌ Missing error handling
- ❌ Insufficient examples
- ❌ No developer guide
- ❌ Bad video quality

---

## ✨ Tips for a Strong Submission

1. **Quality Over Quantity** - 15 excellent examples beat 30 mediocre ones
2. **Test Thoroughly** - Both success and failure cases
3. **Document Everything** - Clear explanations help judges understand your work
4. **Be Creative** - Innovation in examples or tools earns bonus points
5. **Demonstrate Expertise** - Show deep understanding of FHEVM concepts
6. **Maintain Code** - Tools for updating should be robust
7. **Clear Communication** - Video and documentation should be easy to follow
8. **Go Beyond** - Add features or examples beyond minimum requirements

---

## 📞 Questions & Support

If you have questions:
- Check competition documentation
- Review example projects
- Visit Zama Discord
- Post on Community Forum
- Review FHEVM documentation

---

**Thank you for participating in this competition! We look forward to your innovative contributions to the FHEVM ecosystem. 🚀**

