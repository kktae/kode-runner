const HTML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

/**
 * innerHTML 템플릿에 사용자 입력(닉네임, 채팅, 리더보드 이름, 방 코드)을
 * 삽입하기 전 반드시 통과시켜야 하는 HTML 이스케이프 헬퍼.
 */
export function escapeHtml(value: unknown): string {
  if (value === null || value === undefined) return '';
  return String(value).replace(/[&<>"']/g, (ch) => HTML_ESCAPES[ch]);
}
