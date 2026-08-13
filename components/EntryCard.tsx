"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { VerifyStatusBadge } from "@/components/VerifyStatusBadge";
import { formatDuration, COMMON_MOODS } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { PlaylistDraftEntry } from "@/lib/types";
import {
  AlertTriangle,
  Check,
  Clock,
  Loader2,
  Music,
  Radio,
  RefreshCw,
  Search,
  ShieldCheck,
  Zap,
} from "lucide-react";

function Artwork({ url, title }: { url?: string; title: string }) {
  return (
    <div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted">
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt=""
          className="size-full object-cover"
          loading="lazy"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />
      ) : (
        <Music className="size-4 text-muted-foreground" />
      )}
      <span className="sr-only">{title}</span>
    </div>
  );
}

export function EntryCard({
  entry,
  onSelectCandidate,
  onMoodChange,
  onEnergyChange,
  onVerify,
  onRetrySearch,
}: {
  entry: PlaylistDraftEntry;
  onSelectCandidate: (index: number, candidateId: string) => void;
  onMoodChange: (index: number, mood: string) => void;
  onEnergyChange: (index: number, energy: number) => void;
  onVerify: (index: number) => void;
  onRetrySearch: (index: number) => void;
}) {
  const selected = entry.candidates.find(
    (candidate) => candidate.id === entry.selectedCandidateId
  );

  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex size-6 items-center justify-center rounded bg-muted font-mono text-xs text-muted-foreground">
            {entry.index + 1}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium">
              {entry.title}
              {entry.artist && entry.artist !== "Unknown Artist" ? (
                <span className="text-muted-foreground"> · {entry.artist}</span>
              ) : null}
            </p>
            <p className="truncate text-[11px] text-muted-foreground">
              pasted: {entry.rawLine}
            </p>
          </div>

          {entry.status === "searching" ? (
            <Badge variant="outline" className="gap-1 text-muted-foreground">
              <Loader2 className="size-3 animate-spin" />
              Searching
            </Badge>
          ) : null}
          {entry.status === "error" ? (
            <Badge
              variant="outline"
              className="gap-1 border-transparent bg-red-500/15 text-red-500 dark:text-red-400"
            >
              <AlertTriangle className="size-3" />
              Search failed
            </Badge>
          ) : null}
        </div>

        {entry.searchError ? (
          <div className="flex items-start gap-2 rounded-md border border-red-500/30 bg-red-500/10 p-2 text-xs text-red-600 dark:text-red-400">
            <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
            <div className="min-w-0 flex-1 break-words">{entry.searchError}</div>
            <Button
              size="xs"
              variant="outline"
              onClick={() => onRetrySearch(entry.index)}
              type="button"
            >
              <RefreshCw />
              Retry
            </Button>
          </div>
        ) : null}

        {entry.candidatesLoading ? (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="size-3.5 animate-spin" />
            Searching JioSaavn…
          </div>
        ) : null}

        {!entry.candidatesLoading && entry.candidates.length === 0 && (
          entry.status === "ready" ? (
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Search className="size-3.5" />
              No JioSaavn results for this song.
            </p>
          ) : null
        )}

        {entry.candidates.length > 0 ? (
          <div className="space-y-1.5">
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Select the correct match
            </p>
            {entry.candidates.map((candidate) => {
              const isSelected = candidate.id === entry.selectedCandidateId;
              return (
                <button
                  key={candidate.id}
                  type="button"
                  onClick={() => onSelectCandidate(entry.index, candidate.id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg border bg-card px-3 py-2 text-left transition-colors",
                    isSelected
                      ? "border-sky-500/60 bg-sky-500/10"
                      : "border-border hover:bg-muted"
                  )}
                >
                  <Artwork url={candidate.artwork} title={candidate.title} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {candidate.title}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {candidate.artist}
                      {candidate.album ? ` · ${candidate.album}` : ""}
                    </p>
                    <p className="truncate font-mono text-[10px] text-muted-foreground">
                      {candidate.id}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2 text-muted-foreground">
                    <span className="flex items-center gap-1 font-mono text-xs">
                      <Clock className="size-3" />
                      {formatDuration(candidate.duration)}
                    </span>
                    {isSelected ? (
                      <Badge className="gap-1 bg-sky-500/90 text-white">
                        <Check className="size-3" />
                        Selected
                      </Badge>
                    ) : null}
                  </div>
                </button>
              );
            })}
          </div>
        ) : null}

        {selected ? (
          <div className="space-y-3 rounded-lg border bg-muted/40 p-3">
            <div className="flex flex-wrap items-end gap-3">
              <div className="space-y-1">
                <label
                  htmlFor={`mood-${entry.index}`}
                  className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground"
                >
                  Mood
                </label>
                <Input
                  id={`mood-${entry.index}`}
                  value={entry.mood ?? ""}
                  onChange={(e) => onMoodChange(entry.index, e.target.value)}
                  placeholder="dark"
                  list="vybe-studio-moods"
                  className="h-8 w-36 font-mono text-xs"
                />
                <datalist id="vybe-studio-moods">
                  {COMMON_MOODS.map((mood) => (
                    <option key={mood} value={mood} />
                  ))}
                </datalist>
              </div>

              <div className="space-y-1">
                <span className="flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  <Zap className="size-3" />
                  Energy (1–5)
                </span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <Button
                      key={level}
                      size="sm"
                      variant={entry.energy === level ? "default" : "outline"}
                      className="h-8 w-8 px-0 font-mono"
                      onClick={() => onEnergyChange(entry.index, level)}
                      type="button"
                    >
                      {level}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="ml-auto space-y-1">
                <span className="block text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Stream
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onVerify(entry.index)}
                  disabled={entry.verifyStatus === "verifying"}
                  type="button"
                >
                  {entry.verifyStatus === "verifying" ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <Radio />
                  )}
                  Verify Stream
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <VerifyStatusBadge
                status={entry.verifyStatus}
                bestQuality={entry.bestQuality}
              />
              {entry.verifyStatus === "unavailable" ||
              entry.verifyStatus === "failed" ? (
                <span className="text-xs text-red-500">
                  {entry.verifyError}
                </span>
              ) : null}
              {entry.verifyStatus === "playable" ? (
                <span className="flex items-center gap-1 text-xs text-emerald-500">
                  <ShieldCheck className="size-3.5" />
                  320kbps verified
                </span>
              ) : null}
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
