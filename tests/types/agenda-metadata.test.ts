import { AgendaMetadataSchema } from "../../src/types/agenda-metadata";
import { describe, it, expect } from "@jest/globals";

describe("AgendaMetadataSchema", () => {
  const validMetadata = {
    id: 1,
    title: "Test Agenda",
    description: "Test description",
    network: "sepolia" as const,
    transaction: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef12",
    creator: {
      address: "0x1234567890abcdef1234567890abcdef12345678",
      signature: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef12"
    },
    actions: [
      {
        title: "Test Action",
        contractAddress: "0x1234567890abcdef1234567890abcdef12345678",
        method: "testMethod()",
        calldata: "0x12345678",
        abi: [
          {
            inputs: [],
            name: "testMethod",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function"
          }
        ]
      }
    ],
    createdAt: "2024-01-01T00:00:00.00Z"
  };

  it("should validate correct metadata with createdAt", () => {
    const result = AgendaMetadataSchema.safeParse(validMetadata);
    expect(result.success).toBe(true);
  });

  it("should validate metadata with both createdAt and updatedAt", () => {
    const metadataWithUpdate = {
      ...validMetadata,
      updatedAt: "2024-01-02T00:00:00.00Z"
    };
    const result = AgendaMetadataSchema.safeParse(metadataWithUpdate);
    expect(result.success).toBe(true);
  });

  it("should fail without createdAt", () => {
    const { createdAt, ...metadataWithoutCreatedAt } = validMetadata;
    const result = AgendaMetadataSchema.safeParse(metadataWithoutCreatedAt);
    expect(result.success).toBe(false);
  });

  it("should fail with invalid createdAt format", () => {
    const invalidMetadata = {
      ...validMetadata,
      createdAt: "invalid-date"
    };
    const result = AgendaMetadataSchema.safeParse(invalidMetadata);
    expect(result.success).toBe(false);
  });

  it("should fail with invalid updatedAt format", () => {
    const invalidMetadata = {
      ...validMetadata,
      updatedAt: "invalid-date"
    };
    const result = AgendaMetadataSchema.safeParse(invalidMetadata);
    expect(result.success).toBe(false);
  });

  it("should validate with Unix timestamp format (legacy support)", () => {
    const metadataWithUnixTimestamp = {
      ...validMetadata,
      createdAt: "1704067200" // Unix timestamp as string
    };
    const result = AgendaMetadataSchema.safeParse(metadataWithUnixTimestamp);
    // This should fail as we now require ISO 8601 format
    expect(result.success).toBe(false);
  });

  it("should fail with missing required fields", () => {
    const { id, ...metadataWithoutId } = validMetadata;
    const result = AgendaMetadataSchema.safeParse(metadataWithoutId);
    expect(result.success).toBe(false);
  });

  it("should fail with invalid network", () => {
    const invalidMetadata = {
      ...validMetadata,
      network: "invalid-network"
    };
    const result = AgendaMetadataSchema.safeParse(invalidMetadata);
    expect(result.success).toBe(false);
  });

  it("should fail with invalid ethereum address", () => {
    const invalidMetadata = {
      ...validMetadata,
      creator: {
        ...validMetadata.creator,
        address: "invalid-address"
      }
    };
    const result = AgendaMetadataSchema.safeParse(invalidMetadata);
    expect(result.success).toBe(false);
  });

  it("should fail with invalid transaction hash", () => {
    const invalidMetadata = {
      ...validMetadata,
      transaction: "invalid-hash"
    };
    const result = AgendaMetadataSchema.safeParse(invalidMetadata);
    expect(result.success).toBe(false);
  });

  it("should fail with empty actions array", () => {
    const invalidMetadata = {
      ...validMetadata,
      actions: []
    };
    const result = AgendaMetadataSchema.safeParse(invalidMetadata);
    expect(result.success).toBe(false);
  });
});