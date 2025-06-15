# 🚀 Getting Started

> **Complete guide for beginners to create and submit DAO agenda metadata**

## 📋 Overview

This guide will walk you through the entire process from creating agenda metadata to submitting a Pull Request. Follow these steps to safely and accurately submit your DAO agenda metadata.

---

## 🎯 Prerequisites

### Required Tools
- **Git**: For repository management
- **Node.js 18+**: For running validation scripts
- **Web Browser**: For signature generation (MetaMask required)
- **Text Editor**: For editing JSON files

### Required Information
- **Agenda ID**: On-chain agenda number
- **Transaction Hash**: Hash of the agenda submission transaction
- **Network**: `mainnet` or `sepolia`
- **Wallet**: The wallet that submitted the transaction (for signature generation)

---

## 📝 Step-by-Step Guide

### Step 1: Repository Setup

#### 1.1 Fork and Clone Repository
```bash
# Fork the repository on GitHub first
git clone https://github.com/YOUR_USERNAME/dao-agenda-metadata-repository.git
cd dao-agenda-metadata-repository

# Create feature branch
git checkout -b feature/agenda-<ID>
```

#### 1.2 Install Dependencies
```bash
npm install
```

#### 1.3 Verify Installation
```bash
# Check if validation works
npm run validate -- --help
```

### Step 2: Create Metadata File

#### 2.1 Choose Template
```bash
# For new agenda
cp data/agendas/example-agenda.json data/agendas/<network>/agenda-<id>.json

# For agenda update
cp data/agendas/example-agenda-update.json data/agendas/<network>/agenda-<id>.json
```

**Example:**
```bash
# Creating metadata for agenda #123 on Sepolia
cp data/agendas/example-agenda.json data/agendas/sepolia/agenda-123.json
```

#### 2.2 Edit Metadata File
Open the copied file and modify the following fields:

```json
{
  "id": 123,                    // ← Change to your agenda ID
  "title": "Your Agenda Title", // ← Change to your agenda title
  "description": "Detailed description of your agenda proposal...", // ← Add description
  "network": "sepolia",         // ← mainnet or sepolia
  "transaction": "0x...",       // ← Your transaction hash
  "creator": {
    "address": "0x...",         // ← Your wallet address
    "signature": "0x..."        // ← Will be generated in next step
  },
  "createdAt": "2024-01-01T12:00:00.00Z", // ← Current timestamp
  "actions": [
    // ← Modify according to your agenda actions
  ]
}
```

#### 2.3 Quick Validation
```bash
# Quick format check
npm run validate:quick -- --pr-title "[Agenda] sepolia - 123 - Your Title" data/agendas/sepolia/agenda-123.json
```

### Step 3: Generate Signature

#### 3.1 Start Signature Tool
```bash
cd src/sign
python -m http.server 8000
```

#### 3.2 Open Web Tool
1. Open browser and go to `http://localhost:8000`
2. Click "Connect Wallet" button
3. Approve MetaMask connection

#### 3.3 Generate Signature
1. **Enter Agenda ID**: Input your agenda number (e.g., `123`)
2. **Enter Transaction Hash**: Input your transaction hash
3. **Select Action**: Choose "Create" for new agenda or "Update" for updates
4. **Click "Sign Message"**: MetaMask will open
5. **Review Message**: Verify the message content is correct
6. **Sign**: Click "Sign" in MetaMask
7. **Copy Signature**: Copy the generated signature (starts with `0x`)

#### 3.4 Update Metadata File
Paste the copied signature into your metadata file:
```json
{
  "creator": {
    "address": "0x1234...",     // Your wallet address
    "signature": "0xabcd..."    // ← Paste signature here
  }
}
```

### Step 4: Local Validation

#### 4.1 Comprehensive Local Validation
```bash
# Validate everything except on-chain transaction
npm run validate:local -- --pr-title "[Agenda] sepolia - 123 - Your Title" data/agendas/sepolia/agenda-123.json
```

