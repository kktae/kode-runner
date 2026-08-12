const KAKAO_FRIENDS = [
  '라이언',
  '어피치',
  '춘식이',
  '무지',
  '프로도',
  '네오',
  '튜브',
  '콘',
  '제이지',
];

const ADJECTIVES = [
  '신난',
  '신중한',
  '빠른',
  '재빠른',
  '기발한',
  '용감한',
  '즐거운',
  '멋진',
  '화려한',
  '탁월한',
  '빛나는',
  '스마트한',
  '유쾌한',
  '상큼한',
  'vibe높은',
];

/**
  * 한글 형용사 + 카카오프렌즈 캐릭터 + 2자리 난수 조합 한글 닉네임 생성
  * 예: 신난라이언48, 기발한춘식이72
  */
export function generateKoreanNickname(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const friend = KAKAO_FRIENDS[Math.floor(Math.random() * KAKAO_FRIENDS.length)];
  const num = Math.floor(10 + Math.random() * 90);
  return `${adj}${friend}${num}`;
}

/**
  * 4자리 정수 방 코드 생성 (1000 ~ 9999)
  * 예: 4829, 1024
  */
export function generate4DigitRoomCode(): string {
  const code = Math.floor(1000 + Math.random() * 9000);
  return code.toString();
}
