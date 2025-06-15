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