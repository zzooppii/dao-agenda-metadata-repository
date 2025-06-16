import { AgendaValidator } from "../../src/validators/agenda-validator";
import { getRpcUrl, Network } from "../../src/config/rpc";
import { ethers } from "ethers";
import * as dotenv from "dotenv";
import { describe, it, expect } from "@jest/globals";
import { TIME_CONSTANTS, TEST_CONSTANTS } from "../../src/config/constants";
dotenv.config();

const abiAgendaCreate = [
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "address[]",
        "name": "targets",
        "type": "address[]"
      },
      {
        "indexed": false,
        "internalType": "uint128",
        "name": "noticePeriodSeconds",
        "type": "uint128"
      },
      {
        "indexed": false,
        "internalType": "uint128",
        "name": "votingPeriodSeconds",
        "type": "uint128"
      },
      {
        "indexed": false,
        "internalType": "bool",
        "name": "atomicExecute",
        "type": "bool"
      }
    ],
    "name": "AgendaCreated",
    "type": "event"
  }
]

const valid = {
  id: 64,
  title: "Test Agenda",
  description: "desc",
  network: "sepolia",
  transaction: "0xf011feaead3f5b09beaa45d1de573f38aebdcbe0a0920ed8c8a42a2e806b2d5c",
  creator: {
    address: "0xc1eba383D94c6021160042491A5dfaF1d82694E6",
    signature: "0xbed3d0da012a44827cdc530ec68198ff4d4034e68afc44d89b9517e85cf34d7e6adf261df4a07a512fee9c659ce5d5f72465a3f777bca97759fc8fec1c830a5c1b"
  },
  actions: [
    {
      "title": "updateSeigniorageLayer(address)",
      "contractAddress": "0x2320542ae933FbAdf8f5B97cA348c7CeDA90fAd7",
      "method": "updateSeigniorageLayer(address)",
      "calldata": "0x1e1f0b60000000000000000000000000f078ae62ea4740e19ddf6c0c5e17ecdb820bbee1",
      "abi": [
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "layer2",
              "type": "address"
            }
          ],
          "name": "updateSeigniorageLayer",
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
      "id": "1747210004619",
      "type": "Custom"
    },
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
      "id": "1747210034678",
      "type": "Custom"
    }
  ],
      createdAt: "2024-01-01T00:00:00.00Z"
};

