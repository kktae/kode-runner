import { Redis } from '@upstash/redis';
import { LeaderboardEntry, LeaderboardEntrySchema, SubmitScoreRequest } from '../types/network';

// Fallback LocalStorage Key
const LOCAL_LEADERBOARD_KEY = 'kode_runner_leaderboard_v1';

class LeaderboardService {
  private redis: Redis | null = null;

  constructor() {
    // 환경변수 등록 시 Upstash Redis 클라이언트 자동 활성화
    const url = import.meta.env.VITE_UPSTASH_REDIS_REST_URL;
    const token = import.meta.env.VITE_UPSTASH_REDIS_REST_TOKEN;

    if (url && token) {
      this.redis = new Redis({ url, token });
    }
  }

  /**
   * 상위 TOP 10 랭킹 조회
   */
  async getTopScores(mode: 'timeattack' | 'classic' = 'timeattack'): Promise<LeaderboardEntry[]> {
    if (this.redis) {
      try {
        const key = `leaderboard:${mode}`;
        // zrange (rev: true) 로 TOP 10 항목 역순 조회
        const rawEntries = await this.redis.zrange<string[]>(key, 0, 9, { rev: true, withScores: true });
        
        const entries: LeaderboardEntry[] = [];
        // Raw Redis data format: [member1, score1, member2, score2, ...]
        for (let i = 0; i < rawEntries.length; i += 2) {
          const memberJson = rawEntries[i];
          const scoreStr = rawEntries[i + 1];
          try {
            const parsed = typeof memberJson === 'string' ? JSON.parse(memberJson) : memberJson;
            const validated = LeaderboardEntrySchema.parse({
              ...parsed,
              score: Number(scoreStr),
              rank: Math.floor(i / 2) + 1,
            });
            entries.push(validated);
          } catch (e) {
            console.warn('Leaderboard entry parse error:', e);
          }
        }
        return entries;
      } catch (err) {
        console.error('Upstash Redis fetch error, falling back to LocalStorage:', err);
      }
    }

    // LocalStorage Fallback
    return this.getLocalTopScores(mode);
  }

  /**
   * 점수 제출 및 순위 반영
   */
  async submitScore(req: SubmitScoreRequest): Promise<{ success: boolean; rank?: number }> {
    const entry: LeaderboardEntry = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      nickname: req.nickname,
      score: req.score,
      mode: req.mode,
      timestamp: Date.now(),
    };

    if (this.redis) {
      try {
        const key = `leaderboard:${req.mode}`;
        const memberPayload = JSON.stringify({
          id: entry.id,
          nickname: entry.nickname,
          mode: entry.mode,
          timestamp: entry.timestamp,
        });

        // Redis ZADD Score 저장
        await this.redis.zadd(key, { score: entry.score, member: memberPayload });
        
        // 제출된 점수의 내 랭킹 조회 (0-based -> 1-based)
        const rankIndex = await this.redis.zrevrank(key, memberPayload);
        const rank = rankIndex !== null ? rankIndex + 1 : undefined;

        return { success: true, rank };
      } catch (err) {
        console.error('Upstash Redis submit error, using local fallback:', err);
      }
    }

    // LocalStorage Fallback
    const localRank = this.saveLocalScore(entry);
    return { success: true, rank: localRank };
  }

  private getLocalTopScores(mode: 'timeattack' | 'classic'): LeaderboardEntry[] {
    try {
      const data = localStorage.getItem(LOCAL_LEADERBOARD_KEY);
      if (!data) return [];
      const allEntries: LeaderboardEntry[] = JSON.parse(data);
      return allEntries
        .filter((e) => e.mode === mode)
        .sort((a, b) => b.score - a.score)
        .slice(0, 10)
        .map((item, idx) => ({ ...item, rank: idx + 1 }));
    } catch {
      return [];
    }
  }

  private saveLocalScore(entry: LeaderboardEntry): number {
    try {
      const existing = localStorage.getItem(LOCAL_LEADERBOARD_KEY);
      const list: LeaderboardEntry[] = existing ? JSON.parse(existing) : [];
      list.push(entry);
      list.sort((a, b) => b.score - a.score);
      localStorage.setItem(LOCAL_LEADERBOARD_KEY, JSON.stringify(list.slice(0, 100)));
      
      const rank = list.findIndex((item) => item.id === entry.id);
      return rank !== -1 ? rank + 1 : 1;
    } catch {
      return 1;
    }
  }
}

export const leaderboardService = new LeaderboardService();
