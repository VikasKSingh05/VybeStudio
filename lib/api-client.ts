import { searchCache, verifyCache } from "./cache";
import type { SongCandidate, VerificationResult } from "./types";

export class ApiClientError extends Error {
  constructor(
    message: string,
    public status?: number
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

async function request<T>(path: string): Promise<T> {
  let response: Response;
  try {
    response = await fetch(path, { cache: "no-store" });
  } catch {
    throw new ApiClientError("Network error — could not reach VYBE Studio");
  }

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    const message =
      (data as { error?: string } | null)?.error ??
      `Request failed with status ${response.status}`;
    throw new ApiClientError(message, response.status);
  }

  return data as T;
}

export async function searchCandidatesClient(
  query: string
): Promise<SongCandidate[]> {
  const key = query.trim().toLowerCase();
  if (searchCache.has(key)) return searchCache.get(key) as SongCandidate[];

  const data = await request<{ candidates: SongCandidate[] }>(
    `/api/music/search?query=${encodeURIComponent(query)}`
  );
  searchCache.set(key, data.candidates);
  return data.candidates;
}

export async function verifySongClient(
  id: string
): Promise<VerificationResult> {
  const key = id.trim();
  if (verifyCache.has(key)) return verifyCache.get(key) as VerificationResult;

  const result = await request<VerificationResult>(
    `/api/music/verify/${encodeURIComponent(key)}`
  );
  verifyCache.set(key, result);
  return result;
}

export async function checkHealthClient(): Promise<{
  ok: boolean;
  url: string;
}> {
  return request("/api/music/health");
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function downloadTextFile(
  filename: string,
  content: string,
  mime = "text/plain;charset=utf-8"
): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
