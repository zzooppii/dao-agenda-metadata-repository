/**
 * Application Constants Configuration
 * Centralized configuration for all hardcoded values
 */

// Time-related constants
export const TIME_CONSTANTS = {
  /** Signature validity duration in milliseconds (1 hour) */
  SIGNATURE_VALID_DURATION: 60 * 60 * 1000,

  /** Test timeout duration in milliseconds (30 seconds) */
  TEST_TIMEOUT: 30000,

  /** UI timeout for animations in milliseconds */
  UI_ANIMATION_TIMEOUT: 2000,
} as const;

// Network configuration is handled in src/config/rpc.ts

// Validation constants
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

// Test data constants
export const TEST_CONSTANTS = {
  /** Real blockchain data for integration tests */
  SEPOLIA_TEST_DATA: {
    AGENDA_ID: 101,
    TRANSACTION_HASH: "0xb054fd4b9ac78eddf5b2a84eda9424842f0479992b57c530499ab3c985bee9d2",
    NETWORK: "sepolia" as const
  }
} as const;

// Error message templates
export const ERROR_MESSAGES = {
  INVALID_SIGNATURE_FORMAT: (signature: string) =>
    `Invalid signature format: ${signature}. Expected 0x followed by 130 hex characters.`,
  INVALID_ADDRESS_FORMAT: (address: string) =>
    `Invalid address format: ${address}. Expected 0x followed by 40 hex characters.`,
  INVALID_TRANSACTION_HASH_FORMAT: (hash: string) =>
    `Invalid transaction hash format: ${hash}. Expected 0x followed by 64 hex characters.`,
  SIGNATURE_EXPIRED: (signatureTime: string, currentTime: string) =>
    `Signature has expired. Signature time: ${signatureTime}, Current time: ${currentTime}. Signatures must be created within ${TIME_CONSTANTS.SIGNATURE_VALID_DURATION / (60 * 60 * 1000)} hour(s).`,
  INVALID_TIMESTAMP: (timestamp: string) =>
    `Invalid timestamp format: ${timestamp}. Expected ISO 8601 format.`,
  SIGNATURE_MISMATCH: (recovered: string, expected: string) =>
    `Signature does not match expected address. Recovered: ${recovered}, Expected: ${expected}`,
  SENDER_MISMATCH: (actual: string, expected: string) =>
    `Transaction sender does not match expected address. Actual: ${actual}, Expected: ${expected}`,
  AGENDA_ID_MISMATCH: (actual: number, expected: number) =>
    `Agenda ID from event does not match metadata. Event: ${actual}, Metadata: ${expected}`,
  INVALID_EVENT_DATA: (error: string) =>
    `Failed to parse event data: ${error}`,
} as const;

// Signature message templates
export const SIGNATURE_MESSAGES = {
  CREATE: (agendaId: number, txHash: string, timestamp: string) =>
    `I am the one who submitted agenda #${agendaId} via transaction ${txHash}. I am creating this metadata at ${timestamp}. This signature proves that I am the one who submitted this agenda.`,
  UPDATE: (agendaId: number, txHash: string, timestamp: string) =>
    `I am the one who submitted agenda #${agendaId} via transaction ${txHash}. I am updating this metadata at ${timestamp}. This signature proves that I am the one who can update this agenda.`,
} as const;