import { config } from "./config";
import type { JioSaavnRawSong } from "./types";

export class JioSaavnApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public cause?: unknown
  ) {
    super(message);
    this.name = "JioSaavnApiError";
  }
}

const SEARCH_LIMIT = 8;
const REQUEST_TIMEOUT = 20000;

async function fetchJson<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const url = `${config.jiosaavnApiUrl}${path}`;

  let response: Response;
  try {
    response = await fetch(url, {
      ...init,
      cache: "no-store",
      signal: init?.signal ?? AbortSignal.timeout(REQUEST_TIMEOUT),
      headers: {
        Accept: "application/json",
        ...(init?.headers ?? {}),
      },
    });
  } catch (error) {
    if (error instanceof JioSaavnApiError) throw error;
    throw new JioSaavnApiError(
      "Unable to reach the JioSaavn API. Check your connection or JIOSAAVN_API_URL.",
      undefined,
      error
    );
  }

  if (!response.ok) {
    throw new JioSaavnApiError(
      `JioSaavn API responded with status ${response.status}`,
      response.status
    );
  }

  try {
    return (await response.json()) as T;
  } catch (error) {
    throw new JioSaavnApiError(
      "Invalid JSON response from JioSaavn API",
      response.status,
      error
    );
  }
}

interface SearchResponse {
  success?: boolean;
  data?: {
    total?: number;
    results?: JioSaavnRawSong[];
  };
}

interface SongResponse {
  success?: boolean;
  data?: JioSaavnRawSong[];
}

export async function searchSongs(query: string): Promise<JioSaavnRawSong[]> {
  const q = query.trim();
  if (!q) return [];

  const body = await fetchJson<SearchResponse>(
    `/api/search/songs?query=${encodeURIComponent(q)}&page=0&limit=${SEARCH_LIMIT}`
  );

  return body?.data?.results ?? [];
}

export async function getSong(id: string): Promise<JioSaavnRawSong | null> {
  const clean = id.trim();
  if (!clean) return null;

  try {
    const body = await fetchJson<SongResponse>(
      `/api/songs/${encodeURIComponent(clean)}`
    );
    return body?.data?.[0] ?? null;
  } catch (error) {
    if (error instanceof JioSaavnApiError && error.status === 404) {
      return null;
    }
    throw error;
  }
}

export async function checkApiHealth(): Promise<boolean> {
  try {
    const body = await fetchJson<SearchResponse>(
      "/api/search/songs?query=metamorphosis&page=0&limit=1"
    );
    return Array.isArray(body?.data?.results);
  } catch {
    return false;
  }
}
