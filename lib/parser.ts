import type { ParsedEntry } from "./types";

export function parseSongLines(
  text: string
): { entries: ParsedEntry[]; invalidLines: string[] } {
  const lines = text.split(/\r?\n/);
  const entries: ParsedEntry[] = [];
  const invalidLines: string[] = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    const separatorIndex = line.search(/\s*[-–—]\s*/);
    if (separatorIndex > 0) {
      const title = line.slice(0, separatorIndex).trim();
      const artist = line
        .slice(separatorIndex)
        .replace(/^[^-\u2013\u2014]*[-–—]\s*/, "")
        .trim();
      entries.push({ index: entries.length, title, artist, rawLine });
    } else if (line.includes("-") || line.includes("–") || line.includes("—")) {
      invalidLines.push(line);
    } else {
      entries.push({
        index: entries.length,
        title: line,
        artist: "Unknown Artist",
        rawLine,
      });
    }
  }

  return { entries, invalidLines };
}
