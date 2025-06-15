# 🔐 Signature Guide

> **This document provides a detailed guide for signature generation and verification required when submitting DAO Agenda metadata.**

## 📋 Why Signatures Are Required

Reasons why signatures are required when submitting metadata:
- **Ownership Proof**: Proves that the person who sent the actual transaction submitted the metadata
- **Integrity Assurance**: Ensures that the metadata has not been forged
- **Accountability Tracking**: Clearly identifies the metadata submitter

## 🔑 Signature Message Format

### Standard Message Template

> **Note**: Signature message templates are centrally managed in [`src/config/signature-messages.ts`](../src/config/signature-messages.ts).

**For Creation**:
```
I am the one who submitted agenda #<id> via transaction <tx-hash>. I am creating this metadata at <timestamp>. This signature proves that I am the one who submitted this agenda.
```

**For Update**:
```
I am the one who submitted agenda #<id> via transaction <tx-hash>. I am updating this metadata at <timestamp>. This signature proves that I am the one who submitted this agenda.
```

### Real Example
```
I am the one who submitted agenda #1 via transaction 0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef. I am creating this metadata at 2024-01-01T12:00:00.00Z. This signature proves that I am the one who submitted this agenda.
```

### Message Components
- `<id>`: Agenda ID (number)
- `<tx-hash>`: Transaction hash (0x + 64 hex characters)
- `<timestamp>`: ISO 8601 timestamp (YYYY-MM-DDTHH:mm:ss.ssZ)

## 🛠️ How to Generate Signatures

### Method 1: Using Web Tool (Recommended)

1. **Run Signature Tool**
   ```bash
   cd src/sign
   python -m http.server 8000
   ```

2. **Access Browser**
   ```
   http://localhost:8000
   ```

3. **Connect Wallet**
   - Click "Connect Wallet" button
   - Approve connection in MetaMask popup
   - Verify connected address

4. **Input Information**
   - **Agenda ID**: Enter on-chain agenda number
   - **Transaction Hash**: Enter agenda submission transaction hash
   - **Timestamp**: Enter metadata creation/update time
   - **Is Update**: Check if this is an update (affects message format)

5. **Generate Signature**
   - Click "Sign Message" button
   - Review signature message in MetaMask
   - Approve with "Sign" button

6. **Copy Signature**
   - Copy generated signature (130-character string starting with 0x)
   - Paste into `creator.signature` field in metadata file

### Method 2: Programmatic Approach

```javascript
import { ethers } from 'ethers';

// Connect wallet
const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();

// Generate message
const agendaId = 1;
const txHash = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
const timestamp = "2024-01-01T12:00:00.00Z";
const isUpdate = false;

const message = isUpdate
  ? `I am the one who submitted agenda #${agendaId} via transaction ${txHash}. I am updating this metadata at ${timestamp}. This signature proves that I am the one who submitted this agenda.`
  : `I am the one who submitted agenda #${agendaId} via transaction ${txHash}. I am creating this metadata at ${timestamp}. This signature proves that I am the one who submitted this agenda.`;

// Generate signature
const signature = await signer.signMessage(message);
console.log("Signature:", signature);
```

### Method 3: Command Line Tool

```bash
# Using ethers-cli (installation required)
npx ethers-cli sign-message "I am the one who submitted agenda #1 via transaction 0x... I am creating this metadata at 2024-01-01T12:00:00.00Z. This signature proves that I am the one who submitted this agenda." --private-key YOUR_PRIVATE_KEY
```

## ✅ Signature Verification Process

How the system verifies signatures:

### 1. Format Validation
```typescript
const SIGNATURE_PATTERN = /^0x[a-fA-F0-9]{130}$/;
if (!signature.match(SIGNATURE_PATTERN)) {
  throw new Error("Invalid signature format");
}
```

### 2. Message Reconstruction
```typescript
const message = isUpdate
  ? `I am the one who submitted agenda #${agendaId} via transaction ${txHash}. I am updating this metadata at ${timestamp}. This signature proves that I am the one who submitted this agenda.`
  : `I am the one who submitted agenda #${agendaId} via transaction ${txHash}. I am creating this metadata at ${timestamp}. This signature proves that I am the one who submitted this agenda.`;
```

### 3. Address Recovery
```typescript
import { ethers } from 'ethers';

