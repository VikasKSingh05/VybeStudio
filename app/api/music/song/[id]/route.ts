import { NextResponse } from "next/server";
import { getSong, JioSaavnApiError } from "@/lib/jiosaavn";
import { normalizeSong } from "@/lib/normalize";
import { songCache } from "@/lib/cache";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const songId = id?.trim();

  if (!songId) {
    return NextResponse.json(
      { error: "Song ID is required" },
      { status: 400 }
    );
  }

  try {
    const rawSong = await getSong(songId);
    songCache.set(songId, rawSong);

    if (!rawSong) {
      return NextResponse.json(
        { error: "Song not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ song: normalizeSong(rawSong) });
  } catch (error) {
    const message =
      error instanceof JioSaavnApiError
        ? error.message
        : "Song fetch failed unexpectedly";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
