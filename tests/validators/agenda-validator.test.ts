import { AgendaValidator } from "../../src/validators/agenda-validator";
import { ethers } from "ethers";
import * as dotenv from "dotenv";
dotenv.config();

const valid = {
  id: 64,
  title: "Test Agenda",
  description: "desc",
  network: "sepolia",
  transaction: "0xf011feaead3f5b09beaa45d1de573f38aebdcbe0a0920ed8c8a42a2e806b2d5c",
  creator: {
    address: "0x" + "a".repeat(40),
    signature: "0x" + "b".repeat(130),
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
  ]
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
  });

  describe("getAgendaSignatureMessage", () => {
    it("should generate correct message", () => {
      const message = AgendaValidator.getAgendaSignatureMessage(123, "0xabc");
      expect(message).toBe("I am the one who submitted agenda #123 via transaction 0xabc. This signature proves that I am the one who submitted this agenda.");
    });
  });

  describe("validateAgendaSignature", () => {
    it("should validate correct signature", async () => {
      const wallet = ethers.Wallet.createRandom();
      const message = AgendaValidator.getAgendaSignatureMessage(123, "0xabc");
      const signature = await wallet.signMessage(message);
      const result = await AgendaValidator.validateAgendaSignature(123, "0xabc", signature, wallet.address);
      expect(result).toBe(true);
    });

    it("should reject incorrect signature", async () => {
      const wallet = ethers.Wallet.createRandom();
      const otherWallet = ethers.Wallet.createRandom();
      const message = AgendaValidator.getAgendaSignatureMessage(123, "0xabc");
      const signature = await wallet.signMessage(message);
      const result = await AgendaValidator.validateAgendaSignature(123, "0xabc", signature, otherWallet.address);
      expect(result).toBe(false);
    });
  });

  describe("validateTransactionSender", () => {
    it("should return true if sender matches", () => {
      const tx = { from: "0xabc" } as ethers.TransactionResponse;
      expect(AgendaValidator.validateTransactionSender(tx, "0xAbC")).toBe(true);
    });

    it("should return false if sender does not match", () => {
      const tx = { from: "0xabc" } as ethers.TransactionResponse;
      expect(AgendaValidator.validateTransactionSender(tx, "0xdef")).toBe(false);
    });

    it("should throw if tx is null", () => {
      expect(() => AgendaValidator.validateTransactionSender(null as any, "0xabc")).toThrow("Transaction not found");
    });
  });

  describe("validateAgendaIdFromEvent", () => {
    it("should return true for real event", async () => {
      if (!process.env.TEST_RPC_URL) {
        console.warn("Skipping test: TEST_RPC_URL not set");
        return;
      }

      const provider = new ethers.JsonRpcProvider(process.env.TEST_RPC_URL);
      const txHash = '0xf011feaead3f5b09beaa45d1de573f38aebdcbe0a0920ed8c8a42a2e806b2d5c';
      const expectedId = 64;
      const receipt = await provider.getTransactionReceipt(txHash);
      if (!receipt) throw new Error("Transaction receipt not found");
      expect(AgendaValidator.validateAgendaIdFromEvent(receipt, expectedId)).toBe(true);
    });

    it("should throw if receipt is null", () => {
      expect(() => AgendaValidator.validateAgendaIdFromEvent(null as any, 123)).toThrow("Transaction receipt not found");
    });
  });
});