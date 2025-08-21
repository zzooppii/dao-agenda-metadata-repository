import { parsePrTitle, normalizeAddress, arraysEqual, detectVersionByOffset, validateUint128, formatBigInt } from "../../src/utils/validation-helpers";
import { describe, it, expect } from "@jest/globals";
import { ethers } from "ethers";

describe("validation-helpers", () => {
  describe("parsePrTitle", () => {
    it("should parse create PR title correctly", () => {
      const result = parsePrTitle("[Agenda] sepolia - 123 - Test Agenda Title");
      expect(result).toEqual({
        network: "sepolia",
        id: 123,
        title: "Test Agenda Title",
        isUpdate: false
      });
    });

    it("should parse update PR title correctly", () => {
      const result = parsePrTitle("[Agenda Update] mainnet - 456 - Updated Title");
      expect(result).toEqual({
        network: "mainnet",
        id: 456,
        title: "Updated Title",
        isUpdate: true
      });
    });

    it("should handle extra spaces", () => {
      const result = parsePrTitle("[Agenda]   sepolia   -   123   -   Test Title");
      expect(result).toEqual({
        network: "sepolia",
        id: 123,
        title: "Test Title",
        isUpdate: false
      });
    });

    it("should return null for invalid format", () => {
      expect(parsePrTitle("Invalid PR Title")).toBeNull();
      expect(parsePrTitle("[Agenda] invalid-network - 123 - Title")).toBeNull();
      expect(parsePrTitle("[Agenda] sepolia - abc - Title")).toBeNull();
      expect(parsePrTitle("[Wrong] sepolia - 123 - Title")).toBeNull();
    });

    it("should handle long titles", () => {
      const longTitle = "This is a very long agenda title that contains multiple words and should be parsed correctly";
      const result = parsePrTitle(`[Agenda] mainnet - 999 - ${longTitle}`);
      expect(result).toEqual({
        network: "mainnet",
        id: 999,
        title: longTitle,
        isUpdate: false
      });
    });
  });

  describe("normalizeAddress", () => {
    it("should convert address to lowercase", () => {
      const address = "0xABCDEF1234567890ABCDEF1234567890ABCDEF12";
      const result = normalizeAddress(address);
      expect(result).toBe("0xabcdef1234567890abcdef1234567890abcdef12");
    });

    it("should handle already lowercase address", () => {
      const address = "0xabcdef1234567890abcdef1234567890abcdef12";
      const result = normalizeAddress(address);
      expect(result).toBe(address);
    });
  });

  describe("arraysEqual", () => {
    it("should return true for equal arrays", () => {
      expect(arraysEqual([1, 2, 3], [1, 2, 3])).toBe(true);
      expect(arraysEqual(["a", "b"], ["a", "b"])).toBe(true);
      expect(arraysEqual([], [])).toBe(true);
    });

    it("should return false for different arrays", () => {
      expect(arraysEqual([1, 2, 3], [1, 2, 4])).toBe(false);
      expect(arraysEqual([1, 2], [1, 2, 3])).toBe(false);
      expect(arraysEqual(["a"], ["b"])).toBe(false);
    });

    it("should return false for different order", () => {
      expect(arraysEqual([1, 2, 3], [3, 2, 1])).toBe(false);
    });
  });

  describe("detectVersionByOffset", () => {
    // 테스트용 콜데이터 생성 헬퍼
    function createTestCallData(isNewVersion: boolean): string {
      const addresses = ["0x1234567890123456789012345678901234567890"];
      const value = 1000;
      const deadline = 2000;
      const emergency = false;
      const calldatas = ["0xabcdef"];

      if (isNewVersion) {
        const memo = "https://example.com/proposal";
        return ethers.AbiCoder.defaultAbiCoder().encode(
          ["address[]", "uint128", "uint128", "bool", "bytes[]", "string"],
          [addresses, value, deadline, emergency, calldatas, memo]
        );
      } else {
        return ethers.AbiCoder.defaultAbiCoder().encode(
          ["address[]", "uint128", "uint128", "bool", "bytes[]"],
          [addresses, value, deadline, emergency, calldatas]
        );
      }
    }

    it("should detect legacy version correctly", () => {
      const legacyCallData = createTestCallData(false);
      const result = detectVersionByOffset(legacyCallData);
      expect(result).toBe('legacy');
    });

    it("should detect new version correctly", () => {
      const newCallData = createTestCallData(true);
      const result = detectVersionByOffset(newCallData);
      expect(result).toBe('new');
    });

    it("should return unknown for invalid calldata", () => {
      const invalidCallData = "0x1234"; // 너무 짧은 데이터
      const result = detectVersionByOffset(invalidCallData);
      expect(result).toBe('unknown');
    });

    it("should return unknown for empty calldata", () => {
      const emptyCallData = "0x";
      const result = detectVersionByOffset(emptyCallData);
      expect(result).toBe('unknown');
    });

    it("should handle calldata with invalid 6th parameter offset", () => {
      // 6번째 파라미터 위치에 유효하지 않은 오프셋이 있는 경우
      const legacyCallData = createTestCallData(false);
      const result = detectVersionByOffset(legacyCallData);
      expect(result).toBe('legacy'); // 6번째 파라미터가 무효하므로 legacy로 판단
    });

    it("should validate string offset range correctly", () => {
      const newCallData = createTestCallData(true);
      const result = detectVersionByOffset(newCallData);
      expect(result).toBe('new'); // 유효한 string 오프셋이므로 new로 판단
    });
  });

  describe("validateUint128", () => {
    it("should validate valid uint128 values", () => {
      expect(validateUint128(0n)).toBe(true);
      expect(validateUint128(1000n)).toBe(true);
      expect(validateUint128(BigInt("340282366920938463463374607431768211455"))).toBe(true); // 2^128 - 1
    });

    it("should reject values outside uint128 range", () => {
      expect(validateUint128(-1n)).toBe(false);
      expect(validateUint128(BigInt("340282366920938463463374607431768211456"))).toBe(false); // 2^128
    });
  });

  describe("formatBigInt", () => {
    it("should format small BigInt values normally", () => {
      expect(formatBigInt(1000n)).toBe("1000");
      expect(formatBigInt(0n)).toBe("0");
    });

    it("should truncate very large BigInt values", () => {
      const largeValue = BigInt("1234567890123456789012345678901234567890123456789012345678901234567890");
      const result = formatBigInt(largeValue);
      expect(result).toContain("...");
      expect(result.length).toBe(50);
    });
  });
});