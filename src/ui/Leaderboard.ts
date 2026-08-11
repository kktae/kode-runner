import type { GameMode, LeaderboardEntry } from '../types/tetris';

const STORAGE_KEY_TIMEATTACK = 'kakaobank_tetris_top_timeattack';
const STORAGE_KEY_CLASSIC = 'kakaobank_tetris_top_classic';

export class LeaderboardManager {
  private static getKey(mode: GameMode): string {
    return mode === 'timeattack' ? STORAGE_KEY_TIMEATTACK : STORAGE_KEY_CLASSIC;
  }

  public static getEntries(mode: GameMode): LeaderboardEntry[] {
    const key = LeaderboardManager.getKey(mode);
    const data = localStorage.getItem(key);
    if (!data) {
      return [];
    }
    try {
      const parsed = JSON.parse(data) as LeaderboardEntry[];
      // Filter out any leftover dummy entries from previous builds
      const filtered = parsed.filter(
        (e) => !['1', '2', '3', '4', '5'].includes(e.id),
      );
      return filtered;
    } catch {
      return [];
    }
  }

  public static isHighScore(score: number, mode: GameMode): boolean {
    const entries = LeaderboardManager.getEntries(mode);
    if (entries.length < 5) return true;
    return score > entries[entries.length - 1].score;
  }

  public static addEntry(
    name: string,
    score: number,
    lines: number,
    mode: GameMode,
  ): LeaderboardEntry[] {
    const entries = LeaderboardManager.getEntries(mode);
    const newEntry: LeaderboardEntry = {
      id: Date.now().toString(),
      name: name.trim() || '무명 관람객',
      score,
      lines,
      mode,
      date: new Date().toLocaleDateString('ko-KR'),
    };

    entries.push(newEntry);
    entries.sort((a, b) => b.score - a.score);
    const top5 = entries.slice(0, 5);

    localStorage.setItem(LeaderboardManager.getKey(mode), JSON.stringify(top5));
    return top5;
  }

  public static clearAll() {
    localStorage.removeItem(STORAGE_KEY_TIMEATTACK);
    localStorage.removeItem(STORAGE_KEY_CLASSIC);
  }
}
