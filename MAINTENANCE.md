# Maintenance & Upgrade Guide

How to maintain and upgrade FHEVM examples as dependencies evolve.

---

## 📋 Regular Maintenance Tasks

### Weekly

- [ ] Check for security updates: `npm audit`
- [ ] Verify tests still pass: `npm test`
- [ ] Review code quality: `npm run lint`

### Monthly

- [ ] Check dependency updates: `npm outdated`
- [ ] Review GitHub issues and discussions
- [ ] Check FHEVM release notes for changes
- [ ] Update documentation if needed

### Quarterly

- [ ] Full dependency audit
- [ ] Performance review and optimization
- [ ] Security review
- [ ] Update examples with new patterns

---

## 🔄 Updating Dependencies

### Check for Updates

```bash
# See which packages have updates
npm outdated

# Check for security vulnerabilities
npm audit
```

**Output Example:**
```
Package                    Current  Wanted  Latest
@fhevm/solidity           0.9.1    0.9.2   0.9.2
@fhevm/hardhat-plugin     0.3.0-1  0.3.0   0.3.0
hardhat                   2.17.0   2.18.0  2.18.0
```

### Update Strategy

**For FHEVM Packages (Critical):**
```bash
# Test with latest
npm install @fhevm/solidity@latest @fhevm/hardhat-plugin@latest

# Run full test suite
npm run compile
npm test

# If tests fail, review breaking changes
# Otherwise, keep the update

# Commit with meaningful message
git add package.json package-lock.json
git commit -m "chore: update FHEVM packages to latest versions"
```

**For Other Dependencies (Regular):**
```bash
# Update all patch and minor versions
npm update

# Or specific package
npm install package-name@latest

# Test before committing
npm test
```

### Handling Breaking Changes

If update causes failures:

**Step 1: Identify the breaking change**
```bash
# Check what changed
npm view @fhevm/solidity CHANGELOG

# Or check GitHub releases
# https://github.com/zama-ai/fhevm/releases
```

**Step 2: Review migration guide**
- Check official FHEVM documentation
- Review example projects
- Check GitHub discussions

**Step 3: Update code**

```solidity
// Example: API change from v0.9.0 to v0.9.2
// ❌ OLD (0.9.0)
euint32 result = FHE.asEuint32(value);

// ✅ NEW (0.9.2) - hypothetical example
euint32 result = FHE.encrypt32(value);
```

**Step 4: Test thoroughly**
```bash
npm run clean
npm install
npm run compile
npm test
```

**Step 5: Update documentation**
- Update version numbers in README
- Document breaking changes
- Add migration notes

---

## 🐛 Bug Fixes

### Reporting Bugs

When you find a bug:

```bash
# Reproduce with minimal example
# Document steps to reproduce
# Check if issue already exists

# File issue on GitHub with:
# 1. Description
# 2. Steps to reproduce
# 3. Expected behavior
# 4. Actual behavior
# 5. Environment info
```

### Applying Bug Fixes

```bash
# If bug fix released
npm update @fhevm/solidity  # or affected package

# Re-run tests
npm test

# If fixed, commit
git commit -m "fix: update to include bug fix for X"
```

---

## 🔐 Security Updates

### Security Vulnerability Found

```bash
# Check vulnerabilities
npm audit

# Output shows vulnerabilities and fixes
# npm audit fix --force (only if necessary)

# Better: Update affected packages
npm install package@latest

# Test
npm test

# Commit
git commit -m "security: update package for vulnerability fix"
```

### Publishing Security Updates

If your project has security issues:

1. **Create private branch**
   ```bash
   git checkout -b security/fix-name
   ```

2. **Fix the issue**
   - Update code
   - Add tests
   - Update documentation

3. **Review and test**
   - Verify fix works
   - Check no new issues
   - Get code review

4. **Publish responsibly**
   - Release security update
   - Add to changelog
   - Notify users

---

## 📚 Documentation Updates

### When to Update Documentation

- [ ] New FHEVM features released
- [ ] Breaking changes in dependencies
- [ ] New best practices discovered
- [ ] User feedback indicates confusion
- [ ] Examples become outdated
- [ ] Version numbers change

### Documentation Update Process

```bash
# 1. Update relevant files
# - README.md
# - PATTERNS.md
# - BEST_PRACTICES.md
# - TROUBLESHOOTING.md

# 2. Update version numbers
# package.json
# README.md
# Examples

# 3. Test examples still work
npm run compile
npm test

# 4. Commit
git add *.md package.json
git commit -m "docs: update for version X.Y.Z"
```

---

## 🚀 Version Management

### Versioning Strategy

Use Semantic Versioning: MAJOR.MINOR.PATCH

- **MAJOR** (1.0.0): Breaking changes
- **MINOR** (1.1.0): New features
- **PATCH** (1.0.1): Bug fixes

### Release Checklist

```
Before Release:
[ ] All tests passing
[ ] Code reviewed
[ ] Documentation updated
[ ] Version number updated in package.json
[ ] CHANGELOG.md updated
[ ] Dependencies verified
[ ] Security audit passed

Release:
[ ] Create git tag: git tag v1.0.0
[ ] Push tag: git push origin v1.0.0
[ ] Create GitHub release
[ ] Publish any affected packages

After Release:
[ ] Announce update
[ ] Monitor for issues
[ ] Be ready to patch if needed
```

