# ❓ Frequently Asked Questions (FAQ)

> **Common questions and solutions for DAO agenda metadata management**

---

## 🔧 General Questions

### Q1: What is this repository for?
**A**: This repository manages metadata for DAO agenda proposals. It provides:
- **Metadata Storage**: Structured storage of agenda information
- **Validation System**: Automated verification of metadata accuracy
- **On-chain Verification**: Ensures metadata matches actual blockchain transactions
- **Signature Security**: Cryptographic proof of metadata authenticity

### Q2: Who can submit metadata?
**A**: Only the wallet address that submitted the original on-chain transaction can create or update metadata for that agenda. This is verified through cryptographic signatures.

### Q3: What networks are supported?
**A**: Currently supports:
- **Ethereum Mainnet** (`mainnet`)
- **Sepolia Testnet** (`sepolia`)

---

## 📝 Metadata Creation

### Q4: How do I create metadata for a new agenda?
**A**: Follow these steps:
1. Use `data/agendas/example-agenda.json` as template
2. Copy to appropriate network directory: `data/agendas/<network>/agenda-<id>.json`
3. Fill in all required fields
4. Generate signature using the web tool
5. Validate locally and submit PR

### Q5: How do I update existing agenda metadata?
**A**: Follow these steps:
1. Use `data/agendas/example-agenda-update.json` as template
2. Keep original `createdAt` timestamp
3. Add `updatedAt` with current timestamp
4. Generate new signature with "update" action
5. Use `[Agenda Update]` in PR title

### Q6: What's the difference between creation and update templates?
**A**:
- **Creation template** (`example-agenda.json`): For new agendas, includes only `createdAt`
- **Update template** (`example-agenda-update.json`): For updates, includes both `createdAt` and `updatedAt`, with modified title and description

---

## 🔐 Signature Generation

### Q7: How do I generate a signature?
**A**: Use the web-based signature tool:
```bash
cd src/sign
python -m http.server 8000
# Open http://localhost:8000 in browser
```
1. Connect the wallet that submitted the transaction
2. Enter agenda ID and transaction hash
3. Select "Create" or "Update" action
4. Sign the message in MetaMask
5. Copy the generated signature

### Q8: Why do signatures expire after 1 hour?
**A**: This security measure prevents:
- **Signature Replay Attacks**: Old signatures cannot be reused
- **Stale Metadata**: Ensures metadata is created promptly after transaction
- **Time-based Security**: Adds temporal validation layer

### Q9: What if my signature expires?
**A**: Simply generate a new signature:
1. Update the timestamp in your metadata file
2. Generate new signature with updated timestamp
3. Replace old signature in metadata file
4. Re-validate and submit

---

## 🔍 Validation Process

### Q10: What validation steps are performed?
**A**: The system performs 6 validation steps:
1. **Schema Validation**: JSON structure and required fields
2. **Format Validation**: File paths, naming conventions
3. **PR Title Validation**: Consistency with metadata content
4. **Time Validation**: Signature within 1-hour window
5. **Signature Validation**: Cryptographic verification
6. **Transaction Validation**: On-chain data consistency

### Q11: How does transaction validation work?
**A**: The system validates the transaction structure:
```
TON.approveAndCall(spender, amount, data)
  └── data parameter contains:
      ├── address[] targets    (matches actions[].contractAddress)
      ├── uint128 value
      ├── uint128 deadline
      ├── bool emergency
      ├── bytes[] calldatas   (matches actions[].calldata)
      └── string memo         (matches snapshotUrl/discourseUrl)
```

### Q12: What is calldata validation?
**A**: Calldata validation ensures that:
- `actions[].contractAddress` array matches transaction's address[] parameter
- `actions[].calldata` array matches transaction's bytes[] parameter
- `snapshotUrl` or `discourseUrl` matches transaction's memo field (new version only)
- Array order and content are identical

---

## 🚨 Common Errors

### Q13: "Signature does not match expected address"
**Cause**: Using wrong wallet for signing
**Solution**:
1. Check which wallet submitted the original transaction
2. Use that exact wallet to generate signature
3. Verify `creator.address` matches transaction sender

### Q14: "Signature has expired"
**Cause**: Signature created more than 1 hour ago
**Solution**: Generate a new signature. See [Signature Guide](./signature-guide.md) for detailed instructions.

### Q15: "PR title does not match expected format"
**Cause**: Incorrect PR title format
**Solution**: Use correct format. See [PR Guide](./pr-guide.md) for detailed format requirements.

### Q16: "Actions do not match transaction calldata"
**Cause**: Mismatch between metadata actions and transaction data
**Solution**:
1. Verify `contractAddress` array matches transaction addresses
2. Verify `calldata` array matches transaction calldata
3. Check array order is identical
4. Ensure no missing or extra actions

### Q17: "Transaction not found"
**Cause**: Invalid transaction hash or network mismatch
**Solution**:
1. Verify transaction hash is correct (0x + 64 hex characters)
2. Ensure transaction is confirmed on blockchain
3. Check network matches (mainnet/sepolia)
4. Wait for transaction confirmation if recently submitted

---

## 📁 File Management

### Q18: Where should I place my metadata file?
**A**: Place files in network-specific directories:
- Mainnet: `data/agendas/mainnet/agenda-<id>.json`
- Sepolia: `data/agendas/sepolia/agenda-<id>.json`

