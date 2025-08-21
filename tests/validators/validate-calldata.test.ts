import { ethers } from "ethers";
import { describe, it, expect, beforeEach } from "@jest/globals";

// Test the validateCalldata function logic by testing ABI decoding directly
// This tests the fix we made for the overflow error when decoding legacy transactions

describe("validateCalldata ABI decoding fix", () => {
  const testContractAddress = "0x0b55a0f463b6DEFb81c6063973763951712D0E5F";
  const testCalldata = "0x9c877e470000000000000000000000000000000000000000000000000000000000000000";

  beforeEach(() => {
    // Reset any mocks if needed
  });

  describe("Legacy format (without memo) decoding", () => {
    it("should successfully decode legacy agenda parameters", () => {
      // Create legacy format calldata (without memo string)
      const legacyCalldata = ethers.AbiCoder.defaultAbiCoder().encode(
        ["address[]", "uint128", "uint128", "bool", "bytes[]"],
        [
          [testContractAddress],
          300n, // noticePeriodSeconds
          600n, // votingPeriodSeconds  
          false, // atomicExecute
          [testCalldata]
        ]
      );

      // This should decode successfully without throwing overflow errors
      expect(() => {
        const decoded = ethers.AbiCoder.defaultAbiCoder().decode(
          ["address[]", "uint128", "uint128", "bool", "bytes[]"],
          legacyCalldata
        );
        
        expect(decoded).toBeDefined();
        expect(decoded[0]).toEqual([testContractAddress]);
        expect(decoded[1]).toBe(300n);
        expect(decoded[2]).toBe(600n);
        expect(decoded[3]).toBe(false);
        expect(decoded[4]).toEqual([testCalldata]);
      }).not.toThrow();
    });

    it("should fail when trying to decode legacy data with new format (demonstrates the original problem)", () => {
      // Create legacy format calldata (without memo string)
      const legacyCalldata = ethers.AbiCoder.defaultAbiCoder().encode(
        ["address[]", "uint128", "uint128", "bool", "bytes[]"],
        [
          [testContractAddress],
          300n,
          600n,
          false,
          [testCalldata]
        ]
      );

      // This should throw an error because there's no string data at the end
      // This is what our fix prevents by trying legacy format first
      expect(() => {
        ethers.AbiCoder.defaultAbiCoder().decode(
          ["address[]", "uint128", "uint128", "bool", "bytes[]", "string"],
          legacyCalldata
        );
      }).toThrow();
    });
  });

  describe("New format (with memo) decoding", () => {
    it("should successfully decode new agenda parameters with memo", () => {
      const testMemo = "https://github.com/tokamak-network/ton-staking-v2/issues/59";
      
      // Create new format calldata (with memo string)
      const newCalldata = ethers.AbiCoder.defaultAbiCoder().encode(
        ["address[]", "uint128", "uint128", "bool", "bytes[]", "string"],
        [
          [testContractAddress],
          300n,
          600n,
          false,
          [testCalldata],
          testMemo
        ]
      );

      // This should decode successfully
      expect(() => {
        const decoded = ethers.AbiCoder.defaultAbiCoder().decode(
          ["address[]", "uint128", "uint128", "bool", "bytes[]", "string"],
          newCalldata
        );
        
        expect(decoded).toBeDefined();
        expect(decoded[0]).toEqual([testContractAddress]);
        expect(decoded[1]).toBe(300n);
        expect(decoded[2]).toBe(600n);
        expect(decoded[3]).toBe(false);
        expect(decoded[4]).toEqual([testCalldata]);
        expect(decoded[5]).toBe(testMemo);
      }).not.toThrow();
    });

    it("should decode new data with legacy format but miss the memo", () => {
      const testMemo = "https://github.com/tokamak-network/ton-staking-v2/issues/59";
      
      // Create new format calldata (with memo string)
      const newCalldata = ethers.AbiCoder.defaultAbiCoder().encode(
        ["address[]", "uint128", "uint128", "bool", "bytes[]", "string"],
        [
          [testContractAddress],
          300n,
          600n,
          false,
          [testCalldata],
          testMemo
        ]
      );

      // ethers.js is lenient and will decode successfully but ignore extra data
      // This demonstrates why we need to try both formats
      expect(() => {
        const decoded = ethers.AbiCoder.defaultAbiCoder().decode(
          ["address[]", "uint128", "uint128", "bool", "bytes[]"],
          newCalldata
        );
        expect(decoded).toBeDefined();
        expect(decoded.length).toBe(5); // Should only have 5 elements, missing memo
      }).not.toThrow();
    });
  });

  describe("approveAndCall transaction encoding", () => {
    it("should properly encode and decode approveAndCall with legacy agenda data", () => {
      const legacyCalldata = ethers.AbiCoder.defaultAbiCoder().encode(
        ["address[]", "uint128", "uint128", "bool", "bytes[]"],
        [
          [testContractAddress],
          300n,
          600n,
          false,
          [testCalldata]
        ]
      );

      const approveAndCallInterface = new ethers.Interface([
        "function approveAndCall(address spender, uint256 amount, bytes data)"
      ]);

      // Encode approveAndCall transaction
      const encodedTx = approveAndCallInterface.encodeFunctionData("approveAndCall", [
        "0x1234567890123456789012345678901234567890", // spender
        ethers.parseEther("100"), // amount
        legacyCalldata // data
      ]);

      // Decode approveAndCall transaction
      expect(() => {
        const decodedTx = approveAndCallInterface.decodeFunctionData("approveAndCall", encodedTx);
        expect(decodedTx).toBeDefined();
        expect(decodedTx[0]).toBe("0x1234567890123456789012345678901234567890");
        expect(decodedTx[1]).toBe(ethers.parseEther("100"));
        expect(decodedTx[2]).toBe(legacyCalldata);
      }).not.toThrow();
    });

    it("should properly encode and decode approveAndCall with new agenda data", () => {
      const testMemo = "https://github.com/tokamak-network/ton-staking-v2/issues/59";
      
      const newCalldata = ethers.AbiCoder.defaultAbiCoder().encode(
        ["address[]", "uint128", "uint128", "bool", "bytes[]", "string"],
        [
          [testContractAddress],
          300n,
          600n,
          false,
          [testCalldata],
          testMemo
        ]
      );

      const approveAndCallInterface = new ethers.Interface([
        "function approveAndCall(address spender, uint256 amount, bytes data)"
      ]);

      // Encode approveAndCall transaction
      const encodedTx = approveAndCallInterface.encodeFunctionData("approveAndCall", [
        "0x1234567890123456789012345678901234567890", // spender
        ethers.parseEther("100"), // amount
        newCalldata // data
      ]);

      // Decode approveAndCall transaction
      expect(() => {
        const decodedTx = approveAndCallInterface.decodeFunctionData("approveAndCall", encodedTx);
        expect(decodedTx).toBeDefined();
        expect(decodedTx[0]).toBe("0x1234567890123456789012345678901234567890");
        expect(decodedTx[1]).toBe(ethers.parseEther("100"));
        expect(decodedTx[2]).toBe(newCalldata);
      }).not.toThrow();
    });
  });

  describe("Error handling", () => {
    it("should handle completely invalid calldata gracefully", () => {
      const invalidCalldata = "0xinvaliddata";

      // Both legacy and new format should throw, but not overflow errors
      expect(() => {
        ethers.AbiCoder.defaultAbiCoder().decode(
          ["address[]", "uint128", "uint128", "bool", "bytes[]"],
          invalidCalldata
        );
      }).toThrow();

      expect(() => {
        ethers.AbiCoder.defaultAbiCoder().decode(
          ["address[]", "uint128", "uint128", "bool", "bytes[]", "string"],
          invalidCalldata
        );
      }).toThrow();
    });

    it("should handle empty calldata gracefully", () => {
      const emptyCalldata = "0x";

      expect(() => {
        ethers.AbiCoder.defaultAbiCoder().decode(
          ["address[]", "uint128", "uint128", "bool", "bytes[]"],
          emptyCalldata
        );
      }).toThrow();

      expect(() => {
        ethers.AbiCoder.defaultAbiCoder().decode(
          ["address[]", "uint128", "uint128", "bool", "bytes[]", "string"],
          emptyCalldata
        );
      }).toThrow();
    });

    it("should handle partial calldata gracefully", () => {
      // Create partial calldata (missing some parameters)
      const partialCalldata = ethers.AbiCoder.defaultAbiCoder().encode(
        ["address[]", "uint128"],
        [
          [testContractAddress],
          300n
        ]
      );

      expect(() => {
        ethers.AbiCoder.defaultAbiCoder().decode(
          ["address[]", "uint128", "uint128", "bool", "bytes[]"],
          partialCalldata
        );
      }).toThrow();

      expect(() => {
        ethers.AbiCoder.defaultAbiCoder().decode(
          ["address[]", "uint128", "uint128", "bool", "bytes[]", "string"],
          partialCalldata
        );
      }).toThrow();
    });
  });

  describe("Decoding priority (legacy first, then new)", () => {
    it("should demonstrate the correct decoding order for our fix", () => {
      // Create legacy format data
      const legacyCalldata = ethers.AbiCoder.defaultAbiCoder().encode(
        ["address[]", "uint128", "uint128", "bool", "bytes[]"],
        [
          [testContractAddress],
          300n,
          600n,
          false,
          [testCalldata]
        ]
      );

      // Simulate our fix: try legacy first, then new
      let decoded;
      let hasMemo = false;

      try {
        // Try legacy version first (this should succeed)
        decoded = ethers.AbiCoder.defaultAbiCoder().decode(
          ["address[]", "uint128", "uint128", "bool", "bytes[]"],
          legacyCalldata
        );
      } catch (legacyError) {
        try {
          // Try new version (this should not be reached for legacy data)
          decoded = ethers.AbiCoder.defaultAbiCoder().decode(
            ["address[]", "uint128", "uint128", "bool", "bytes[]", "string"],
            legacyCalldata
          );
          hasMemo = true;
        } catch (newError) {
          throw new Error("Both decoding attempts failed");
        }
      }

      expect(decoded).toBeDefined();
      expect(hasMemo).toBe(false); // Should be false for legacy data
      expect(decoded[0]).toEqual([testContractAddress]);
    });

    it("should detect when memo is present by comparing decoded lengths", () => {
      const testMemo = "https://github.com/tokamak-network/ton-staking-v2/issues/59";
      
      // Create new format data
      const newCalldata = ethers.AbiCoder.defaultAbiCoder().encode(
        ["address[]", "uint128", "uint128", "bool", "bytes[]", "string"],
        [
          [testContractAddress],
          300n,
          600n,
          false,
          [testCalldata],
          testMemo
        ]
      );

      // Since ethers.js is lenient, we need a different approach
      // Try both decodings and compare results
      const legacyDecoded = ethers.AbiCoder.defaultAbiCoder().decode(
        ["address[]", "uint128", "uint128", "bool", "bytes[]"],
        newCalldata
      );

      const newDecoded = ethers.AbiCoder.defaultAbiCoder().decode(
        ["address[]", "uint128", "uint128", "bool", "bytes[]", "string"],
        newCalldata
      );

      expect(legacyDecoded).toBeDefined();
      expect(newDecoded).toBeDefined();
      expect(legacyDecoded.length).toBe(5); // Legacy format has 5 elements
      expect(newDecoded.length).toBe(6); // New format has 6 elements
      expect(newDecoded[5]).toBe(testMemo); // memo should be present in new format
    });
  });
});
  describe("Real-world scenario simulation", () => {
    it("should handle the exact scenario from agenda-13 (legacy format)", () => {
      // This simulates the exact data structure that caused the original overflow error
      const realContractAddress = "0x0b55a0f463b6DEFb81c6063973763951712D0E5F";
      const realCalldata = "0x9c877e470000000000000000000000000000000000000000000000000000000000000000";
      
      // Create calldata that matches the structure from agenda-13
      const legacyAgendaCalldata = ethers.AbiCoder.defaultAbiCoder().encode(
        ["address[]", "uint128", "uint128", "bool", "bytes[]"],
        [
          [realContractAddress],
          300n, // noticePeriodSeconds
          600n, // votingPeriodSeconds
          false, // atomicExecute
          [realCalldata]
        ]
      );

      // Simulate the validateCalldata logic: try legacy first, then new
      let agendaParams;
      let hasMemo = false;
      let legacyError;
      let newError;

      try {
        // Try legacy version first (should succeed)
        agendaParams = ethers.AbiCoder.defaultAbiCoder().decode(
          ["address[]", "uint128", "uint128", "bool", "bytes[]"],
          legacyAgendaCalldata
        );
      } catch (error) {
        legacyError = error;
        try {
          // Try new version (should not be needed for legacy data)
          agendaParams = ethers.AbiCoder.defaultAbiCoder().decode(
            ["address[]", "uint128", "uint128", "bool", "bytes[]", "string"],
            legacyAgendaCalldata
          );
          hasMemo = true;
        } catch (error) {
          newError = error;
        }
      }

      expect(agendaParams).toBeDefined();
      expect(legacyError).toBeUndefined(); // Legacy decoding should succeed
      expect(hasMemo).toBe(false); // Should be false for legacy data
      
      // Verify the decoded data matches expected values
      if (!agendaParams) {
        throw new Error("agendaParams should be defined");
      }
      const [addresses, noticePeriod, votingPeriod, atomicExecute, calldatas] = agendaParams;
      expect(addresses).toEqual([realContractAddress]);
      expect(noticePeriod).toBe(300n);
      expect(votingPeriod).toBe(600n);
      expect(atomicExecute).toBe(false);
      expect(calldatas).toEqual([realCalldata]);
    });

    it("should demonstrate the overflow error scenario (before our fix)", () => {
      // Create legacy format data
      const legacyAgendaCalldata = ethers.AbiCoder.defaultAbiCoder().encode(
        ["address[]", "uint128", "uint128", "bool", "bytes[]"],
        [
          ["0x0b55a0f463b6DEFb81c6063973763951712D0E5F"],
          300n,
          600n,
          false,
          ["0x9c877e470000000000000000000000000000000000000000000000000000000000000000"]
        ]
      );

      // Before our fix, this would be tried first and cause overflow/buffer overrun error
      // This demonstrates exactly the error we fixed
      expect(() => {
        ethers.AbiCoder.defaultAbiCoder().decode(
          ["address[]", "uint128", "uint128", "bool", "bytes[]", "string"],
          legacyAgendaCalldata
        );
      }).toThrow(/data out-of-bounds|BUFFER_OVERRUN/); // This is the exact error we fixed
    });

    it("should validate the complete approveAndCall + agenda flow", () => {
      // Create a complete transaction flow like in the real scenario
      const contractAddress = "0x0b55a0f463b6DEFb81c6063973763951712D0E5F";
      const calldata = "0x9c877e470000000000000000000000000000000000000000000000000000000000000000";
      
      // Step 1: Create agenda parameters (legacy format)
      const agendaCalldata = ethers.AbiCoder.defaultAbiCoder().encode(
        ["address[]", "uint128", "uint128", "bool", "bytes[]"],
        [
          [contractAddress],
          300n,
          600n,
          false,
          [calldata]
        ]
      );

      // Step 2: Create approveAndCall transaction
      const approveAndCallInterface = new ethers.Interface([
        "function approveAndCall(address spender, uint256 amount, bytes data)"
      ]);

      const txData = approveAndCallInterface.encodeFunctionData("approveAndCall", [
        "0x1234567890123456789012345678901234567890", // spender (DAO contract)
        ethers.parseEther("100"), // amount
        agendaCalldata // agenda data
      ]);

      // Step 3: Decode the transaction (simulating validateCalldata)
      const decodedTx = approveAndCallInterface.decodeFunctionData("approveAndCall", txData);
      const extractedAgendaData = decodedTx[2];

      // Step 4: Try to decode agenda parameters (our fixed logic)
      let agendaParams;
      let hasMemo = false;

      try {
        // Try legacy first (should succeed)
        agendaParams = ethers.AbiCoder.defaultAbiCoder().decode(
          ["address[]", "uint128", "uint128", "bool", "bytes[]"],
          extractedAgendaData
        );
      } catch (legacyError) {
        try {
          // Try new format
          agendaParams = ethers.AbiCoder.defaultAbiCoder().decode(
            ["address[]", "uint128", "uint128", "bool", "bytes[]", "string"],
            extractedAgendaData
          );
          hasMemo = true;
        } catch (newError) {
          throw new Error("Failed to decode agenda parameters");
        }
      }

      // Verify the complete flow worked
      expect(agendaParams).toBeDefined();
      expect(hasMemo).toBe(false);
      
      if (!agendaParams) {
        throw new Error("agendaParams should be defined");
      }
      expect(agendaParams[0]).toEqual([contractAddress]);
      expect(agendaParams[4]).toEqual([calldata]);
    });
  });