### CHANGELOG Format

```markdown
# Changelog

## [1.1.0] - 2025-01-15

### Added
- New example: FHE Voting Contract
- Support for euint64 operations
- Performance optimization guide

### Changed
- Updated FHEVM to 0.9.2
- Improved test structure
- Better documentation

### Fixed
- Bug in permission handling (issue #123)
- Typo in examples

### Deprecated
- Old API patterns (see migration guide)

### Security
- Updated dependencies for security patches
```

---

## 🧪 Testing Strategy for Upgrades

### Before Upgrade

```bash
# Capture baseline
npm test 2>&1 | tee baseline-test-results
npm run test:gas 2>&1 | tee baseline-gas
```

### After Upgrade

```bash
# Run same tests
npm test 2>&1 | tee new-test-results
npm run test:gas 2>&1 | tee new-gas

# Compare results
diff baseline-test-results new-test-results
diff baseline-gas new-gas
```

### Test Suite

Every example should maintain:
- ✅ Success cases
- ❌ Failure cases
- 🔍 Edge cases
- 📊 Gas benchmarks

---

## 📊 Performance Monitoring

### Track Key Metrics

```typescript
// Add to package.json scripts
"test:metrics": "hardhat test --reporter json > metrics.json"
```

Monitor:
- Test execution time
- Gas usage per operation
- Compilation time
- Code coverage

### Performance Regression Detection

```bash
# Generate report
npm run test:metrics

# Compare with previous
jq '.stats' metrics.json
```

---

## 🔍 Quality Assurance

### Pre-Commit Checklist

```bash
#!/bin/bash
# Add to .git/hooks/pre-commit

npm run compile || exit 1
npm run lint || exit 1
npm test || exit 1
npm run type-check || exit 1

echo "✅ All checks passed!"
```

### Continuous Integration

Example GitHub Actions workflow:

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run compile
      - run: npm run lint
      - run: npm test
      - run: npm run type-check
```

---

## 📈 Scaling Maintenance

### Single Example

```
1. Update dependencies
2. Run tests
3. Update documentation
4. Commit and tag
```

### Multiple Examples

Use automation:

```bash
#!/bin/bash
# update-all-examples.sh

for dir in examples/*/; do
    echo "Updating $dir"
    cd "$dir"
    npm install
    npm test || { echo "FAILED: $dir"; exit 1; }
    cd ../..
done

echo "All examples updated successfully"
```

### Large Repository

Consider:
- Monorepo management (lerna, nx)
- Shared dependencies
- Automated testing
- Release automation

---

## ⚠️ Common Maintenance Issues

### Issue: Dependency Hell

**Problem:** Conflicting dependency versions

**Solution:**
```bash
# Clean start
rm -rf node_modules package-lock.json
npm install

# Use exact versions
npm install --save-exact @fhevm/solidity@0.9.1
```

### Issue: Outdated Examples

**Problem:** Examples don't work with new FHEVM version

**Solution:**
```bash
# For each example:
1. Update Solidity syntax if needed
2. Update API calls if needed
3. Update test structure if needed
4. Verify tests pass
5. Document changes
```

### Issue: Breaking Changes Across Examples

**Problem:** One update breaks multiple examples

**Solution:**
```bash
# 1. Create feature branch
git checkout -b upgrade/fhevm-0.10.0

# 2. Update all examples
for example in examples/*/; do
    cd "$example"
    # Make necessary changes
    npm test
    cd ../..
done

# 3. Single PR for all updates
git commit -m "chore: upgrade all examples for FHEVM 0.10.0"
git push origin upgrade/fhevm-0.10.0
# Create PR
```

---

## 📞 Support Resources

### Documentation
- FHEVM Docs: https://docs.zama.ai/fhevm
- Hardhat Docs: https://hardhat.org
- OpenZeppelin Docs: https://docs.openzeppelin.com

### Community
- Discord: https://discord.com/invite/zama
- Forum: https://www.zama.ai/community
- GitHub Issues: https://github.com/zama-ai/fhevm/issues

### Tools
- npm-check-updates: `npx npm-check-updates`
- Snyk: https://snyk.io (security scanning)
- Dependabot: GitHub integration for automatic updates

---

## 📋 Maintenance Checklist

**Monthly:**
```
[ ] npm audit
[ ] npm test
[ ] Check FHEVM releases
[ ] Review GitHub issues
```

**With Each FHEVM Release:**
```
[ ] Read release notes
[ ] Update all examples
[ ] Run full test suite
[ ] Update documentation
[ ] Test in fresh environment
[ ] Commit changes
```

**Quarterly:**
```
[ ] Full dependency audit
[ ] Security review
[ ] Performance analysis
[ ] Documentation review
[ ] Community feedback check
```

---

## Summary

Effective maintenance ensures:
- ✅ Examples stay working with latest FHEVM
- ✅ Security vulnerabilities fixed promptly
- ✅ Documentation stays accurate
- ✅ Best practices updated
- ✅ Community satisfied
- ✅ Code quality maintained

**Invest in maintenance for long-term project health!**
