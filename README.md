# 🏛️ DAO Agenda Metadata Repository

## 📋 Overview

A repository for securely managing DAO decision-making metadata with automated validation against on-chain transactions.

### ⭐ Key Features
- **Transparent Governance**: PR-based metadata management
- **Automated Validation**: Schema, signature, and on-chain verification
- **Cryptographic Security**: Signature-based proof of transaction ownership

---

## 🚀 Quick Start

### Installation
```bash
git clone https://github.com/your-org/dao-agenda-metadata-repository.git
cd dao-agenda-metadata-repository
npm install
```

### Basic Usage
```bash
# Validate metadata file
npm run validate -- --pr-title "[Agenda] sepolia - 123 - Test Agenda" data/agendas/sepolia/agenda-123.json

# Run tests
npm test
```

### Create Signature
1. Start web tool: `cd src/sign && python -m http.server 8000`
2. Open `http://localhost:8000` in browser
3. Connect wallet and sign message

---

## 📋 PR Title Format

When submitting pull requests, use the following title format:

- **New Agenda**: `[Agenda] <network> - <id> - <title>`
- **Update Agenda**: `[Agenda Update] <network> - <id> - <title>`

**Examples:**
- `[Agenda] sepolia - 123 - Proposal for Treasury Allocation`
- `[Agenda Update] mainnet - 456 - Updated Governance Parameters`

---

## 📝 Validation Commands

| Command | Description |
|---------|-------------|
| `npm run validate` | Full validation (including on-chain) |
| `npm run validate:local` | Local validation (no RPC calls) |
| `npm run validate:quick` | Schema + format only |
| `npm run validate:schema` | JSON schema validation |
| `npm run validate:signature` | Signature verification |

---

## 📁 Project Structure

```
dao-agenda-metadata-repository/
├── data/agendas/           # Agenda metadata files
│   ├── mainnet/           # Mainnet agendas
│   └── sepolia/           # Sepolia testnet agendas
├── src/                   # Source code
│   ├── validators/        # Validation logic
│   ├── config/           # Configuration
│   └── sign/             # Signature generation tool
├── tests/                # Test files
└── docs/                 # Documentation
```

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [Getting Started](docs/getting-started.md) | Complete setup and usage guide |
| [Configuration Guide](docs/configuration-guide.md) | Configuration system and constants management |
| [Schema Reference](docs/schema-reference.md) | JSON schema documentation |
| [Signature Guide](docs/signature-guide.md) | Signature generation and verification |
| [Validation Guide](docs/validation-guide.md) | Detailed validation process |
| [PR Guide](docs/pr-guide.md) | Pull request submission guidelines |
| [Test Guide](docs/test-guide.md) | Testing guide |
| [FAQ](docs/faq.md) | Frequently asked questions |

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Test results
Test Suites: 3 passed, 3 total
Tests:       50 passed, 50 total
```

---

## 🤝 Contributing

1. Fork the repository
2. Create metadata file using templates in `data/agendas/`
3. Generate signature using web tool
4. Validate locally: `npm run validate:local`
5. Submit PR with correct title format (see PR Title Format section above)

---

## 📄 License

ISC License

