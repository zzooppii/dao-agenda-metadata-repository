# 🗂️ PR Guide

> **Complete guide for submitting GitHub Pull Requests**

## 📋 Table of Contents

1. [PR Title Rules](#pr-title-rules)
2. [Creation vs Update](#creation-vs-update)
3. [Metadata Preparation](#metadata-preparation)
4. [Signature Generation](#signature-generation)
5. [PR Submission Process](#pr-submission-process)
6. [Automated Validation](#automated-validation)
7. [Troubleshooting](#troubleshooting)

---

## 🏷️ PR Title Rules

### New Agenda Creation
```
[Agenda] <network> - <id> - <title>
```

### Existing Agenda Update
```
[Agenda Update] <network> - <id> - <title>
```

### Examples
✅ **Correct Examples**:
- `[Agenda] sepolia - 123 - Increase Treasury Allocation`
- `[Agenda Update] mainnet - 456 - Updated Treasury Proposal`

❌ **Incorrect Examples**:
- `Add agenda 123` (format mismatch)
- `[Agenda] invalid - 123 - Title` (invalid network)
- `[Agenda] sepolia - abc - Title` (non-numeric ID)

---

## 🔄 Creation vs Update

### New Agenda Creation (`[Agenda]`)
- ✅ File **must not exist**
- ✅ `createdAt` field **required**
- ❌ `updatedAt` field **must not exist**
- ✅ New signature generation required

### Existing Agenda Update (`[Agenda Update]`)
- ✅ File **must exist**
- ✅ `createdAt` field **preserved**
- ✅ `updatedAt` field **required** (later than existing time)
- ✅ New signature generation required (update message format)

---

## 📝 Metadata Preparation

### 1. Basic Information

```json
{
  "id": 123,
  "title": "Increase Treasury Allocation",
  "description": "Proposal to increase treasury allocation for development",
  "network": "sepolia",
  "transaction": "0x...",
  "creator": {
    "address": "0x...",
    "signature": "0x..."
  },
  "actions": [...],
  "createdAt": "2024-01-01T00:00:00.00Z"
}
```

### 2. Additional Fields for Updates

```json
{
  // ... existing fields ...
  "updatedAt": "2024-01-02T00:00:00.00Z"
}
```

### 3. Time Format Rules
- **Format**: ISO 8601 Extended Format with centisecond precision in UTC (`YYYY-MM-DDTHH:mm:ss.ssZ`)
- **Example**: `2024-01-01T12:30:45.123Z`
- **Creation**: Use current time
- **Update**: Use time later than existing time

---

## ✍️ Signature Generation

### 1. Run Signature Tool
```bash
cd src/sign && python -m http.server 8000
```

### 2. Access in Browser
`http://localhost:8000`

### 3. Input Information

**For New Agenda Creation**:
- Agenda ID: `123`
- Transaction Hash: `0x...`
- Timestamp: `2024-01-01T00:00:00.00Z` (same as `createdAt` in metadata)
- Is Update: `false`

**For Existing Agenda Update**:
- Agenda ID: `123`
- Transaction Hash: `0x...`
- Timestamp: `2024-01-02T00:00:00.00Z` (same as `updatedAt` in metadata)
- Is Update: `true`

### 4. Signature Security Rules
- ⏰ **Validity Period**: Must be used **within 1 hour** after signature generation
- 🔒 **No Reuse**: Same signature cannot be used multiple times
- 📅 **Time Match**: Signature timestamp must exactly match metadata time field

---

## 🚀 PR Submission Process

### 1. Create Branch
```bash
git checkout -b feature/agenda-123
```

### 2. Create/Modify File
```bash
# New agenda
cp data/agendas/example-agenda.json data/agendas/sepolia/agenda-123.json
# Or for agenda update
cp data/agendas/example-agenda-update.json data/agendas/sepolia/agenda-123.json

# Modify existing agenda
vim data/agendas/sepolia/agenda-123.json
```

### 3. Local Validation
```bash
# Creation
npm run validate data/agendas/sepolia/agenda-123.json --pr-title "[Agenda] sepolia - 123 - Your Title"

# Update
npm run validate data/agendas/sepolia/agenda-123.json --pr-title "[Agenda Update] sepolia - 123 - Your Title"
```

### 4. Commit and Push
```bash
git add data/agendas/sepolia/agenda-123.json
git commit -m "Add agenda 123: Your Title"
git push origin feature/agenda-123
```

### 5. Create PR
Use **exact title format** when creating PR on GitHub

---

## 🤖 Automated Validation

### GitHub Actions Validation Process

1. **PR Title Validation**: Check correct format
2. **File Count Validation**: Only one agenda file per PR allowed
3. **Creation/Update Validation**: Check file existence matches PR title
4. **Time Validation**: Check signature validity period and time sequence
5. **Metadata Validation**: Schema, signature, transaction, calldata validation

### On Validation Success
✅ When all checks pass, PR enters approval waiting state.

### On Validation Failure
❌ Check failed validation items, fix them, and push again.

**Implementation Code**: [`.github/workflows/pr-metadata-validation.yml`](../.github/workflows/pr-metadata-validation.yml)

---

## 🛠️ Troubleshooting

### Time-Related Issues

| Issue | Solution |
|-------|----------|
| Signature expired | Generate new signature within 1 hour |
| Update time in past | Set `updatedAt` to current time |
| Time format error | Use ISO 8601 Extended Format (`YYYY-MM-DDTHH:mm:ss.ssZ`) |

### PR Title Issues

| Issue | Solution |
|-------|----------|
| Format error | Use `[Agenda]` or `[Agenda Update]` format |
| Network mismatch | Ensure file path and title network match |
| ID mismatch | Ensure filename, metadata, and PR title ID match |

### Signature Issues

| Issue | Solution |
|-------|----------|
| Invalid signature | Regenerate signature with correct parameters |
| Signature verification failed | Check address matches transaction sender |
| Message format error | Ensure correct message format for creation/update |

### File Issues

| Issue | Solution |
|-------|----------|
| File not found (for update) | Ensure file exists before updating |
| File already exists (for creation) | Use update format or choose different ID |
| Multiple files in PR | Only one agenda file per PR allowed |

### Validation Errors

| Issue | Solution |
|-------|----------|
| Schema validation failed | Check all required fields and formats |
| Transaction not found | Ensure transaction exists on specified network |
| Calldata mismatch | Verify transaction calldata matches metadata actions |

### Common Validation Failure Examples

**Signature Regeneration**:
```bash
# Regenerate signature
cd src/sign && python -m http.server 8000
# Generate new signature with correct information in browser
```

**Time Expiration**:
```
❌ Signature has expired. Signature time: 2024-01-01T10:00:00.00Z, Current time: 2024-01-01T12:00:00.00Z
```

**File Existence Error**:
```
❌ Create operation requires new file, but agenda-123.json already exists. Use [Agenda Update] for updates.
```

**Time Sequence Error**:
```
❌ Update operation requires updatedAt to be later than existing time.
Existing: 2024-01-01T10:00:00.00Z
New: 2024-01-01T09:00:00.00Z
```



---

## 🔗 Quick Links

### Validation Commands
```bash
# Local validation
npm run validate <file> --pr-title "<title>"

# All validation scripts
npm run validate:schema <file>
npm run validate:signature <file>
npm run validate:transaction <file>
npm run validate:calldata <file>
```

### File Templates
- **New Agenda**: `data/agendas/example-agenda.json`
- **Update Agenda**: `data/agendas/example-agenda-update.json`

### Signature Tool
- **Local Server**: `cd src/sign && python -m http.server 8000`
- **Access URL**: `http://localhost:8000`

---

**💡 Need help? Check the [FAQ](faq.md) or create an issue on GitHub!**