export function toPlaylistVariable(name: string): string {
  const words = name
    .trim()
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);

  const camelCase = words
    .map((word, index) =>
      index === 0
        ? word
        : word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join("");

  return camelCase ? `${camelCase}Playlist` : "playlist";
}
