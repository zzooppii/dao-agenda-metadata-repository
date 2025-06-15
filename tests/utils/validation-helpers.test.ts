import { parsePrTitle, normalizeAddress, arraysEqual } from "../../src/utils/validation-helpers";
import { describe, it, expect } from "@jest/globals";

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
});