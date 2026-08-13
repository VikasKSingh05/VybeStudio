import type { JioSaavnRawSong, SongCandidate } from "./types";

function pickArtist(raw: JioSaavnRawSong): string {
  const primary = raw.artists?.primary ?? [];
  const names = primary.map((a) => a.name).filter(Boolean);
  return names.length > 0 ? names.join(", ") : "Unknown Artist";
}

function pickAlbum(raw: JioSaavnRawSong): string | undefined {
  return raw.album?.name ?? undefined;
}

function pickArtwork(raw: JioSaavnRawSong): string | undefined {
  const images = raw.image ?? [];
  const preferred =
    images.find((i) => i.quality === "500x500") ??
    images.find((i) => i.quality === "150x150") ??
    images[0];
  return preferred?.url;
}

export function normalizeSong(raw: JioSaavnRawSong): SongCandidate | null {
  if (!raw || !raw.id || !raw.name) return null;
  return {
    id: raw.id,
    title: raw.name,
    artist: pickArtist(raw),
    album: pickAlbum(raw),
    artwork: pickArtwork(raw),
    duration: raw.duration ?? undefined,
    raw,
  };
}

export function normalizeSongList(rawSongs: JioSaavnRawSong[]): SongCandidate[] {
  return rawSongs
    .map((raw) => normalizeSong(raw))
    .filter((candidate): candidate is SongCandidate => candidate !== null);
}
