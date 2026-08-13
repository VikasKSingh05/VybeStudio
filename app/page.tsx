"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { StudioHeader } from "@/components/StudioHeader";
import { PlaylistSetup } from "@/components/PlaylistSetup";
import { ProgressStats } from "@/components/ProgressStats";
import { EntryCard } from "@/components/EntryCard";
import { GeneratePanel } from "@/components/GeneratePanel";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  checkHealthClient,
  searchCandidatesClient,
  verifySongClient,
} from "@/lib/api-client";
import { parseSongLines } from "@/lib/parser";
import { toPlaylistVariable } from "@/lib/naming";
import { buildPlaylistJson, buildPlaylistTs } from "@/lib/generate";
import type {
  FilterTab,
  PlaylistDraftEntry,
  PlaylistEntry,
  VerificationStatus,
} from "@/lib/types";
import { FileCode2, Loader2, Radio } from "lucide-react";

const VERIFIED_STATUSES: VerificationStatus[] = [
  "playable",
  "lower-quality",
];

function initialEntry(
  index: number,
  title: string,
  artist: string,
  rawLine: string
): PlaylistDraftEntry {
  return {
    index,
    title,
    artist,
    rawLine,
    status: "pending",
    candidates: [],
    candidatesLoading: false,
    verifyStatus: "unverified",
  };
}