### Q19: Can I submit multiple agendas in one PR?
**A**: No, each PR should contain exactly one agenda file. This ensures:
- Clear review process
- Isolated validation
- Easier conflict resolution
- Better change tracking

### Q20: What if agenda file already exists?
**A**:
- For **new agenda**: Use different ID or submit update instead
- For **update**: Use `[Agenda Update]` in PR title
- Check if you're the original creator before updating

---

## 🔧 Technical Issues

### Q21: Validation is slow, how can I speed it up?
**A**: Use appropriate validation scripts:
- **Development**: `npm run validate:quick` (schema + format only)
- **Local testing**: `npm run validate:local` (no RPC calls)
- **Final check**: `npm run validate` (full validation)

### Q22: Can I use custom RPC endpoints?
**A**: Yes, see [Configuration Guide](./configuration-guide.md) for environment variable setup.

### Q23: How do I debug validation failures?
**A**: Use individual validation scripts:
```bash
npm run validate:schema -- --pr-title "..." file.json
npm run validate:signature -- --pr-title "..." file.json
npm run validate:transaction -- --pr-title "..." file.json
```

---

## 🌐 Network and RPC

### Q24: What are the default RPC endpoints?
**A**:
- **Mainnet**: `https://ethereum.drpc.org`
- **Sepolia**: `https://sepolia.drpc.org`

### Q25: What if RPC endpoint is down?
**A**:
1. Use `validate:local` to skip transaction validation
2. Set custom RPC endpoint via environment variables
3. Try again later when endpoint recovers

---

## 📚 Development

### Q26: How do I run tests?
**A**:
```bash
npm test                    # Run all tests
npm test -- --watch        # Watch mode
npm test -- specific.test.ts  # Run specific test
```

### Q27: How do I contribute to the codebase?
**A**:
1. Fork the repository
2. Create feature branch
3. Make changes and add tests
4. Ensure all tests pass
5. Submit PR with clear description

### Q28: Where is the validation logic implemented?
**A**: Key files:
- `src/validators/agenda-validator.ts` - Core validation functions
- `src/validators/validate-metadata.ts` - Main validation script
- `src/types/agenda-metadata.ts` - Schema definitions
- `src/config/` - Configuration system (constants, ABI, RPC)
- `tests/` - Test files

### Q29: How is the configuration system organized?
**A**: The project uses a centralized configuration system:
- **`src/config/constants.ts`**: Application constants (timeouts, validation patterns, error messages)
- **`src/config/abi-loader.ts`**: Contract ABI management and loading
- **`src/config/abi/`**: Contract ABI JSON files
- **`src/config/rpc.ts`**: RPC endpoint configuration with environment variable support
- **`src/config/signature-messages.ts`**: Signature message templates

This eliminates hardcoded values and makes the system more maintainable. See [Configuration Guide](./configuration-guide.md) for details.

### Q30: Can I customize validation timeouts or patterns?
**A**: Yes, modify the constants in `src/config/constants.ts`:
```typescript
export const TIME_CONSTANTS = {
  SIGNATURE_VALID_DURATION: 60 * 60 * 1000, // 1 hour
  TEST_TIMEOUT: 30000, // 30 seconds
} as const;

export const VALIDATION_CONSTANTS = {
  PATTERNS: {
    SIGNATURE: /^0x[a-fA-F0-9]{130}$/,
    ADDRESS: /^0x[a-fA-F0-9]{40}$/,
    TRANSACTION_HASH: /^0x[a-fA-F0-9]{64}$/,
    // ... other patterns
  }
} as const;
```

### Q31: How do I add support for a new contract ABI?
**A**: Follow these steps:
1. Add ABI JSON file to `src/config/abi/your-contract.json`
2. Use `ABILoader.getInterface('your-contract')` to load it
3. The ABI loader handles caching and interface creation automatically

Example:
```typescript
import { ABILoader } from '../config/abi-loader';
const myInterface = ABILoader.getInterface('your-contract');
const eventTopic = ABILoader.getEventTopicHash('your-contract', 'YourEvent');
```

---

## 🔗 Integration

### Q32: Can I integrate this validation into my own tools?
**A**: Yes, you can import validation functions:
```typescript
import { AgendaValidator } from './src/validators/agenda-validator';
import { validateMetadata } from './src/validators/validate-metadata';
```

### Q33: Is there an API for validation?
**A**: Currently CLI-only, but you can run validation programmatically:
```bash
node --import 'data:text/javascript,import { register } from "node:module"; import { pathToFileURL } from "node:url"; register("ts-node/esm", pathToFileURL("./"));' src/validators/validate-metadata.ts --pr-title "..." file.json
```

---

## 🆘 Getting Help

### Q34: Where can I get more help?
**A**:
- **Documentation**: Check [docs/](../docs/) directory
- **Configuration Guide**: See [Configuration Guide](./configuration-guide.md) for system setup
- **Issues**: Create GitHub issue for bugs
- **Discussions**: Use GitHub Discussions for questions
- **Code**: Review source code for implementation details

### Q35: How do I report bugs?
**A**:
1. Check existing issues first
2. Create new issue with:
   - Clear description
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details (Node.js version, OS, etc.)

---

**💡 Still have questions? Create an issue on GitHub or check the other documentation files!**