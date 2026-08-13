import type {
  JioSaavnRawSong,
  SongCandidate,
  VerificationResult,
} from "./types";

class SessionCache<T> {
  private store = new Map<string, T>();

  get(key: string): T | undefined {
    return this.store.get(key);
  }

  has(key: string): boolean {
    return this.store.has(key);
  }

  set(key: string, value: T): void {
    this.store.set(key, value);
  }
}

export const searchCache = new SessionCache<SongCandidate[]>();
export const songCache = new SessionCache<JioSaavnRawSong | null>();
export const verifyCache = new SessionCache<VerificationResult>();
