import { NextRequest, NextResponse } from "next/server";
import { searchSongs, JioSaavnApiError } from "@/lib/jiosaavn";
import { normalizeSongList } from "@/lib/normalize";
import { searchCache } from "@/lib/cache";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("query")?.trim();

  if (!query) {
    return NextResponse.json(
      { error: "Query parameter is required" },
      { status: 400 }
    );
  }

  const cacheKey = query.toLowerCase();
  const cached = searchCache.get(cacheKey);

  if (cached) {
    return NextResponse.json({
      candidates: cached,
      cached: true,
    });
  }

  try {
    const rawSongs = await searchSongs(query);
    const candidates = normalizeSongList(rawSongs);
    searchCache.set(cacheKey, candidates);
    return NextResponse.json({ candidates, cached: false });
  } catch (error) {
    const message =
      error instanceof JioSaavnApiError
        ? error.message
        : "Search failed unexpectedly";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