const recoveredAddress = ethers.verifyMessage(message, signature);
```

### 4. Address Match Verification
```typescript
if (recoveredAddress.toLowerCase() !== expectedAddress.toLowerCase()) {
  throw new Error("Signature does not match expected address");
}
```

## 🚨 Common Errors

### 1. Signature Format Error
```
Error: Invalid signature format: 0xinvalid
```
**Cause**: Signature is not in correct format
**Solution**: Ensure `0x` + 130 hex characters

### 2. Address Mismatch
```
Error: Signature does not match expected address. Recovered: 0xabc..., Expected: 0xdef...
```
**Cause**: Signed with different wallet or different message
**Solution**: Re-sign with the wallet that sent the transaction

### 3. Message Mismatch
```
Error: Creator signature is invalid
```
**Cause**: Incorrect agenda ID or transaction hash
**Solution**: Regenerate signature with correct information

### 4. Wallet Connection Failure
```
Error: Please install MetaMask to use this tool
```
**Cause**: MetaMask not installed
**Solution**: Install MetaMask browser extension

### 5. Time Expiration
```
Error: Signature has expired. Signature time: 2024-01-01T10:00:00.00Z, Current time: 2024-01-01T12:00:00.00Z
```
**Cause**: Signature is older than 1 hour
**Solution**: Generate new signature within 1 hour of use

## 🔧 Advanced Usage

### Signature Security Rules

1. **1-Hour Validity**: Signatures must be used within 1 hour of generation
2. **Single Use**: Each signature can only be used once
3. **Exact Timestamp Match**: Signature timestamp must exactly match metadata time field
4. **Message Format**: Different message formats for creation vs update

### Local Signature Verification Script

Verify signatures locally before submission:

```javascript
// verify-signature.js
import { ethers } from 'ethers';

const agendaId = 1;
const txHash = "0x...";
const timestamp = "2024-01-01T12:00:00.00Z";
const signature = "0x...";
const expectedAddress = "0x...";
const isUpdate = false;

const message = isUpdate
  ? `I am the one who submitted agenda #${agendaId} via transaction ${txHash}. I am updating this metadata at ${timestamp}. This signature proves that I am the one who submitted this agenda.`
  : `I am the one who submitted agenda #${agendaId} via transaction ${txHash}. I am creating this metadata at ${timestamp}. This signature proves that I am the one who submitted this agenda.`;

try {
  const recovered = ethers.verifyMessage(message, signature);
  console.log("Recovered address:", recovered);
  console.log("Expected address:", expectedAddress);
  console.log("Match:", recovered.toLowerCase() === expectedAddress.toLowerCase());

  // Check time validity
  const signatureTime = new Date(timestamp);
  const currentTime = new Date();
  const timeDiff = currentTime.getTime() - signatureTime.getTime();
  const isExpired = timeDiff > 60 * 60 * 1000; // 1 hour

  console.log("Time difference (minutes):", Math.floor(timeDiff / (1000 * 60)));
  console.log("Expired:", isExpired);

} catch (error) {
  console.error("Verification failed:", error.message);
}
```

### Batch Signature Generation

For multiple agendas:

```javascript
// batch-sign.js
import { ethers } from 'ethers';

const agendas = [
  { id: 1, txHash: "0x...", timestamp: "2024-01-01T12:00:00.00Z" },
  { id: 2, txHash: "0x...", timestamp: "2024-01-01T12:30:00.00Z" }
];

const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();

for (const agenda of agendas) {
  const message = `I am the one who submitted agenda #${agenda.id} via transaction ${agenda.txHash}. I am creating this metadata at ${agenda.timestamp}. This signature proves that I am the one who submitted this agenda.`;

  const signature = await signer.signMessage(message);
  console.log(`Agenda ${agenda.id}: ${signature}`);
}
```

## 🔍 Troubleshooting

### Debug Signature Issues

1. **Check Message Format**: Ensure exact message template is used
2. **Verify Timestamp**: Must match metadata time field exactly
3. **Confirm Wallet**: Use the same wallet that sent the transaction
4. **Test Locally**: Use verification script before submission

### Common Solutions

| Issue | Solution |
|-------|----------|
| Signature too short/long | Ensure 0x + 130 hex characters |
| Address mismatch | Use correct wallet for signing |
| Time format error | Use ISO 8601 format (YYYY-MM-DDTHH:mm:ss.ssZ) |
| Expired signature | Generate new signature within 1 hour |
| MetaMask not detected | Install and enable MetaMask extension |



## 🔗 Quick Reference

### Signature Tool
```bash
cd src/sign && python -m http.server 8000
# Access: http://localhost:8000
```

### Message Templates
- **Creation**: `I am the one who submitted agenda #<id> via transaction <tx-hash>. I am creating this metadata at <timestamp>. This signature proves that I am the one who submitted this agenda.`
- **Update**: `I am the one who submitted agenda #<id> via transaction <tx-hash>. I am updating this metadata at <timestamp>. This signature proves that I am the one who submitted this agenda.`

### Security Rules
- ⏰ **Validity**: 1 hour from generation
- 🔒 **Single Use**: Cannot reuse signatures
- 📅 **Exact Match**: Timestamp must match metadata
- 🔄 **Format Specific**: Different messages for create/update

---

**💡 Need help with signatures? Check the [FAQ](faq.md) or use the web tool at `src/sign/`!**