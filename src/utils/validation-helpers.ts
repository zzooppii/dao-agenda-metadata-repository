import { Network } from "../config/rpc.js";

// 정규식 상수 정의
export const PATTERNS = {
  AGENDA_FILE: /^agenda-(\d+)\.json$/,
  AGENDA_PATH: /^data\/agendas\/(mainnet|sepolia)\//,
  PR_TITLE_CREATE: /^\[Agenda\]\s+(mainnet|sepolia)\s*-\s*(\d+)\s*-\s*(.+)$/,
  PR_TITLE_UPDATE: /^\[Agenda Update\]\s+(mainnet|sepolia)\s*-\s*(\d+)\s*-\s*(.+)$/,
  ETH_ADDRESS: /^0x[a-fA-F0-9]{40}$/,
  TRANSACTION_HASH: /^0x[a-fA-F0-9]{64}$/,
  SIGNATURE: /^0x[a-fA-F0-9]{130}$/
} as const;

// 네트워크 상수
export const NETWORKS: Network[] = ["mainnet", "sepolia"];

// PR 제목 정보 타입
export interface PrTitleInfo {
  network: Network;
  id: number;
  title: string;
  isUpdate: boolean;
}

/**
 * 주소를 정규화합니다 (소문자로 변환)
 */
export function normalizeAddress(address: string): string {
  return address.toLowerCase();
}

/**
 * 두 배열이 같은지 효율적으로 비교합니다
 */
export function arraysEqual<T>(a: T[], b: T[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

/**
 * PR 제목을 파싱하여 네트워크, ID, 제목, 생성/업데이트 여부를 추출합니다
 */
export function parsePrTitle(prTitle: string): PrTitleInfo | null {
  // 생성 패턴 먼저 확인
  const createMatch = prTitle.match(PATTERNS.PR_TITLE_CREATE);
  if (createMatch) {
    return {
      network: createMatch[1] as Network,
      id: Number(createMatch[2]),
      title: createMatch[3].trim(),
      isUpdate: false
    };
  }

  // 업데이트 패턴 확인
  const updateMatch = prTitle.match(PATTERNS.PR_TITLE_UPDATE);
  if (updateMatch) {
    return {
      network: updateMatch[1] as Network,
      id: Number(updateMatch[2]),
      title: updateMatch[3].trim(),
      isUpdate: true
    };
  }

  return null;
}

/**
 * Detect calldata version by analyzing ABI encoding offset patterns
 */
// Validate uint128 range (0 to 2^128 - 1)
export function validateUint128(value: bigint): boolean {
  const MAX_UINT128 = BigInt('0xffffffffffffffffffffffffffffffff'); // 2^128 - 1
  return value >= 0n && value <= MAX_UINT128;
}

// Format BigInt for display
export function formatBigInt(value: bigint): string {
  const valueStr = value.toString();
  return valueStr.length > 50 ? `${valueStr.substring(0, 47)}...` : valueStr;
}

export function detectVersionByOffset(callData: string): 'new' | 'legacy' | 'unknown' {
  try {
    // Remove 0x prefix
    const hexData = callData.slice(2);
    const totalBytes = hexData.length / 2;

    // Minimum length check for legacy version (5 parameters * 32 bytes = 160 bytes)
    if (totalBytes < 160) {
      return 'unknown';
    }

    // Read parameter offsets/values
    const addressArrayOffset = parseInt(hexData.slice(0, 64), 16);
    const value = BigInt('0x' + hexData.slice(64, 128));
    const deadline = BigInt('0x' + hexData.slice(128, 192));
    const emergency = parseInt(hexData.slice(192, 256), 16) !== 0;
    const bytesArrayOffset = parseInt(hexData.slice(256, 320), 16);

    // Check if there's a 6th parameter (string offset)
    let stringOffset = 0;
    if (totalBytes >= 192) { // 6 parameters * 32 bytes = 192 bytes minimum
      stringOffset = parseInt(hexData.slice(320, 384), 16);

      // Validate string offset - it should be reasonable (after header + data)
      // Minimum offset should be after the header (6 * 32 = 192 bytes)
      if (stringOffset >= 192 && stringOffset < totalBytes) {
        return 'new';
      }
    }

    // Analyze bytes[] array to see if there's data after it
    if (bytesArrayOffset > 0 && bytesArrayOffset < totalBytes) {
      // Read bytes[] array length
      const bytesArrayLengthPos = bytesArrayOffset * 2;
      if (bytesArrayLengthPos + 64 <= hexData.length) {
        const bytesArrayLength = parseInt(hexData.slice(bytesArrayLengthPos, bytesArrayLengthPos + 64), 16);

        // Enhanced heuristic: handle both short and long calldata
        if (totalBytes >= 160) {
          // Check if 6th parameter offset is valid (for any length)
          if (stringOffset >= 192 && stringOffset < totalBytes) {
            return 'new';
          } else {
            // 6th parameter is invalid, likely legacy
            return 'legacy';
          }
        } else {
          return 'unknown';
        }
      }
    }

    // If bytes[] offset is invalid (out of bounds), it's likely corrupted data
    if (bytesArrayOffset >= totalBytes) {
      return 'unknown';
    }

    return 'unknown';

  } catch (error) {
    console.error("❌ Error analyzing calldata structure:", error);
    return 'unknown';
  }
}