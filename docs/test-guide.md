# 🧪 Test Guide

> **Testing execution guide**

## 🚀 Running Tests

### Basic Test Execution
```bash
npm install
npm test
```


### Running Individual Test Files
```bash
# Run only Agenda Validator tests
npm test agenda-validator.test.ts

# Run only Type Definition tests
npm test agenda-metadata.test.ts

# Run only Utility tests
npm test validation-helpers.test.ts
```

---

## 📁 Test Structure

### 1. Agenda Validator Tests (`tests/validators/agenda-validator.test.ts`)
**29 test cases**
- ✅ Schema validation (Zod-based)
- ✅ Signature timestamp validation
- ✅ Signature verification and message generation
- ✅ Transaction sender validation
- ✅ Event-based agenda ID validation
- ✅ Mock event creation and validation
- ✅ Real blockchain integration tests
- ✅ Error case handling

### 2. Type Definition Tests (`tests/types/agenda-metadata.test.ts`)
**11 test cases**
- ✅ Schema type validation
- ✅ Required field validation
- ✅ Optional field validation
- ✅ Format validation

### 3. Utility Function Tests (`tests/utils/validation-helpers.test.ts`)
**10 test cases**
- ✅ Helper function validation
- ✅ Utility function edge cases
- ✅ Error handling

---

## 📊 Test Coverage

### Current Coverage
- **Total Tests**: 50
- **Test Files**: 3
- **Core Functionality**: 100% covered

### Test Files Breakdown
1. **agenda-validator.test.ts**: 29 tests (signature, schema, transaction validation, integration tests)
2. **agenda-metadata.test.ts**: 11 tests (schema type validation)
3. **validation-helpers.test.ts**: 10 tests (utility functions)

### Coverage Areas
- ✅ **Schema Validation**: All field types and constraints
- ✅ **Signature Validation**: Message generation and verification
- ✅ **Transaction Validation**: On-chain data consistency
- ✅ **Event Validation**: AgendaCreated event parsing and validation
- ✅ **Integration Tests**: Real blockchain data validation
- ✅ **Error Handling**: All error scenarios covered
- ✅ **Edge Cases**: Boundary conditions and invalid inputs

---

## 🚀 Performance

### Test Execution Speed
- **Schema Tests**: ~100ms
- **Signature Tests**: ~500ms
- **Integration Tests**: ~2-5s (depends on RPC)
- **Full Suite**: ~3-4s

### Optimization Tips
```bash
# Run tests in parallel
npm test -- --maxWorkers=4

# Run specific test patterns
npm test -- --testNamePattern="schema"

# Watch mode for development
npm test -- --watch
```

---

## 🔄 Continuous Integration

### GitHub Actions Integration
Tests run automatically on:
- Pull requests
- Push to main branch
- Scheduled runs (daily)

### Test Commands in CI
```yaml
- name: Run tests
  run: |
    npm install
    npm test
```

---

## 🧪 Test Categories

### Unit Tests
- Schema validation logic
- Signature generation and verification
- Utility functions
- Error handling

### Integration Tests
- Real blockchain transaction validation
- End-to-end validation flows
- RPC provider interactions

### Mock Tests
- Event parsing with mock data
- Transaction validation with mock responses
- Error scenarios simulation

---

**💡 Need help with testing? Check the test files in the `tests/` directory for examples and patterns!**