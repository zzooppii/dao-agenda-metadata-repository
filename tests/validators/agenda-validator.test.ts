import { validateSchema, validateTransactionSender, validateAgendaIdFromEvent } from "../../src/validators/agenda-validator";
import { ethers } from "ethers";

describe("agenda-validator", () => {
  describe("validateSchema", () => {
    it("should validate correct agenda metadata", () => {
      const valid = {
        id: 123,
        title: "Test Agenda",
        description: "desc",
        network: "mainnet",
        transaction: "0x" + "1".repeat(64),
        creator: {
          address: "0x" + "a".repeat(40),
          signature: "0x" + "b".repeat(130),
        },
        actions: [
          {
            title: "action",
            contractAddress: "0x" + "c".repeat(40),
            method: "do()",
            calldata: "0x1234",
            abi: [
              {
                inputs: [],
                name: "do",
                outputs: [],
                stateMutability: "nonpayable",
                type: "function",
              },
            ],
          },
        ],
      };
      const result = validateSchema(valid);
      expect(result.success).toBe(true);
    });
    it("should fail on missing required fields", () => {
      const invalid = { title: "no id" };
      const result = validateSchema(invalid);
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
          // signature 누락
        },
        actions: [
          {
            title: "action",
            contractAddress: "0x" + "c".repeat(40),
            method: "do()",
            calldata: "0x1234",
            abi: [
              {
                inputs: [],
                name: "do",
                outputs: [],
                stateMutability: "nonpayable",
                type: "function",
              },
            ],
          },
        ],
      };
      const result = validateSchema(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe("validateTransactionSender", () => {
    it("should return true if sender matches", () => {
      const tx = { from: "0xabc" } as ethers.TransactionResponse;
      expect(validateTransactionSender(tx, "0xAbC")).toBe(true);
    });
    it("should return false if sender does not match", () => {
      const tx = { from: "0xabc" } as ethers.TransactionResponse;
      expect(validateTransactionSender(tx, "0xdef")).toBe(false);
    });
    it("should throw if tx is null", () => {
      expect(() => validateTransactionSender(null as any, "0xabc")).toThrow();
    });
  });

  describe("validateAgendaIdFromEvent", () => {
    it("should return true if event id matches", () => {
      const log = {
        topics: [
          // topic0: event signature hash (mocked)
          "0x" + "1".repeat(64),
        ],
      };
      const receipt = {
        logs: [
          {
            ...log,
            // parseLog에서 id: 123 반환을 가정
          },
        ],
      } as any;
      // mock Interface
      jest.spyOn(require("../../src/validators/agenda-validator"), "iface", "get").mockReturnValue({
        getEvent: () => ({ topicHash: log.topics[0] }),
        parseLog: () => ({ args: { id: 123 } }),
      });
      expect(validateAgendaIdFromEvent(receipt, 123)).toBe(true);
    });
  });
});