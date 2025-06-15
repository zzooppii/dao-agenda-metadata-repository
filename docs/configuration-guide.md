# Configuration Guide

This guide explains the configuration system of the DAO Agenda Metadata Repository, including centralized constants, ABI management, and customization options.

## Overview

The project uses a centralized configuration system to eliminate hardcoded values and improve maintainability. All configuration is organized in the `src/config/` directory.

## Configuration Structure

```
src/config/
├── constants.ts          # Centralized application constants
├── abi-loader.ts         # Contract ABI management
├── abi/                  # Contract ABI files
│   └── dao-contract.json # DAO contract ABI
├── rpc.ts               # RPC endpoint configuration
└── signature-messages.ts # Signature message templates
```

## Constants Configuration

### File: `src/config/constants.ts`

This file contains all application constants organized by category:

#### Time Constants

```typescript
export const TIME_CONSTANTS = {
  /** Signature validity duration in milliseconds (1 hour) */
  SIGNATURE_VALID_DURATION: 60 * 60 * 1000,

  /** Test timeout duration in milliseconds (30 seconds) */
  TEST_TIMEOUT: 30000,
} as const;
```

**Usage:**
- Signature expiration validation
- Test timeout settings

#### Validation Constants

```typescript
export const VALIDATION_CONSTANTS = {
  /** Regex patterns for validation */
  PATTERNS: {
    SIGNATURE: /^0x[a-fA-F0-9]{130}$/,
    ADDRESS: /^0x[a-fA-F0-9]{40}$/,
    TRANSACTION_HASH: /^0x[a-fA-F0-9]{64}$/,
    AGENDA_PATH: /^data\/agendas\/(mainnet|sepolia)\//,
    PR_TITLE_CREATE: /^\[Agenda\]\s+(mainnet|sepolia)\s*-\s*(\d+)\s*-\s*(.+)$/,
    PR_TITLE_UPDATE: /^\[Agenda Update\]\s+(mainnet|sepolia)\s*-\s*(\d+)\s*-\s*(.+)$/,
  }
} as const;
```

**Usage:**
- Input validation
- Format checking
- PR title parsing

#### Test Constants

```typescript
export const TEST_CONSTANTS = {
  /** Real blockchain data for integration tests */
  SEPOLIA_TEST_DATA: {
    AGENDA_ID: 101,
    TRANSACTION_HASH: "0xb054fd4b9ac78eddf5b2a84eda9424842f0479992b57c530499ab3c985bee9d2",
    NETWORK: "sepolia" as const
  }
} as const;
```

**Usage:**
- Integration testing
- Real blockchain data validation

#### Error Messages

```typescript
export const ERROR_MESSAGES = {
  INVALID_SIGNATURE_FORMAT: (signature: string) =>
    `Invalid signature format: ${signature}. Expected 0x followed by 130 hex characters.`,
  SIGNATURE_EXPIRED: (signatureTime: string, currentTime: string) =>
    `Signature has expired. Signature time: ${signatureTime}, Current time: ${currentTime}.`,
  // ... other error message templates
} as const;
```

#### Signature Messages

```typescript
export const SIGNATURE_MESSAGES = {
  CREATE: (agendaId: number, txHash: string, timestamp: string) =>
    `I am the one who submitted agenda #${agendaId} via transaction ${txHash}. I am creating this metadata at ${timestamp}. This signature proves that I am the one who submitted this agenda.`,
  UPDATE: (agendaId: number, txHash: string, timestamp: string) =>
    `I am the one who submitted agenda #${agendaId} via transaction ${txHash}. I am updating this metadata at ${timestamp}. This signature proves that I am the one who can update this agenda.`,
} as const;
```

## ABI Management

### File: `src/config/abi-loader.ts`

Centralized ABI management system for contract interactions:

#### ABI Storage

Contract ABIs are stored in JSON files:
```
src/config/abi/
└── dao-contract.json     # DAO contract ABI
```

#### ABI Loader Class

```typescript
export class ABILoader {
  /**
   * Load ABI from JSON file
   */
  static loadABI(contractName: string): any[]

  /**
   * Get ethers Interface for a contract
   */
  static getInterface(contractName: string): ethers.Interface

  /**
   * Get specific event from contract ABI
   */
  static getEvent(contractName: string, eventName: string): ethers.EventFragment | null

  /**
   * Get event topic hash
   */
  static getEventTopicHash(contractName: string, eventName: string): string
}
```

#### Pre-configured Interfaces

```typescript
export const ContractInterfaces = {
  DAO: ABILoader.getInterface('dao-contract'),
} as const;

export const EventTopics = {
  AgendaCreated: ABILoader.getEventTopicHash('dao-contract', 'AgendaCreated'),
} as const;
```

## RPC Configuration

### File: `src/config/rpc.ts`

RPC endpoint management with environment variable support:

```typescript
export type Network = "mainnet" | "sepolia";

