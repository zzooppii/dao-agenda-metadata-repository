/**
 * 서명 메시지 템플릿 상수
 *
 * 이 파일은 DAO Agenda 메타데이터 서명에 사용되는 메시지 템플릿을 중앙에서 관리합니다.
 * 메시지 변경 시 이 파일만 수정하면 모든 곳에 반영됩니다.
 */

/**
 * 새로운 아젠다 생성 시 사용되는 서명 메시지 템플릿
 *
 * 플레이스홀더:
 * - %d: 아젠다 ID (숫자)
 * - %s: 트랜잭션 해시 (첫 번째)
 * - %s: 타임스탬프 (두 번째)
 */
export const SIGNATURE_MESSAGE_TEMPLATE_CREATE = "I am the one who submitted agenda #%d via transaction %s. I am creating this metadata at %s. This signature proves that I am the one who submitted this agenda.";

/**
 * 기존 아젠다 업데이트 시 사용되는 서명 메시지 템플릿
 *
 * 플레이스홀더:
 * - %d: 아젠다 ID (숫자)
 * - %s: 트랜잭션 해시 (첫 번째)
 * - %s: 타임스탬프 (두 번째)
 */
export const SIGNATURE_MESSAGE_TEMPLATE_UPDATE = "I am the one who submitted agenda #%d via transaction %s. I am updating this metadata at %s. This signature proves that I am the one who can update this agenda.";

/**
 * JavaScript 템플릿 리터럴용 서명 메시지 생성 함수
 */
export const SignatureMessages = {
  /**
   * 생성용 서명 메시지 생성
   */
  create: (agendaId: number, transactionHash: string, timestamp: string): string => {
    return `I am the one who submitted agenda #${agendaId} via transaction ${transactionHash}. I am creating this metadata at ${timestamp}. This signature proves that I am the one who submitted this agenda.`;
  },

  /**
   * 업데이트용 서명 메시지 생성
   */
  update: (agendaId: number, transactionHash: string, timestamp: string): string => {
    return `I am the one who submitted agenda #${agendaId} via transaction ${transactionHash}. I am updating this metadata at ${timestamp}. This signature proves that I am the one who can update this agenda.`;
  }
};

/**
 * 문서화용 템플릿 (플레이스홀더 포함)
 */
export const SIGNATURE_MESSAGE_DOCS = {
  CREATE: "I am the one who submitted agenda #<id> via transaction <tx-hash>. I am creating this metadata at <timestamp>. This signature proves that I am the one who submitted this agenda.",
  UPDATE: "I am the one who submitted agenda #<id> via transaction <tx-hash>. I am updating this metadata at <timestamp>. This signature proves that I am the one who can update this agenda."
};