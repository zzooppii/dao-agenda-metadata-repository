# 🗂️ PR Guide

> **Complete guide for submitting GitHub Pull Requests**

## 📋 Table of Contents

1. [PR Title Format](#pr-title-format)
2. [PR Types](#pr-types)
3. [PR Submission Process](#pr-submission-process)
4. [PR Template](#pr-template)
5. [Automated Validation](#automated-validation)
6. [Troubleshooting](#troubleshooting)

---

## 🏷️ PR Title Format

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

## 🔄 PR Types

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

## 🚀 PR Submission Process

### 1. Prepare Metadata
📖 **See detailed guide**: [Getting Started Guide](getting-started.md#creating-metadata)

- Create or modify agenda file
- Generate signature using web tool
- Validate locally before submission

### 2. Create Branch
```bash
git checkout -b feature/agenda-123
```

### 3. Add File
```bash
# Add your agenda file
git add data/agendas/sepolia/agenda-123.json
git commit -m "Add agenda 123: Your Title"
git push origin feature/agenda-123
```

### 4. Create PR on GitHub
1. Go to GitHub repository
2. Click "New Pull Request"
3. Select your branch
4. **Use exact title format** (see PR Title Format section)
5. Fill out PR template checklist
6. Submit PR

### 5. Monitor Validation
- GitHub Actions will automatically validate your PR
- Check validation results in PR checks
- Fix any issues and push updates if needed

---

## 📝 PR Template

When creating a PR, you'll see this template with essential checks:

```markdown
## PR Checklist

- [ ] PR title follows the correct format
- [ ] Only one agenda file is added or modified
- [ ] Agenda ID in the file matches the PR title
- [ ] Network in the file matches the PR title
- [ ] Signature is valid and created within 1 hour
```

**All checkboxes must be checked before submission.**

---

## 🤖 Automated Validation

### GitHub Actions Validation Process

1. **PR Title Validation**: Check correct format
2. **File Count Validation**: Only one agenda file per PR allowed
3. **Creation/Update Validation**: Check file existence matches PR title
4. **Schema Validation**: JSON schema compliance
5. **Signature Validation**: Cryptographic signature verification
6. **Transaction Validation**: On-chain transaction verification

### Validation Results

✅ **Success**: All checks pass → PR ready for review
❌ **Failure**: Check failed items → Fix and push again

**Implementation**: [`.github/workflows/pr-metadata-validation.yml`](../.github/workflows/pr-metadata-validation.yml)

---

## 🛠️ Troubleshooting

### PR Title Issues

| Issue | Solution |
|-------|----------|
| Format error | Use exact `[Agenda]` or `[Agenda Update]` format |
| Network mismatch | Ensure file path and title network match |
| ID mismatch | Ensure filename, metadata, and PR title ID match |

### File Issues

| Issue | Solution |
|-------|----------|
| File not found (for update) | Ensure file exists before updating |
| File already exists (for creation) | Use update format or choose different ID |
| Multiple files in PR | Only one agenda file per PR allowed |

### Validation Failures

| Issue | Solution |
|-------|----------|
| Signature expired | Regenerate signature (valid for 1 hour only) |
| Schema validation failed | Check required fields and formats |
| Transaction not found | Ensure transaction exists on specified network |

### Common Error Messages

**File Existence Error**:
```
❌ Create operation requires new file, but agenda-123.json already exists.
Use [Agenda Update] for updates.
```

**Time Sequence Error**:
```
❌ Update operation requires updatedAt to be later than existing time.
Existing: 2024-01-01T10:00:00.00Z
New: 2024-01-01T09:00:00.00Z
```

**Signature Expiration**:
```
❌ Signature has expired. Signature time: 2024-01-01T10:00:00.00Z
Current time: 2024-01-01T12:00:00.00Z
```

---

## 🔗 Related Guides

- **📚 [Getting Started](getting-started.md)**: Complete setup and metadata creation
- **✍️ [Signature Guide](signature-guide.md)**: Signature generation and verification
- **🔍 [Validation Guide](validation-guide.md)**: Detailed validation process
- **❓ [FAQ](faq.md)**: Frequently asked questions

---

**💡 Need help? Check the [FAQ](faq.md) or create an issue on GitHub!**