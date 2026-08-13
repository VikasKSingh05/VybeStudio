import type { PlaylistEntry } from "./types";

export function tsString(value: string): string {
  return JSON.stringify(value);
}

export function isSafeIdentifier(name: string): boolean {
  return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(name);
}

export function buildPlaylistTs(
  entries: PlaylistEntry[],
  variableName: string
): string {
  const variable = isSafeIdentifier(variableName) ? variableName : "playlist";

  const body = entries
    .map((entry) => {
      const lines = [
        "  {",
        `    jiosaavnId: ${tsString(entry.jiosaavnId ?? "")},`,
        `    title: ${tsString(entry.title)},`,
        `    artist: ${tsString(entry.artist)},`,
      ];
      if (entry.mood && entry.mood.trim()) {
        lines.push(`    mood: ${tsString(entry.mood.trim())},`);
      }
      if (entry.energy != null) {
        lines.push(`    energy: ${entry.energy},`);
      }
      lines.push("  },");
      return lines.join("\n");
    })
    .join("\n");

  return `import type { PlaylistEntry } from "./types";\n\nexport const ${variable}: PlaylistEntry[] = [\n${body}\n];\n`;
}

export function buildPlaylistJson(entries: PlaylistEntry[]): string {
  return JSON.stringify(entries, null, 2);
}
