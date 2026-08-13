export type StreamQuality = "320kbps" | "160kbps" | "96kbps" | "48kbps";

export const QUALITY_ORDER: StreamQuality[] = [
  "320kbps",
  "160kbps",
  "96kbps",
  "48kbps",
];

export interface JioSaavnImageLink {
  quality: string;
  url: string;
}

export interface JioSaavnDownloadLink {
  quality: string;
  url: string;
}

export interface JioSaavnArtist {
  id: string;
  name: string;
  role: string;
  type: string;
  image: JioSaavnImageLink[];
  url: string;
}

export interface JioSaavnRawSong {
  id: string;
  name: string;
  type: string;
  year: string | null;
  releaseDate: string | null;
  duration: number | null;
  label: string | null;
  explicitContent: boolean;
  playCount: number | null;
  language: string;
  hasLyrics: boolean;
  lyricsId: string | null;
  url: string;
  copyright: string | null;
  album: {
    id: string | null;
    name: string | null;
    url: string | null;
  };
  artists: {
    primary: JioSaavnArtist[];
    featured: JioSaavnArtist[];
    all: JioSaavnArtist[];
  };
  image: JioSaavnImageLink[];
  downloadUrl: JioSaavnDownloadLink[];
}

export interface SongCandidate {
  id: string;
  title: string;
  artist: string;
  album?: string;
  artwork?: string;
  duration?: number;
  raw: JioSaavnRawSong;
}

export interface ParsedEntry {
  index: number;
  title: string;
  artist: string;
  rawLine: string;
}

export interface PlaylistEntry {
  jiosaavnId?: string;
  title: string;
  artist: string;
  mood?: string;
  energy?: number;
}

export type EntryStatus = "pending" | "searching" | "ready" | "error";

export type VerificationStatus =
  | "unverified"
  | "verifying"
  | "playable"
  | "lower-quality"
  | "unavailable"
  | "failed";

export interface VerifyStreamInfo {
  quality: StreamQuality;
  url: string;
  ok: boolean;
}

export interface VerificationResult {
  id: string;
  status: VerificationStatus;
  bestQuality?: StreamQuality;
  streams: VerifyStreamInfo[];
  error?: string;
}

export interface PlaylistDraftEntry extends PlaylistEntry {
  index: number;
  rawLine: string;
  status: EntryStatus;
  searchError?: string;
  candidates: SongCandidate[];
  candidatesLoading: boolean;
  selectedCandidateId?: string;
  verifyStatus: VerificationStatus;
  verifyError?: string;
  bestQuality?: StreamQuality;
}

export type FilterTab =
  | "all"
  | "pending"
  | "selected"
  | "verified"
  | "failed";
