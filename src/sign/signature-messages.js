/**
 * 서명 메시지 템플릿 상수 (JavaScript 버전)
 *
 * 이 파일은 HTML 서명 도구에서 사용되는 메시지 템플릿을 관리합니다.
 * src/config/signature-messages.ts와 동기화되어야 합니다.
 */

/**
 * JavaScript 템플릿 리터럴용 서명 메시지 생성 함수
 */
window.SignatureMessages = {
  /**
   * 생성용 서명 메시지 생성
   */
  create: (agendaId, transactionHash, timestamp) => {
    return `I am the one who submitted agenda #${agendaId} via transaction ${transactionHash}. I am creating this metadata at ${timestamp}. This signature proves that I am the one who submitted this agenda.`;
  },

  /**
   * 업데이트용 서명 메시지 생성
   */
  update: (agendaId, transactionHash, timestamp) => {
    return `I am the one who submitted agenda #${agendaId} via transaction ${transactionHash}. I am updating this metadata at ${timestamp}. This signature proves that I am the one who can update this agenda.`;
  }
};