describe("AgendaValidator", () => {
  describe("validateSchema", () => {
    it("should validate correct agenda metadata", () => {
      const result = AgendaValidator.validateSchema(valid);
      expect(result.success).toBe(true);
    });

    it("should fail on missing required fields", () => {
      const invalid = { title: "no id" };
      const result = AgendaValidator.validateSchema(invalid);
      expect(result.success).toBe(false);
    });

    it("should fail if creator.signature is missing", () => {
      const invalid = {
        id: 123,
        title: "Test Agenda",
        description: "desc",
        network: "mainnet",
        transaction: "0x" + "1".repeat(64),
        creator: {
          address: "0x" + "a".repeat(40)
        },
        actions: []
      };
      const result = AgendaValidator.validateSchema(invalid);
      expect(result.success).toBe(false);
    });

    it("should fail with invalid network", () => {
      const invalid = { ...valid, network: "invalid_network" };
      const result = AgendaValidator.validateSchema(invalid);
      expect(result.success).toBe(false);
    });

    it("should fail with invalid transaction hash format", () => {
      const invalid = { ...valid, transaction: "0xinvalid" };
      const result = AgendaValidator.validateSchema(invalid);
      expect(result.success).toBe(false);
    });

    it("should fail with invalid signature format", () => {
      const invalid = {
        ...valid,
        creator: {
          ...valid.creator,
          signature: "0xinvalid"
        }
      };
      const result = AgendaValidator.validateSchema(invalid);
      expect(result.success).toBe(false);
    });

    it("should fail with invalid ABI format", () => {
      const invalid = {
        ...valid,
        actions: [{
          ...valid.actions[0],
          abi: [{ invalid: "format" }]
        }]
      };
      const result = AgendaValidator.validateSchema(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe("getAgendaSignatureMessage", () => {
    it("should generate correct message for creation", () => {
          const timestamp = "2024-01-01T00:00:00.00Z";
    const message = AgendaValidator.getAgendaSignatureMessage(123, "0xabc", timestamp, false);
    expect(message).toBe("I am the one who submitted agenda #123 via transaction 0xabc. I am creating this metadata at 2024-01-01T00:00:00.00Z. This signature proves that I am the one who submitted this agenda.");
    });

    it("should generate correct message for update", () => {
          const timestamp = "2024-01-01T00:00:00.00Z";
    const message = AgendaValidator.getAgendaSignatureMessage(123, "0xabc", timestamp, true);
    expect(message).toBe("I am the one who submitted agenda #123 via transaction 0xabc. I am updating this metadata at 2024-01-01T00:00:00.00Z. This signature proves that I am the one who can update this agenda.");
    });
  });

  describe("validateSignatureTimestamp", () => {
    it("should validate recent timestamp", () => {
      const recentTimestamp = new Date().toISOString();
      const result = AgendaValidator.validateSignatureTimestamp(recentTimestamp);
      expect(result).toBe(true);
    });

    it("should reject expired timestamp", () => {
      const expiredTimestamp = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(); // 2시간 전
      const result = AgendaValidator.validateSignatureTimestamp(expiredTimestamp);
      expect(result).toBe(false);
    });

    it("should reject invalid timestamp format", () => {
      const result = AgendaValidator.validateSignatureTimestamp("invalid-timestamp");
      expect(result).toBe(false);
    });
  });

  describe("validateAgendaSignature", () => {
    it("should validate correct signature with timestamp", async () => {
      const wallet = ethers.Wallet.createRandom();
      const timestamp = new Date().toISOString();
      const message = AgendaValidator.getAgendaSignatureMessage(valid.id, valid.transaction, timestamp, false);
      const signature = await wallet.signMessage(message);
      const testMetadata = {
        ...valid,
        network: "sepolia" as const,
        creator: { address: wallet.address, signature },
        createdAt: timestamp
      };
      const result = await AgendaValidator.validateAgendaSignature(testMetadata, false);
      expect(result).toBe(true);
    });

    it("should reject incorrect signature", async () => {
      const wallet = ethers.Wallet.createRandom();
      const otherWallet = ethers.Wallet.createRandom();
      const timestamp = new Date().toISOString();
      const message = AgendaValidator.getAgendaSignatureMessage(valid.id, valid.transaction, timestamp, false);
      const signature = await wallet.signMessage(message);
      const testMetadata = {
        ...valid,
        network: "sepolia" as const,
        creator: { address: otherWallet.address, signature },
        createdAt: timestamp
      };
      const result = await AgendaValidator.validateAgendaSignature(testMetadata, false);
      expect(result).toBe(false);
    });

    it("should reject invalid signature format", async () => {
      const timestamp = new Date().toISOString();
      const testMetadata = {
        ...valid,
        network: "sepolia" as const,
        creator: { address: valid.creator.address, signature: "0xinvalid" },
        createdAt: timestamp
      };
      const result = await AgendaValidator.validateAgendaSignature(testMetadata, false);
      expect(result).toBe(false);
    });

    it("should reject expired signature", async () => {
      const wallet = ethers.Wallet.createRandom();
      const expiredTimestamp = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(); // 2시간 전
      const message = AgendaValidator.getAgendaSignatureMessage(valid.id, valid.transaction, expiredTimestamp, false);
      const signature = await wallet.signMessage(message);
      const testMetadata = {
        ...valid,
        network: "sepolia" as const,
        creator: { address: wallet.address, signature },
        createdAt: expiredTimestamp
      };
      const result = await AgendaValidator.validateAgendaSignature(testMetadata, false);
      expect(result).toBe(false);
    });
  });

  describe("validateTransactionSender", () => {
    it("should return true if sender matches", () => {
      const tx = { from: valid.creator.address, to: "0x123" } as any;
      expect(AgendaValidator.validateTransactionSender(tx, valid.creator.address)).toBe(true);
    });

    it("should return false if sender does not match", () => {
      const tx = { from: "0x" + "b".repeat(40), to: "0x123" } as any;
      expect(AgendaValidator.validateTransactionSender(tx, valid.creator.address)).toBe(false);
    });

    it("should throw if tx is null", () => {
      expect(() => AgendaValidator.validateTransactionSender(null as any, valid.creator.address)).toThrow("Transaction not found");
    });

    it("should handle case-insensitive address comparison", () => {
      const tx = { from: valid.creator.address.toUpperCase(), to: "0x123" } as any;
      expect(AgendaValidator.validateTransactionSender(tx, valid.creator.address.toLowerCase())).toBe(true);
    });
  });

  describe("validateAgendaIdFromEvent", () => {
    describe("unit tests", () => {
      it("should throw if receipt is null", () => {
        expect(() => AgendaValidator.validateAgendaIdFromEvent(null as any, valid.id)).toThrow("Transaction receipt not found");
      });

      it("should return false if no events found", () => {
        const mockReceipt = {
          logs: [],
          blockNumber: 0,
          blockHash: "0x",
          transactionHash: valid.transaction,
          transactionIndex: 0,
          from: valid.creator.address,
          to: "0x",
          contractAddress: null,
          cumulativeGasUsed: 0,
          gasUsed: 0,
          effectiveGasPrice: 0,
          status: 1,
          type: 0
        } as unknown as ethers.TransactionReceipt;
        expect(() => AgendaValidator.validateAgendaIdFromEvent(mockReceipt as any, valid.id)).toThrow("AgendaCreated event not found in transaction logs");
      });

                  it("should successfully validate AgendaCreated event with correct format", () => {
        // Use the updated AgendaCreated event signature
        const eventSignature = "event AgendaCreated(address indexed from, uint256 indexed id, address[] targets, uint128 noticePeriodSeconds, uint128 votingPeriodSeconds, bool atomicExecute)";
        const iface = new ethers.Interface([eventSignature]);
        const event = iface.getEvent("AgendaCreated");
        if (!event) throw new Error("Event not found");

        // Create mock receipt with correct AgendaCreated event structure
        const mockReceipt = {
          logs: [{
            topics: [
              event.topicHash,
              ethers.zeroPadValue(valid.creator.address, 32), // from (creator) as indexed parameter
              ethers.zeroPadValue(ethers.toBeHex(BigInt(valid.id)), 32) // id as indexed parameter
            ],
            // Properly encoded data for non-indexed parameters
            data: ethers.AbiCoder.defaultAbiCoder().encode(
              ["address[]", "uint128", "uint128", "bool"],
              [
                [valid.actions[0].contractAddress],
                300, // noticePeriodSeconds
                600, // votingPeriodSeconds
                false // atomicExecute
              ]
            )
          }]
        };

        // This should return true for valid event
        const result = AgendaValidator.validateAgendaIdFromEvent(mockReceipt as any, valid.id);
        expect(result).toBe(true);
      });

      it("should throw when AgendaCreated event not found in logs", () => {
        const mockReceipt = {
          logs: [{
            topics: ["0xinvalidtopic"],
            data: "0xinvaliddata"
          }]
        };

        expect(() => AgendaValidator.validateAgendaIdFromEvent(mockReceipt as any, valid.id))
          .toThrow("AgendaCreated event not found");
      });

      it("should return false when agenda ID in event doesn't match expected ID", () => {
        const eventSignature = "event AgendaCreated(address indexed from, uint256 indexed id, address[] targets, uint128 noticePeriodSeconds, uint128 votingPeriodSeconds, bool atomicExecute)";
        const iface = new ethers.Interface([eventSignature]);
        const event = iface.getEvent("AgendaCreated");
        if (!event) throw new Error("Event not found");

        // Create mock receipt with DIFFERENT agenda ID
        const wrongAgendaId = "999";
        const mockReceipt = {
          logs: [{
            topics: [
              event.topicHash,
              ethers.zeroPadValue(valid.creator.address, 32), // from (creator) as indexed parameter
              ethers.zeroPadValue(ethers.toBeHex(BigInt(wrongAgendaId)), 32) // Wrong id
            ],
            data: ethers.AbiCoder.defaultAbiCoder().encode(
              ["address[]", "uint128", "uint128", "bool"],
              [
                [valid.actions[0].contractAddress],
                300, // noticePeriodSeconds
                600, // votingPeriodSeconds
                false // atomicExecute
              ]
            )
          }]
        };

        // This should return false for mismatched agenda ID
        const result = AgendaValidator.validateAgendaIdFromEvent(mockReceipt as any, valid.id);
        expect(result).toBe(false);
      });

      it("should throw when event data is malformed", () => {
        const eventSignature = "event AgendaCreated(address indexed from, uint256 indexed id, address[] targets, uint128 noticePeriodSeconds, uint128 votingPeriodSeconds, bool atomicExecute)";
        const iface = new ethers.Interface([eventSignature]);
        const event = iface.getEvent("AgendaCreated");
        if (!event) throw new Error("Event not found");

        // Create mock receipt with malformed data
        const mockReceipt = {
          logs: [{
            topics: [
              event.topicHash,
              ethers.zeroPadValue(valid.creator.address, 32), // from (creator) as indexed parameter
              ethers.zeroPadValue(ethers.toBeHex(BigInt(valid.id)), 32) // id as indexed parameter
            ],
            data: "0xinvaliddata" // Malformed data that can't be decoded
          }]
        };

        expect(() => AgendaValidator.validateAgendaIdFromEvent(mockReceipt as any, valid.id))
          .toThrow(/Failed to parse AgendaCreated event log/);
      });

      it("should throw when receipt has no logs", () => {
        const mockReceipt = {
          logs: []
        };

        expect(() => AgendaValidator.validateAgendaIdFromEvent(mockReceipt as any, valid.id))
          .toThrow("AgendaCreated event not found");
      });

      it("should throw when receipt is null or undefined", () => {
        expect(() => AgendaValidator.validateAgendaIdFromEvent(null as any, valid.id))
          .toThrow();

        expect(() => AgendaValidator.validateAgendaIdFromEvent(undefined as any, valid.id))
          .toThrow();
      });
    });

    describe("integration tests", () => {
                  it("should return true for real event (requires network access)", async () => {
        // Use real Sepolia agenda data from constants for integration testing
        const { AGENDA_ID, TRANSACTION_HASH, NETWORK } = TEST_CONSTANTS.SEPOLIA_TEST_DATA;

        const rpcUrl = getRpcUrl(NETWORK);
        const provider = new ethers.JsonRpcProvider(rpcUrl);
        const receipt = await provider.getTransactionReceipt(TRANSACTION_HASH);
        if (!receipt) throw new Error("Transaction receipt not found");

        const result = AgendaValidator.validateAgendaIdFromEvent(receipt as any, AGENDA_ID);
        expect(result).toBe(true);
      }, TIME_CONSTANTS.TEST_TIMEOUT);
    });
  });
});