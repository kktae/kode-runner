import BadWordsFilter from 'badwords-ko';

const badWordsFilter = new BadWordsFilter();

// Additional Korean Profanity Regex Rules for Edge Cases
const EXTRA_KOREAN_PROFANITY_PATTERNS = [
  /시[발바빨벌발발]+|씨[발바빨벌발발]+/g,
  /개[새새끼씨끼씹]+|존[나나나맛마게]+/g,
  /병[신신씬]+|미[친친친놈년]+/g,
  /지[랄랄]+|느[금금엄마]+/g,
  /fuck|shit|bitch|bastard/gi,
];

/**
 * 한국어 욕설 필터링 및 마스킹 처리 (예: "시발" -> "소중한말")
 */
export function sanitizeMessage(input: string): string {
  if (!input) return '';
  let cleaned = input;

  try {
    cleaned = badWordsFilter.clean(cleaned);
  } catch (e) {
    // Fallback if badwords-ko fails
  }

  // Apply extra regex masking
  for (const pattern of EXTRA_KOREAN_PROFANITY_PATTERNS) {
    cleaned = cleaned.replace(pattern, '***');
  }

  return cleaned;
}

/**
 * 도배 방지 (Rate Limiter)
 */
let lastSentTimestamp = 0;
const CHAT_COOLDOWN_MS = 1000; // 1 second cooldown

export function checkChatCooldown(): { allowed: boolean; remainingMs: number } {
  const now = Date.now();
  const elapsed = now - lastSentTimestamp;

  if (elapsed < CHAT_COOLDOWN_MS) {
    return { allowed: false, remainingMs: CHAT_COOLDOWN_MS - elapsed };
  }

  lastSentTimestamp = now;
  return { allowed: true, remainingMs: 0 };
}