export default function Home() {
  const [playlistName, setPlaylistName] = useState("");
  const [songText, setSongText] = useState("");
  const [entries, setEntries] = useState<PlaylistDraftEntry[]>([]);
  const [invalidLines, setInvalidLines] = useState<string[]>([]);
  const [filter, setFilter] = useState<FilterTab>("all");
  const [searchingAll, setSearchingAll] = useState(false);
  const [verifyingAll, setVerifyingAll] = useState(false);
  const [health, setHealth] = useState<boolean | null>(null);
  const [apiUrl, setApiUrl] = useState<string | null>(null);

  const generateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    checkHealthClient()
      .then((result) => {
        if (!active) return;
        setHealth(result.ok);
        setApiUrl(result.url);
      })
      .catch(() => {
        if (active) setHealth(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const variableName = toPlaylistVariable(playlistName);

  const entriesRef = useRef(entries);
  entriesRef.current = entries;

  const handleParse = useCallback(() => {
    const { entries: parsed, invalidLines: badLines } =
      parseSongLines(songText);
    setEntries(
      parsed.map((entry) =>
        initialEntry(entry.index, entry.title, entry.artist, entry.rawLine)
      )
    );
    setInvalidLines(badLines);
    setFilter("all");
    if (parsed.length === 0) {
      toast.error("No songs could be parsed from the text");
    } else if (badLines.length > 0) {
      toast.warning(
        `${parsed.length} song${parsed.length === 1 ? "" : "s"} parsed, ${badLines.length} line${badLines.length === 1 ? "" : "s"} skipped`
      );
    } else {
      toast.success(`${parsed.length} song${parsed.length === 1 ? "" : "s"} parsed`);
    }
  }, [songText]);

  const searchOne = useCallback(async (index: number) => {
    const entry = entriesRef.current.find((e) => e.index === index);
    if (!entry) return;

    setEntries((prev) =>
      prev.map((e) =>
        e.index === index
          ? { ...e, status: "searching", candidatesLoading: true, searchError: undefined }
          : e
      )
    );

    const query =
      entry.artist && entry.artist !== "Unknown Artist"
        ? `${entry.title} ${entry.artist}`
        : entry.title;

    try {
      const candidates = await searchCandidatesClient(query);
      setEntries((prev) =>
        prev.map((e) =>
          e.index === index
            ? {
                ...e,
                status: "ready",
                candidatesLoading: false,
                candidates,
              }
            : e
        )
      );
    } catch (error) {
      setEntries((prev) =>
        prev.map((e) =>
          e.index === index
            ? {
                ...e,
                status: "error",
                candidatesLoading: false,
                searchError:
                  error instanceof Error
                    ? error.message
                    : "Search failed unexpectedly",
              }
            : e
        )
      );
    }
  }, []);

  const handleSearchAll = useCallback(async () => {
    const targets = entriesRef.current.filter(
      (e) => e.candidates.length === 0 && e.status !== "searching"
    );
    if (targets.length === 0) {
      toast.info("Every song already has search results");
      return;
    }

    setSearchingAll(true);
    for (const target of targets) {
      await searchOne(target.index);
    }
    setSearchingAll(false);
    const remaining = entriesRef.current.filter((e) => e.status === "error");
    if (remaining.length === 0) {
      toast.success("Search complete — select the correct match for each song");
    }
  }, [searchOne]);

  const handleSelectCandidate = useCallback(
    (index: number, candidateId: string) => {
      setEntries((prev) =>
        prev.map((entry) => {
          if (entry.index !== index) return entry;
          const candidate = entry.candidates.find(
            (c) => c.id === candidateId
          );
          if (!candidate) return entry;
          const changedSelection = entry.selectedCandidateId !== candidateId;
          return {
            ...entry,
            selectedCandidateId: candidateId,
            title: candidate.title,
            artist: candidate.artist,
            verifyStatus: changedSelection ? "unverified" : entry.verifyStatus,
            verifyError: changedSelection ? undefined : entry.verifyError,
            bestQuality: changedSelection ? undefined : entry.bestQuality,
          };
        })
      );
    },
    []
  );

  const handleMoodChange = useCallback((index: number, mood: string) => {
    setEntries((prev) =>
      prev.map((e) => (e.index === index ? { ...e, mood } : e))
    );
  }, []);

  const handleEnergyChange = useCallback((index: number, energy: number) => {
    setEntries((prev) =>
      prev.map((e) => (e.index === index ? { ...e, energy } : e))
    );
  }, []);

  const handleVerify = useCallback(async (index: number) => {
    const entry = entriesRef.current.find((e) => e.index === index);
    if (!entry?.selectedCandidateId) return;

    setEntries((prev) =>
      prev.map((e) =>
        e.index === index
          ? { ...e, verifyStatus: "verifying", verifyError: undefined }
          : e
      )
    );

    try {
      const result = await verifySongClient(entry.selectedCandidateId);
      setEntries((prev) =>
        prev.map((e) =>
          e.index === index
            ? {
                ...e,
                verifyStatus: result.status,
                verifyError: result.error,
                bestQuality: result.bestQuality,
              }
            : e
        )
      );
    } catch (error) {
      setEntries((prev) =>
        prev.map((e) =>
          e.index === index
            ? {
                ...e,
                verifyStatus: "failed",
                verifyError:
                  error instanceof Error
                    ? error.message
                    : "Verification failed unexpectedly",
              }
            : e
        )
      );
    }
  }, []);

  const handleVerifyAll = useCallback(async () => {
    const targets = entriesRef.current.filter(
      (e) => e.selectedCandidateId && e.verifyStatus === "unverified"
    );
    if (targets.length === 0) {
      toast.info("No selected songs left to verify");
      return;
    }

    setVerifyingAll(true);
    for (const target of targets) {
      await handleVerify(target.index);
    }
    setVerifyingAll(false);
    toast.success("Verification complete");
  }, [handleVerify]);

  const handleGenerate = useCallback(() => {
    const selected = entriesRef.current.filter(
      (e) => e.selectedCandidateId
    );
    if (selected.length === 0) {
      toast.error("Select at least one JioSaavn match first");
      return;
    }
    generateRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
    toast.success(`Generated ${selected.length} playlist entr${selected.length === 1 ? "y" : "ies"}`);
  }, []);

  const stats = useMemo(() => {
    const total = entries.length;
    const selected = entries.filter((e) => e.selectedCandidateId).length;
    const verified = entries.filter((e) =>
      VERIFIED_STATUSES.includes(e.verifyStatus)
    ).length;
    const failed = entries.filter(
      (e) =>
        e.verifyStatus === "unavailable" ||
        e.verifyStatus === "failed" ||
        e.status === "error"
    ).length;
    const pending = entries.filter(
      (e) =>
        e.status !== "error" &&
        !VERIFIED_STATUSES.includes(e.verifyStatus) &&
        e.verifyStatus !== "unavailable" &&
        e.verifyStatus !== "failed"
    ).length;
    return { total, selected, verified, failed, pending };
  }, [entries]);

  const filteredEntries = useMemo(() => {
    switch (filter) {
      case "pending":
        return entries.filter(
          (e) =>
            e.status !== "error" &&
            !VERIFIED_STATUSES.includes(e.verifyStatus) &&
            e.verifyStatus !== "unavailable" &&
            e.verifyStatus !== "failed"
        );
      case "selected":
        return entries.filter((e) => e.selectedCandidateId);
      case "verified":
        return entries.filter((e) =>
          VERIFIED_STATUSES.includes(e.verifyStatus)
        );
      case "failed":
        return entries.filter(
          (e) =>
            e.verifyStatus === "unavailable" ||
            e.verifyStatus === "failed" ||
            e.status === "error"
        );
      default:
        return entries;
    }
  }, [entries, filter]);

  const { tsCode, jsonCode, selectedEntries } = useMemo(() => {
    const selected: PlaylistEntry[] = entries
      .filter((e) => e.selectedCandidateId)
      .map((e) => ({
        jiosaavnId: e.selectedCandidateId,
        title: e.title,
        artist: e.artist,
        mood: e.mood?.trim() ? e.mood : undefined,
        energy: e.energy,
      }));
    return {
      tsCode: buildPlaylistTs(selected, variableName),
      jsonCode: buildPlaylistJson(selected),
      selectedEntries: selected.length,
    };
  }, [entries, variableName]);

  const skippedCount = entries.length - selectedEntries;

  return (
    <>
      <StudioHeader health={health} apiUrl={apiUrl} />

      <main className="mx-auto w-full max-w-7xl flex-1 space-y-6 px-4 py-6 sm:px-6">
        <PlaylistSetup
          playlistName={playlistName}
          onPlaylistNameChange={setPlaylistName}
          variableName={variableName}
          songText={songText}
          onSongTextChange={setSongText}
          parsedCount={entries.length}
          invalidLines={invalidLines}
          searchingAll={searchingAll}
          onParse={handleParse}
          onSearchAll={handleSearchAll}
          canSearch={entries.length > 0}
        />

        <ProgressStats
          total={stats.total}
          selected={stats.selected}
          verified={stats.verified}
          failed={stats.failed}
          pending={stats.pending}
          filter={filter}
          onFilterChange={setFilter}
        />

        {entries.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleVerifyAll}
              disabled={verifyingAll}
              type="button"
            >
              {verifyingAll ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Radio />
              )}
              {verifyingAll ? "Verifying…" : "Verify All"}
            </Button>
            <Button size="sm" onClick={handleGenerate} type="button">
              <FileCode2 />
              Generate Playlist
            </Button>
            <span className="text-xs text-muted-foreground">
              Paste songs → Search All → select match → set mood/energy → Verify
              All → generate → paste into VYBE
            </span>
          </div>
        ) : null}

        {entries.length === 0 ? (
          <div className="rounded-lg border border-dashed bg-card/40 p-10 text-center text-sm text-muted-foreground">
            Paste songs above and hit <span className="font-medium">Parse</span>{" "}
            to begin.
          </div>
        ) : null}

        {filteredEntries.length > 0 ? (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-3">
              {filteredEntries.map((entry) => (
                <EntryCard
                  key={entry.index}
                  entry={entry}
                  onSelectCandidate={handleSelectCandidate}
                  onMoodChange={handleMoodChange}
                  onEnergyChange={handleEnergyChange}
                  onVerify={handleVerify}
                  onRetrySearch={searchOne}
                />
              ))}
            </div>

            <div ref={generateRef} className="h-fit lg:sticky lg:top-20">
              <GeneratePanel
                code={tsCode}
                json={jsonCode}
                variableName={variableName}
                selectedCount={selectedEntries}
                skippedCount={skippedCount}
              />
            </div>
          </div>
        ) : (
          entries.length > 0 && (
            <p className="text-sm text-muted-foreground">
              No songs match the current filter.
            </p>
          )
        )}
      </main>
    </>
  );
}
