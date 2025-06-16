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

## Environment Variables

You can customize RPC endpoints by setting environment variables:

```bash
# .env file
MAINNET_RPC_URL=https://mainnet.infura.io/v3/YOUR_KEY
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
```

**Default RPC URLs:**
- **Mainnet**: `https://ethereum.drpc.org`
- **Sepolia**: `https://sepolia.drpc.org`

---

**💡 This configuration system ensures consistent behavior across all validation processes while allowing customization when needed.**

