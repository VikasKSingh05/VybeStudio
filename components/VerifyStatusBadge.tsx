"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  ShieldAlert,
  ShieldX,
  Loader2,
} from "lucide-react";
import type { VerificationStatus } from "@/lib/types";

const STYLES: Record<
  VerificationStatus,
  { label: string; className: string }
> = {
  unverified: {
    label: "Not verified",
    className: "bg-muted text-muted-foreground",
  },
  verifying: {
    label: "Verifying…",
    className: "bg-muted text-muted-foreground animate-pulse",
  },
  playable: {
    label: "✓ Playable",
    className:
      "bg-emerald-500/15 text-emerald-500 dark:bg-emerald-500/15 dark:text-emerald-400",
  },
  "lower-quality": {
    label: "⚠ Lower quality only",
    className:
      "bg-amber-500/15 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400",
  },
  unavailable: {
    label: "✗ Unavailable",
    className:
      "bg-red-500/15 text-red-600 dark:bg-red-500/15 dark:text-red-400",
  },
  failed: {
    label: "✗ Failed",
    className:
      "bg-red-500/15 text-red-600 dark:bg-red-500/15 dark:text-red-400",
  },
};

const ICONS: Partial<Record<VerificationStatus, typeof CheckCircle2>> = {
  playable: CheckCircle2,
  "lower-quality": ShieldAlert,
  unavailable: ShieldX,
  failed: ShieldX,
  verifying: Loader2,
};

export function VerifyStatusBadge({
  status,
  bestQuality,
  className,
}: {
  status: VerificationStatus;
  bestQuality?: string;
  className?: string;
}) {
  const style = STYLES[status] ?? STYLES.unverified;
  const Icon = ICONS[status];

  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1 border-transparent font-medium",
        style.className,
        className
      )}
    >
      {Icon ? (
        <Icon className={cn("size-3.5", status === "verifying" && "animate-spin")} />
      ) : null}
      {style.label}
      {status === "lower-quality" && bestQuality ? ` (${bestQuality})` : null}
      {status === "playable" && bestQuality ? ` (${bestQuality})` : null}
    </Badge>
  );
}
