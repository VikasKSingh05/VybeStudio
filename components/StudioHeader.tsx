"use client";

import { CircleCheck, CircleDot, CircleX } from "lucide-react";

export function ApiStatusIndicator({
  health,
}: {
  health: boolean | null;
}) {
  if (health === null) {
    return (
      <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
        <CircleDot className="size-3 animate-pulse" />
        Checking API…
      </span>
    );
  }

  return health ? (
    <span className="inline-flex items-center gap-2 text-xs text-emerald-500">
      <CircleCheck className="size-3" />
      JioSaavn API connected
    </span>
  ) : (
    <span className="inline-flex items-center gap-2 text-xs text-red-500">
      <CircleX className="size-3" />
      JioSaavn API unreachable
    </span>
  );
}

export function StudioHeader({
  health,
  apiUrl,
}: {
  health: boolean | null;
  apiUrl: string | null;
}) {
  return (
    <header className="sticky top-0 z-20 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-2.5">
          <div className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <span className="text-sm font-black">V</span>
          </div>
          <div className="leading-tight">
            <h1 className="text-sm font-semibold tracking-tight">
              VYBE Studio
            </h1>
            <p className="text-[11px] text-muted-foreground">
              Playlist curation for VYBE
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-0.5">
          <ApiStatusIndicator health={health} />
          <span className="max-w-64 truncate font-mono text-[10px] text-muted-foreground">
            {apiUrl ?? ""}
          </span>
        </div>
      </div>
    </header>
  );
}
