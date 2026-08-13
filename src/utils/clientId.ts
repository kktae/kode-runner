const CLIENT_ID_KEY = 'kode_runner_client_id';

function randomId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `c-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

let cached: string | null = null;

/**
 * 탭 단위로 유지되는 클라이언트 식별자.
 *
 * 왜 필요한가: 닉네임은 새로고침할 때마다 재생성되므로(main.ts의 랜덤 닉네임 초기화)
 * 서버의 세션 dedup 및 연결 해제 유예 타이머 키로 쓸 수 없다. 닉네임을 키로 쓰면
 * 새로고침한 플레이어의 옛 유예 타이머가 그대로 발화해 양쪽 모두에게 opponent_left가
 * 전달되고, 두 사람 다 승리 모달을 보게 된다.
 *
 * 왜 sessionStorage인가: 새로고침은 넘어서 유지되지만(= 재접속을 정확히 식별) 탭마다
 * 다르다(= 한 브라우저의 두 탭이 서로 다른 플레이어로 인식된다). localStorage였다면
 * 같은 브라우저의 두 탭이 한 명으로 합쳐져 1v1이 성립하지 않는다.
 */
export function getClientId(): string {
  if (cached) return cached;

  try {
    const stored = sessionStorage.getItem(CLIENT_ID_KEY);
    if (stored) {
      cached = stored;
      return stored;
    }
    const created = randomId();
    sessionStorage.setItem(CLIENT_ID_KEY, created);
    cached = created;
    return created;
  } catch {
    // Private mode 등 sessionStorage 접근 불가 시 메모리 한정 ID로 폴백
    cached = randomId();
    return cached;
  }
}
