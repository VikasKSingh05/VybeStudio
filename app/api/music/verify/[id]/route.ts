import { NextResponse } from "next/server";
import { verifySong } from "@/lib/verify";

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
    const result = await verifySong(songId);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Verification failed unexpectedly",
      },
      { status: 502 }
    );
  }
}
