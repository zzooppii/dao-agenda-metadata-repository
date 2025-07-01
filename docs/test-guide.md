# 🧪 Test Guide

> **How to run tests to verify system functionality**

## 🚀 Running Tests

### Basic Test Execution
```bash
npm install
npm test
```

### Test Results
```
Test Suites: 3 passed, 3 total
Tests:       50 passed, 50 total
Snapshots:   0 total
Time:        3.4s
```

---

## 📊 What Gets Tested

### Core Validation
- ✅ **Schema Validation**: JSON structure and required fields
- ✅ **Signature Verification**: Cryptographic signature validation
- ✅ **Transaction Validation**: On-chain data consistency
- ✅ **Time Validation**: Signature expiry and time constraints
- ✅ **Format Validation**: File paths, naming, and data formats

### Integration Testing
- ✅ **Real Blockchain Data**: Tests with actual Sepolia transactions
- ✅ **End-to-End Flows**: Complete validation process testing
- ✅ **Error Scenarios**: All common error cases covered

---

## 🔍 Running Specific Tests

### Individual Test Files
```bash
# Schema and validation tests
npm test agenda-validator.test.ts

# Type definition tests
npm test agenda-metadata.test.ts

# Utility function tests
npm test validation-helpers.test.ts
```

### Test Patterns
```bash
# Run only schema-related tests
npm test -- --testNamePattern="schema"

# Run only signature tests
npm test -- --testNamePattern="signature"

# Watch mode for development
npm test -- --watch
```

---

## ⚡ Performance

> *Times measured on macOS with Node.js 20. Actual performance may vary by system.*

- **Full Test Suite**: ~2-3 seconds
- **Schema Tests**: 1-5ms (fastest)
- **Signature Tests**: 10-60ms (medium)
- **Integration Tests**: ~400ms (depends on network)

---

## 🔧 Troubleshooting

### Common Issues

**Tests fail with network errors:**
```bash
# Check RPC connectivity
npm test -- --testNamePattern="schema"  # Run offline tests only
```

**Slow test execution:**
```bash
# Run tests in parallel
npm test -- --maxWorkers=4
```

**Specific test failures:**
```bash
# Run with verbose output
npm test -- --verbose
```

---

## 📋 Test Coverage Summary

| Component | Tests | Coverage |
|-----------|-------|----------|
| Schema Validation | 18 tests | ✅ Complete |
| Signature System | 9 tests | ✅ Complete |
| Transaction Validation | 13 tests | ✅ Complete |
| Utility Functions | 10 tests | ✅ Complete |
| **Total** | **50 tests** | **✅ 100%** |

---

**💡 All tests must pass before submitting PRs. Run `npm test` to verify your changes!**