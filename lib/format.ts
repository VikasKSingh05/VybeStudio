export function formatDuration(seconds?: number): string {
  if (seconds == null || Number.isNaN(seconds)) return "--:--";
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export const COMMON_MOODS = [
  "dark",
  "aggressive",
  "energetic",
  "chill",
  "focus",
  "night",
  "romantic",
  "melancholy",
  "atmospheric",
] as const;