export const DEFAULT_RPC_URLS: Record<Network, string> = {
  mainnet: "https://ethereum.drpc.org",
  sepolia: "https://sepolia.drpc.org"
} as const;

export function getRpcUrl(network: Network): string {
  // Checks environment variables first, falls back to defaults
  const envVar = network === "mainnet" ? "MAINNET_RPC_URL" : "SEPOLIA_RPC_URL";
  return process.env[envVar] || DEFAULT_RPC_URLS[network];
}
```

**Note:** RPC configuration is handled separately from the main constants file for better organization.

## Usage Examples

### Importing Constants

```typescript
import {
  TIME_CONSTANTS,
  VALIDATION_CONSTANTS,
  ERROR_MESSAGES
} from '../config/constants.js';

// Use signature validity duration
if (timeDiff > TIME_CONSTANTS.SIGNATURE_VALID_DURATION) {
  throw new Error("Signature expired");
}

// Use validation patterns
if (!VALIDATION_CONSTANTS.PATTERNS.ADDRESS.test(address)) {
  throw new Error("Invalid address format");
}
```

### Using ABI Loader

```typescript
import { ContractInterfaces, ABILoader } from '../config/abi-loader.js';

// Use pre-configured interface
const daoInterface = ContractInterfaces.DAO;

// Load custom ABI
const customABI = ABILoader.loadABI('custom-contract');
const customInterface = ABILoader.getInterface('custom-contract');
```

### Using RPC Configuration

```typescript
import { getRpcUrl } from '../config/rpc.js';
import { ethers } from 'ethers';

// Get RPC URL (checks env vars first)
const rpcUrl = getRpcUrl('sepolia');
const provider = new ethers.JsonRpcProvider(rpcUrl);
```

## Customization

### Adding New Constants

1. **Add to appropriate section in `constants.ts`:**
```typescript
export const NEW_CONSTANTS = {
  MY_VALUE: 42,
  MY_PATTERN: /^custom-pattern$/,
} as const;
```

2. **Import and use:**
```typescript
import { NEW_CONSTANTS } from '../config/constants.js';
```

### Adding New Contract ABIs

1. **Create ABI file:**
```bash
# Create new ABI file
touch src/config/abi/my-contract.json
```

2. **Add ABI content:**
```json
[
  {
    "name": "MyEvent",
    "type": "event",
    "inputs": [...]
  }
]
```

3. **Use with ABI Loader:**
```typescript
const myInterface = ABILoader.getInterface('my-contract');
const myEvent = ABILoader.getEvent('my-contract', 'MyEvent');
```

### Environment Variables

Set custom RPC URLs via environment variables:

```bash
# .env file
MAINNET_RPC_URL=https://mainnet.infura.io/v3/YOUR_KEY
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
```

## Migration from Hardcoded Values

### Before (Hardcoded)

```typescript
// ❌ Hardcoded values scattered throughout code
const SIGNATURE_DURATION = 60 * 60 * 1000; // 1 hour
const ADDRESS_PATTERN = /^0x[a-fA-F0-9]{40}$/;
const TEST_TIMEOUT = 30000;
```

### After (Centralized)

```typescript
// ✅ Centralized configuration
import { TIME_CONSTANTS, VALIDATION_CONSTANTS } from '../config/constants.js';

const duration = TIME_CONSTANTS.SIGNATURE_VALID_DURATION;
const pattern = VALIDATION_CONSTANTS.PATTERNS.ADDRESS;
const timeout = TIME_CONSTANTS.TEST_TIMEOUT;
```

## Benefits

### 🎯 **Centralized Management**
- All constants in one location
- Easy to find and modify values
- Consistent naming conventions

### 🔧 **Maintainability**
- Single source of truth
- Reduced code duplication
- Easier refactoring

### 🛡️ **Type Safety**
- TypeScript `as const` assertions
- Compile-time validation
- IntelliSense support

### 📚 **Documentation**
- Self-documenting code
- Clear constant descriptions
- Usage examples

### 🧪 **Testing**
- Consistent test data
- Easy to modify test parameters
- Reliable integration tests

## Best Practices

1. **Use descriptive names** for constants
2. **Group related constants** together
3. **Add JSDoc comments** for complex values
4. **Use `as const`** for immutable objects
5. **Import only what you need** to reduce bundle size
6. **Document breaking changes** when modifying constants

## Troubleshooting

### Common Issues

**Issue**: `Cannot find module '../config/constants.js'`
**Solution**: Check import path and file extension

**Issue**: `Property does not exist on type`
**Solution**: Ensure proper TypeScript types and `as const` usage

**Issue**: ABI loading fails
**Solution**: Verify ABI file exists and contains valid JSON

### Debug Tips

```typescript
// Log loaded constants
console.log('Time constants:', TIME_CONSTANTS);
console.log('Available ABIs:', ABILoader.loadABI('dao-contract'));
console.log('RPC URL:', getRpcUrl('sepolia'));
```

