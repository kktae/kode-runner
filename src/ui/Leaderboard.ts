import { GameMode, LeaderboardEntry } from '../types/tetris';

const STORAGE_KEY_TIMEATTACK = 'kakaobank_tetris_top_timeattack';
const STORAGE_KEY_CLASSIC = 'kakaobank_tetris_top_classic';

const DEFAULT_TIMEATTACK: LeaderboardEntry[] = [
  { id: '1', name: '라이언_카뱅', score: 15200, lines: 18, mode: 'timeattack', date: '2026.08.11' },
  { id: '2', name: '어피치_개발', score: 12800, lines: 14, mode: 'timeattack', date: '2026.08.11' },
  { id: '3', name: '춘식이_고구마', score: 9500, lines: 11, mode: 'timeattack', date: '2026.08.11' },
  { id: '4', name: '무지_바이브', score: 7200, lines: 8, mode: 'timeattack', date: '2026.08.11' },
  { id: '5', name: '튜브_코더', score: 4800, lines: 5, mode: 'timeattack', date: '2026.08.11' }
];

const DEFAULT_CLASSIC: LeaderboardEntry[] = [
  { id: '1', name: '라이언_카뱅', score: 45000, lines: 52, mode: 'classic', date: '2026.08.11' },
  { id: '2', name: '어피치_개발', score: 32000, lines: 38, mode: 'classic', date: '2026.08.11' },
  { id: '3', name: '춘식이_고구마', score: 24000, lines: 29, mode: 'classic', date: '2026.08.11' },
  { id: '4', name: '무지_바이브', score: 18000, lines: 21, mode: 'classic', date: '2026.08.11' },
  { id: '5', name: '네오_스타일', score: 12500, lines: 15, mode: 'classic', date: '2026.08.11' }
];

export class LeaderboardManager {
  private static getKey(mode: GameMode): string {
    return mode === 'timeattack' ? STORAGE_KEY_TIMEATTACK : STORAGE_KEY_CLASSIC;
  }

  public static getEntries(mode: GameMode): LeaderboardEntry[] {
    const key = this.getKey(mode);
    const data = localStorage.getItem(key);
    if (!data) {
      const defaultData = mode === 'timeattack' ? DEFAULT_TIMEATTACK : DEFAULT_CLASSIC;
      localStorage.setItem(key, JSON.stringify(defaultData));
      return defaultData;
    }
    try {
      return JSON.parse(data) as LeaderboardEntry[];
    } catch {
      return mode === 'timeattack' ? DEFAULT_TIMEATTACK : DEFAULT_CLASSIC;
    }
  }

  public static isHighScore(score: number, mode: GameMode): boolean {
    const entries = this.getEntries(mode);
    if (entries.length < 5) return true;
    return score > entries[entries.length - 1].score;
  }

  public static addEntry(name: string, score: number, lines: number, mode: GameMode): LeaderboardEntry[] {
    const entries = this.getEntries(mode);
    const newEntry: LeaderboardEntry = {
      id: Date.now().toString(),
      name: name.trim() || '무명 관람객',
      score,
      lines,
      mode,
      date: new Date().toLocaleDateString('ko-KR')
    };

    entries.push(newEntry);
    entries.sort((a, b) => b.score - a.score);
    const top5 = entries.slice(0, 5);

    localStorage.setItem(this.getKey(mode), JSON.stringify(top5));
    return top5;
  }
}
