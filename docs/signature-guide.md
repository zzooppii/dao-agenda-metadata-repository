# 🔐 Signature Guide

> **Complete guide for generating signatures required for DAO agenda metadata**

## 📋 Why Signatures Are Required

- **Ownership Proof**: Proves that the transaction submitter is creating the metadata
- **Integrity Assurance**: Ensures metadata authenticity and prevents forgery
- **Time-based Security**: 1-hour validity prevents signature reuse attacks

---

## 🔑 Signature Message Format

> **Note**: Message templates are managed in [`src/config/signature-messages.ts`](../src/config/signature-messages.ts)

### For New Agenda Creation:
```
I am the one who submitted agenda #<id> via transaction <tx-hash>. I am creating this metadata at <timestamp>. This signature proves that I am the one who submitted this agenda.
```

### For Agenda Updates:
```
I am the one who submitted agenda #<id> via transaction <tx-hash>. I am updating this metadata at <timestamp>. This signature proves that I am the one who submitted this agenda.
```

### Example:
```
I am the one who submitted agenda #123 via transaction 0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef. I am creating this metadata at 2024-01-01T12:00:00.00Z. This signature proves that I am the one who submitted this agenda.
```

---

## 🛠️ How to Generate Signatures

### Step 1: Start Signature Tool
```bash
cd src/sign
python -m http.server 8000
```

### Step 2: Open Web Tool
Open your browser and go to: `http://localhost:8000`

### Step 3: Connect Wallet
1. Click "Connect Wallet" button
2. Approve MetaMask connection
3. Verify the connected address matches your transaction sender

### Step 4: Input Information
- **Agenda ID**: Your agenda number (e.g., `123`)
- **Transaction Hash**: Your transaction hash (0x + 64 hex characters)
- **Timestamp**: Current time in ISO 8601 format (`2024-01-01T12:00:00.00Z`)
- **Is Update**: Check if updating existing agenda

### Step 5: Generate and Copy
1. Click "Sign Message" button
2. Review the message in MetaMask popup
3. Click "Sign" to approve
4. Copy the generated signature (starts with `0x`, 130 characters total)

### Step 6: Add to Metadata
Paste the signature into your metadata file:
```json
{
  "creator": {
    "address": "0x1234...",     // Your wallet address
    "signature": "0xabcd..."    // ← Paste signature here
  }
}
```

---

## 🚨 Common Errors & Solutions

### Signature Format Error
```
Error: Invalid signature format
```
**Solution**: Ensure signature is `0x` + 130 hex characters

### Address Mismatch
```
Error: Signature does not match expected address
```
**Solution**: Use the same wallet that submitted the transaction

### Signature Expired
```
Error: Signature has expired
```
**Solution**: Generate new signature (valid for 1 hour only)

### Wallet Connection Issues
```
Error: Please install MetaMask
```
**Solution**: Install MetaMask browser extension and refresh page

### Message Format Issues
```
Error: Creator signature is invalid
```
**Solution**: Regenerate signature with correct agenda ID and transaction hash

---

## 🔒 Security Rules

### Time Validity
- ⏰ **1-Hour Window**: Signatures expire 1 hour after generation
- 🚫 **No Reuse**: Each signature can only be used once
- 📅 **Exact Match**: Signature timestamp must match metadata time field

### Message Requirements
- ✅ **Correct Format**: Use exact message template
- ✅ **Accurate Data**: Agenda ID and transaction hash must be correct
- ✅ **Right Action**: Different messages for creation vs update

---

## 🔍 Troubleshooting

### Quick Checklist
- [ ] MetaMask installed and connected
- [ ] Using correct wallet (transaction sender)
- [ ] Agenda ID matches your transaction
- [ ] Transaction hash is correct (0x + 64 hex)
- [ ] Timestamp in correct format
- [ ] Generated within last hour

### Debug Steps
1. **Verify Transaction**: Check your transaction exists on blockchain
2. **Check Wallet**: Ensure connected wallet sent the transaction
3. **Regenerate**: Create new signature if expired or invalid
4. **Test Format**: Verify signature is 130 characters with 0x prefix

---

## 🔗 Quick Reference

### Signature Tool Access
```bash
cd src/sign && python -m http.server 8000
# Open: http://localhost:8000
```

### Time Format
- **Format**: ISO 8601 Extended (`YYYY-MM-DDTHH:mm:ss.ssZ`)
- **Example**: `2024-01-01T12:00:00.00Z`
- **Timezone**: Always UTC (Z suffix)

### Signature Format
- **Pattern**: `0x` + 130 hex characters
- **Example**: `0xabcdef1234567890...` (130 chars total)

---

**💡 Need help? Check the [FAQ](faq.md) or [Getting Started Guide](getting-started.md) for step-by-step instructions!**