#### 4.2 Individual Validations (for debugging)
```bash
# Schema validation
npm run validate:schema -- --pr-title "[Agenda] sepolia - 123 - Your Title" data/agendas/sepolia/agenda-123.json

# Signature validation
npm run validate:signature -- --pr-title "[Agenda] sepolia - 123 - Your Title" data/agendas/sepolia/agenda-123.json

# Time validation
npm run validate:time -- --pr-title "[Agenda] sepolia - 123 - Your Title" data/agendas/sepolia/agenda-123.json
```

#### 4.3 Fix Any Issues
If validation fails, check the error messages and fix the issues:
- **Schema errors**: Check JSON structure and required fields
- **Signature errors**: Regenerate signature with correct wallet
- **Time errors**: Ensure signature is created within 1 hour

### Step 5: Final Validation

#### 5.1 Full Validation (including on-chain)
```bash
# Complete validation with transaction verification
npm run validate -- --pr-title "[Agenda] sepolia - 123 - Your Title" data/agendas/sepolia/agenda-123.json
```

This step verifies:
- ✅ All previous validations
- ✅ On-chain transaction data
- ✅ Calldata consistency
- ✅ Address matching

### Step 6: Submit Pull Request

#### 6.1 Commit Changes
```bash
git add data/agendas/sepolia/agenda-123.json
git commit -m "Add agenda-123 metadata for Sepolia"
```

#### 6.2 Push to GitHub
```bash
git push origin feature/agenda-123
```

#### 6.3 Create Pull Request
1. Go to your forked repository on GitHub
2. Click "Compare & pull request"
3. **Set PR Title** (very important):
   - **New agenda**: `[Agenda] sepolia - 123 - Your Agenda Title`
   - **Update**: `[Agenda Update] sepolia - 123 - Your Agenda Title`
4. Fill out the PR template
5. Submit the PR

---

## ✅ Validation Checklist

Before submitting your PR, ensure:

### File Structure
- [ ] File is in correct directory: `data/agendas/<network>/`
- [ ] File name matches pattern: `agenda-<id>.json`
- [ ] Only one agenda file per PR

### Content Validation
- [ ] `id` matches file name and PR title
- [ ] `network` matches directory and PR title
- [ ] `transaction` is valid transaction hash
- [ ] `creator.address` matches transaction sender
- [ ] `creator.signature` is valid and recent (within 1 hour)
- [ ] `actions` array matches transaction calldata

### PR Requirements
- [ ] PR title follows correct format
- [ ] PR contains only one agenda file
- [ ] All validation checks pass

---

## 🚨 Common Issues and Solutions

### Issue 1: Signature Validation Failed
```
Error: Signature does not match expected address
```
**Solution**: Make sure you're signing with the same wallet that submitted the transaction.

### Issue 2: Signature Expired
```
Error: Signature has expired
```
**Solution**: Generate a new signature. See [Signature Guide](./signature-guide.md) for details.

### Issue 3: PR Title Format Error
```
Error: PR title does not match expected format
```
**Solution**: Use correct format. See [PR Guide](./pr-guide.md) for details.

### Issue 4: Transaction Not Found
```
Error: Transaction not found
```
**Solution**:
- Verify transaction hash is correct
- Ensure transaction is confirmed on blockchain
- Check you're using the correct network

### Issue 5: Calldata Mismatch
```
Error: Actions do not match transaction calldata
```
**Solution**:
- Verify `actions[].contractAddress` matches transaction data
- Verify `actions[].calldata` matches transaction data
- Check array order is correct

---

## 🆘 Need Help?

- **Documentation**: Check other guides in [docs/](../docs/) directory
- **FAQ**: See [FAQ](faq.md) for common questions
- **Issues**: Create an issue on GitHub for bugs or questions

---

**🎉 Congratulations! You're now ready to contribute to DAO governance through metadata submissions!**