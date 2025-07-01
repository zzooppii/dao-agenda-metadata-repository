# 🏛️ DAO Agenda Metadata Repository

## 📋 Overview

**A secure, transparent, and automated system for voluntary DAO agenda metadata registration with cryptographic verification and on-chain validation.**

This repository enables proposers to voluntarily register their on-chain agenda metadata to facilitate DAO committee voting. Proposers who want their proposals to be voted on by DAO committee members must register detailed metadata here. This creates a self-regulated, transparent governance system where disclosure is voluntary but necessary for community participation.

### 🎯 Purpose

**Why This Repository Exists:**
- **Voluntary Transparency**: Enable proposers to voluntarily register their on-chain agendas for DAO committee voting
- **Community-Driven Governance**: Proposers who want public voting must register metadata to enable committee member participation
- **Self-Regulated Transparency**: Foster voluntary disclosure of proposal details for transparent DAO governance
- **Data Integrity**: Ensure metadata accuracy through cryptographic proofs and on-chain verification
- **Audit Trail**: Maintain immutable records of voluntarily disclosed governance activities

### ⭐ Key Features

#### 🔒 **Security First**
- **Cryptographic Signatures**: Only transaction submitters can create/update metadata
- **Time-based Security**: 1-hour signature validity prevents replay attacks
- **On-chain Verification**: Automatic validation against blockchain data
- **Multi-layer Validation**: 6-step verification process ensures data accuracy

#### 🤖 **Automated Validation**
- **Schema Validation**: Ensures proper JSON structure and required fields
- **Transaction Matching**: Verifies metadata matches actual on-chain data
- **Calldata Verification**: Confirms action details match transaction parameters
- **Address Consistency**: Validates creator signatures against transaction senders

#### 🌐 **Developer Friendly**
- **Granular Validation**: Run specific validation steps for faster debugging
- **Local Development**: Test without blockchain calls for rapid iteration
- **Comprehensive Testing**: 50+ test cases covering all validation scenarios
- **Rich Documentation**: Step-by-step guides for every use case

#### 📊 **Governance Enhancement**
- **Structured Data**: Standardized format for all proposal metadata
- **Version Control**: Git-based history tracking for all changes
- **PR-based Workflow**: Community review process for metadata submissions
- **Network Support**: Both mainnet and testnet environments

### 🚀 **Key Advantages**

| Advantage | Description | Benefit |
|-----------|-------------|---------|
| **🔐 Cryptographic Verification** | Mathematical proofs eliminate need for trusted intermediaries | Enhanced security and decentralization |
| **⚡ Easy Registration** | Step-by-step validation and local testing | Quick and error-free submission |
| **🔍 Complete Transparency** | All metadata changes tracked in Git | Full audit trail and accountability |
| **🛡️ Attack Prevention** | Time-based signatures and replay protection | Robust security against common attacks |
| **📈 Scalable Architecture** | Modular validation system | Easy to extend and maintain |
| **🌍 Multi-network Support** | Mainnet and testnet compatibility | Flexible deployment options |

### 💡 **Use Cases**

- **Voluntary Proposal Registration**: Proposers register their on-chain agendas to enable DAO committee voting
- **Community-Driven Voting**: Enable DAO committee members to vote on voluntarily disclosed proposals
- **Transparent Governance**: Proposers who seek public support voluntarily provide detailed proposal information
- **Self-Regulated Disclosure**: Foster a culture of voluntary transparency in DAO governance
- **Integration**: Enable dApps and tools to access voluntarily shared governance data

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

## 🧪 Testing

```bash
# Run all tests
npm test

# Test results
Test Suites: 3 passed, 3 total
Tests:       50 passed, 50 total
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

## 🤝 Contributing

1. Fork the repository
2. Create metadata file using templates in `data/agendas/`
3. Generate signature using web tool
4. Validate locally: `npm run validate:local`
5. Submit PR with correct title format (see PR Title Format section above)

### 📋 **PR Process**

**For Fork Contributors:**
- ✅ **Automatic Validation**: All PRs are automatically validated by GitHub Actions
- ⏳ **Manual Merge Required**: Due to GitHub security policies, fork PRs require manual approval and merge by maintainers
- 🔍 **Review Process**: Maintainers will review your PR after validation passes
- ⚡ **Typical Timeline**: PRs are usually reviewed within 24-48 hours

**For Direct Contributors** (with repository access):
- ✅ **Automatic Validation**: Same validation process
- 🚀 **Auto-Merge**: PRs are automatically merged when all validations pass

### 🔒 **Security Notice**

Fork PRs have limited permissions for security reasons:
- ❌ Cannot auto-merge (GitHub security policy)
- ✅ Can run validation workflows
- 🛡️ Maintainer review ensures security and quality

---

## 📄 License

ISC License

