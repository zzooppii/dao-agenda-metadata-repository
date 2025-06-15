# 🗂️ Schema Reference

## Agenda Metadata JSON Structure

### Required Fields

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `id` | `number` | Unique agenda identifier | `1` |
| `title` | `string` | Agenda title | `"Increase Treasury Allocation"` |
| `description` | `string` | Detailed agenda description | `"Proposal to increase the DAO treasury allocation for Q3 2024."` |
| `network` | `string` | Network (`"mainnet"` or `"sepolia"`) | `"sepolia"` |
| `transaction` | `string` | Transaction hash (0x + 64 hex chars) | `"0x1234...abcd"` |
| `creator` | `object` | Creator information | See below |
| `actions` | `array` | Array of actions to execute | See below |
| `createdAt` | `string` | Metadata creation time (ISO 8601 Extended Format) | `"2024-01-01T12:00:00.00Z"` |

### Creator Object Structure

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `address` | `string` | Creator wallet address (0x + 40 hex chars) | `"0x1111111111111111111111111111111111111111"` |
| `signature` | `string` | Signature (0x + 130 hex chars) | `"0xabcdef...123456"` |

### Actions Array Structure

Each action object includes the following fields:

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `title` | `string` | ✅ | Action title | `"updateSeigniorage()"` |
| `contractAddress` | `string` | ✅ | Target contract address | `"0x2320542ae933FbAdf8f5B97cA348c7CeDA90fAd7"` |
| `method` | `string` | ✅ | Function signature | `"updateSeigniorage()"` |
| `calldata` | `string` | ✅ | Call data (0x + hex) | `"0x764a7856"` |
| `abi` | `array` | ✅ | Function ABI | ABI object array |
| `sendEth` | `boolean` | ❌ | Whether to send ETH | `false` |
| `id` | `string` | ❌ | Action ID | `"1"` |
| `type` | `string` | ❌ | Action type | `"call"` |

### Time Fields

#### For Creation
- ✅ `createdAt` **Required** - Metadata creation time
- ❌ `updatedAt` **Must not exist**

#### For Updates
- ✅ `createdAt` **Keep existing** - Original value unchanged
- ✅ `updatedAt` **Required** - Must be later than existing time

#### Time Format
- **ISO 8601 Extended Format with centisecond precision in UTC**
- Format: `YYYY-MM-DDTHH:mm:ss.ssZ`
- Example: `"2024-01-01T12:00:00.00Z"`

#### Time Validation Rules
- ⏰ **Signature Validity**: `createdAt` or `updatedAt` time must be **within 1 hour** from current time
- 🔒 **Security Purpose**: Prevents signature reuse and enhances time-based security
- ⚠️ **Important**: Must submit PR within 1 hour after signature generation

### Optional Fields

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `updatedAt` | `string` | Metadata update time (required only for updates) | `"2024-01-02T15:30:00.00Z"` |
| `snapshotUrl` | `string` | Reference link URL (Snapshot proposal, official announcement, etc.) | `"https://snapshot.org/#/mydao.eth/proposal/1"` |
| `discourseUrl` | `string` | Discussion link URL (Discourse forum, official announcement, etc.) | `"https://forum.mydao.com/t/proposal-1"` |

> **Note**: If either `snapshotUrl` or `discourseUrl` is provided, that value must match the memo field in the transaction. These fields can be used for various purposes including Snapshot proposal links, official announcements, discussion forums, and other reference materials.

## Complete Example

```json
{
  "id": 1,
  "title": "Increase Treasury Allocation",
  "description": "Proposal to increase the DAO treasury allocation for Q3 2024.",
  "network": "sepolia",
  "transaction": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
  "creator": {
    "address": "0x1111111111111111111111111111111111111111",
    "signature": "0xabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdef"
  },
  "createdAt": "2024-01-01T12:00:00.00Z",
  "snapshotUrl": "https://snapshot.org/#/mydao.eth/proposal/1",
  "discourseUrl": "https://forum.mydao.com/t/proposal-1",
  "actions": [
    {
      "title": "updateSeigniorage()",
      "contractAddress": "0x2320542ae933FbAdf8f5B97cA348c7CeDA90fAd7",
      "method": "updateSeigniorage()",
      "calldata": "0x764a7856",
      "abi": [
        {
          "inputs": [],
          "name": "updateSeigniorage",
          "outputs": [
            {
              "internalType": "bool",
              "name": "",
              "type": "bool"
            }
          ],
          "stateMutability": "nonpayable",
          "type": "function"
        }
      ],
      "sendEth": false,
      "id": "1",
      "type": "call"
    }
  ]
}
```

## Validation Rules

### Format Validation
- **Addresses**: `0x` + 40 hex characters
- **Transaction Hash**: `0x` + 64 hex characters
- **Signature**: `0x` + 130 hex characters
- **Calldata**: `0x` + hex string (no length limit)

### Business Rules
- `id` must match filename (`agenda-<id>.json`)
- `network` must match file path (`data/agendas/<network>/`)
- `creator.address` must match actual transaction sender
- `creator.signature` must be generated with correct signature message
- `actions[].contractAddress` array must match transaction calldata address[] array
- `actions[].calldata` array must match transaction calldata bytes[] array
- If `snapshotUrl` or `discourseUrl` is provided, that value must match transaction calldata memo field (new version only)

### Time-based Security Rules
- ⏰ **Signature Validity**: `createdAt` (for creation) or `updatedAt` (for updates) time must be **within 1 hour** from current time
- 🔄 **Update Time Order**: `updatedAt` must be **later** than existing `updatedAt` or `createdAt`
- 🚫 **Signature Reuse Prevention**: Cannot sign multiple times with the same timestamp

### Signature Message Format

> **Note**: Signature message templates are centrally managed in [`src/config/signature-messages.ts`](../src/config/signature-messages.ts).

**For creation:**
```
I am the one who submitted agenda #<id> via transaction <tx-hash>. I am creating this metadata at <timestamp>. This signature proves that I am the one who submitted this agenda.
```

**For updates:**
```
I am the one who submitted agenda #<id> via transaction <tx-hash>. I am updating this metadata at <timestamp>. This signature proves that I am the one who can update this agenda.
```

Example:
```
I am the one who submitted agenda #1 via transaction 0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef. I am creating this metadata at 2024-01-01T12:00:00.00Z. This signature proves that I am the one who submitted this agenda.
```

## TypeScript Type Definitions

```typescript
interface AgendaMetadata {
  id: number;
  title: string;
  description: string;
  network: "mainnet" | "sepolia";
  transaction: string;
  creator: {
    address: string;
    signature: string;
  };
  actions: Action[];
  createdAt: string;
  updatedAt?: string;
  snapshotUrl?: string;  // Reference link URL (Snapshot proposal, official announcement, etc.)
  discourseUrl?: string;  // Discussion link URL (Discourse forum, official announcement, etc.)
}

interface Action {
  title: string;
  contractAddress: string;
  method: string;
  calldata: string;
  abi: any[];
  sendEth?: boolean;
  id?: string;
  type?: string;
}
```

> For detailed schema definitions, refer to the `src/types/agenda-metadata.ts` file.