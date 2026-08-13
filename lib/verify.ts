import { getSong } from "./jiosaavn";
import { verifyCache } from "./cache";
import { QUALITY_ORDER } from "./types";
import type {
  StreamQuality,
  VerificationResult,
  VerifyStreamInfo,
} from "./types";

const PROBE_TIMEOUT = 8000;

async function probeUrl(url: string): Promise<boolean> {
  try {
    const head = await fetch(url, {
      method: "HEAD",
      cache: "no-store",
      signal: AbortSignal.timeout(PROBE_TIMEOUT),
    });
    if (head.ok) return true;
  } catch {
    // Fall through to range request
  }

  try {
    const range = await fetch(url, {
      cache: "no-store",
      headers: { Range: "bytes=0-1023" },
      signal: AbortSignal.timeout(PROBE_TIMEOUT),
    });
    return range.ok;
  } catch {
    return false;
  }
}

function failedResult(id: string, error: string): VerificationResult {
  const result: VerificationResult = {
    id,
    status: "failed",
    streams: [],
    error,
  };
  verifyCache.set(id, result);
  return result;
}

export async function verifySong(id: string): Promise<VerificationResult> {
  const clean = id.trim();
  if (!clean) return failedResult(clean, "No JioSaavn ID provided");

  const cached = verifyCache.get(clean);
  if (cached) return cached;

  let raw;
  try {
    raw = await getSong(clean);
  } catch (error) {
    return failedResult(
      clean,
      error instanceof Error ? error.message : "Verification failed"
    );
  }

  if (!raw) {
    const result: VerificationResult = {
      id: clean,
      status: "unavailable",
      streams: [],
      error: "Song not found on JioSaavn",
    };
    verifyCache.set(clean, result);
    return result;
  }

  const byQuality = new Map<string, string>();
  for (const link of raw.downloadUrl ?? []) {
    if (link?.quality && link?.url && !byQuality.has(link.quality)) {
      byQuality.set(link.quality, link.url);
    }
  }

  const streams: VerifyStreamInfo[] = [];
  let bestQuality: StreamQuality | undefined;

  for (const quality of QUALITY_ORDER) {
    const url = byQuality.get(quality) ?? "";
    const ok = url ? await probeUrl(url) : false;
    streams.push({ quality, url, ok });
    if (ok && !bestQuality) bestQuality = quality;
  }

  const status =
    bestQuality === "320kbps"
      ? "playable"
      : bestQuality
        ? "lower-quality"
        : "unavailable";

  const result: VerificationResult = {
    id: clean,
    status,
    bestQuality,
    streams,
  };

  verifyCache.set(clean, result);
  return result;
}
