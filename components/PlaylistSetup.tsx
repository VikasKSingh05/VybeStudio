"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  ListMusic,
  Loader2,
  Play,
  Search,
  Wand2,
} from "lucide-react";

export function PlaylistSetup({
  playlistName,
  onPlaylistNameChange,
  variableName,
  songText,
  onSongTextChange,
  parsedCount,
  invalidLines,
  searchingAll,
  onParse,
  onSearchAll,
  canSearch,
}: {
  playlistName: string;
  onPlaylistNameChange: (value: string) => void;
  variableName: string;
  songText: string;
  onSongTextChange: (value: string) => void;
  parsedCount: number;
  invalidLines: string[];
  searchingAll: boolean;
  onParse: () => void;
  onSearchAll: () => void;
  canSearch: boolean;
}) {
  return (
    <Card>
      <CardContent className="space-y-5 p-5">
        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="playlist-name">Playlist name</Label>
            <Input
              id="playlist-name"
              value={playlistName}
              onChange={(e) => onPlaylistNameChange(e.target.value)}
              placeholder="Phonk"
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground">
              Generated variable:{" "}
              <code className="rounded bg-muted px-1 py-0.5 font-mono text-[11px] text-foreground">
                {variableName}
              </code>
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="songs-text">Paste songs (one per line)</Label>
            <Textarea
              id="songs-text"
              value={songText}
              onChange={(e) => onSongTextChange(e.target.value)}
              placeholder={"METAMORPHOSIS - INTERWORLD\nMurder In My Mind - Kordhell\nClose Eyes - DVRST"}
              className="min-h-28 resize-y font-mono text-sm"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            onClick={onParse}
            disabled={!songText.trim()}
            type="button"
          >
            <Wand2 />
            Parse
          </Button>

          <Button
            onClick={onSearchAll}
            disabled={!canSearch || searchingAll}
            type="button"
          >
            {searchingAll ? <Loader2 className="animate-spin" /> : <Search />}
            {searchingAll ? "Searching…" : "Search All"}
          </Button>

          {parsedCount > 0 ? (
            <Badge variant="secondary" className="gap-1 font-mono">
              <ListMusic className="size-3.5" />
              {parsedCount} song{parsedCount === 1 ? "" : "s"}
            </Badge>
          ) : null}
        </div>

        {invalidLines.length > 0 ? (
          <div className="rounded-md border border-amber-500/30 bg-amber-500/10 p-3">
            <p className="mb-1 flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400">
              <AlertTriangle className="size-3.5" />
              {invalidLines.length} line
              {invalidLines.length === 1 ? "" : "s"} could not be parsed
            </p>
            <ul className="list-inside list-disc space-y-0.5 font-mono text-[11px] text-muted-foreground">
              {invalidLines.map((line, index) => (
                <li key={index} className="truncate">
                  {line}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {parsedCount > 0 ? (
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Play className="size-3.5" />
            Next: pick the correct JioSaavn match for each song. Nothing is
            auto-selected.
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
