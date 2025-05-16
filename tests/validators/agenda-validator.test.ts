import { AgendaValidator } from "../../src/validators/agenda-validator.js";
import { ethers } from "ethers";
import * as dotenv from "dotenv";
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
    it("should generate correct message", () => {
      const message = AgendaValidator.getAgendaSignatureMessage(123, "0xabc");
      expect(message).toBe("I am the one who submitted agenda #123 via transaction 0xabc. This signature proves that I am the one who submitted this agenda.");
    });
  });

  describe("validateAgendaSignature", () => {
    it("should validate correct signature", async () => {
      const wallet = ethers.Wallet.createRandom();
      const message = AgendaValidator.getAgendaSignatureMessage(valid.id, valid.transaction);
      const signature = await wallet.signMessage(message);
      const result = await AgendaValidator.validateAgendaSignature(valid.id, valid.transaction, signature, wallet.address);
      expect(result).toBe(true);
    });

    it("should reject incorrect signature", async () => {
      const wallet = ethers.Wallet.createRandom();
      const otherWallet = ethers.Wallet.createRandom();
      const message = AgendaValidator.getAgendaSignatureMessage(valid.id, valid.transaction);
      const signature = await wallet.signMessage(message);
      const result = await AgendaValidator.validateAgendaSignature(valid.id, valid.transaction, signature, otherWallet.address);
      expect(result).toBe(false);
    });

    it("should reject invalid signature format", async () => {
      const result = await AgendaValidator.validateAgendaSignature(valid.id, valid.transaction, "0xinvalid", valid.creator.address);
      expect(result).toBe(false);
    });
  });

  describe("validateTransactionSender", () => {
    it("should return true if sender matches", () => {
      const tx = { from: valid.creator.address } as ethers.TransactionResponse;
      expect(AgendaValidator.validateTransactionSender(tx, valid.creator.address)).toBe(true);
    });

    it("should return false if sender does not match", () => {
      const tx = { from: "0x" + "b".repeat(40) } as ethers.TransactionResponse;
      expect(AgendaValidator.validateTransactionSender(tx, valid.creator.address)).toBe(false);
    });

    it("should throw if tx is null", () => {
      expect(() => AgendaValidator.validateTransactionSender(null as any, valid.creator.address)).toThrow("Transaction not found");
    });

    it("should handle case-insensitive address comparison", () => {
      const tx = { from: valid.creator.address.toUpperCase() } as ethers.TransactionResponse;
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
        expect(() => AgendaValidator.validateAgendaIdFromEvent(mockReceipt, valid.id)).toThrow("AgendaCreated event not found in transaction logs");
      });

      it("should throw when event log format is invalid", () => {
        const eventSignature = "event AgendaCreated(address indexed from,uint256 indexed id,address[] targets,uint128 noticePeriodSeconds,uint128 votingPeriodSeconds,bool atomicExecute)";
        const iface = new ethers.Interface([eventSignature]);
        const event = iface.getEvent("AgendaCreated");
        if (!event) throw new Error("Event not found");

        // 실제 이벤트 로그 형식과 다른 mockReceipt 생성
        const mockReceipt = {
          logs: [{
            topics: [
              event.topicHash,
              ethers.zeroPadValue(valid.creator.address, 32),
              ethers.zeroPadValue(ethers.toBeHex(valid.id), 32)
            ],
            data: ethers.AbiCoder.defaultAbiCoder().encode(
              ["address[]", "uint128", "uint128", "bool"],
              [[valid.actions[0].contractAddress], 0, 0, false]
            )
          }],
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

        expect(() => AgendaValidator.validateAgendaIdFromEvent(mockReceipt, valid.id)).toThrow("Failed to parse AgendaCreated event log. Error: Do not know how to serialize a BigInt");
      });
    });

    describe("integration tests", () => {
      it("should return true for real event", async () => {
        const rpcUrl = valid.network === "mainnet" ? process.env.MAINNET_RPC_URL : process.env.SEPOLIA_RPC_URL;
        if (!rpcUrl) {
          console.warn(`Skipping test: ${valid.network.toUpperCase()}_RPC_URL not set`);
          return;
        }

        const provider = new ethers.JsonRpcProvider(rpcUrl);
        const receipt = await provider.getTransactionReceipt(valid.transaction);
        if (!receipt) throw new Error("Transaction receipt not found");
        expect(AgendaValidator.validateAgendaIdFromEvent(receipt, valid.id)).toBe(true);
      });
    });
  });
});