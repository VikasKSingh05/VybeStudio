"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { FilterTab } from "@/lib/types";

const FILTERS: { value: FilterTab; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "selected", label: "Selected" },
  { value: "verified", label: "Verified" },
  { value: "failed", label: "Failed" },
];

export function ProgressStats({
  total,
  selected,
  verified,
  failed,
  pending,
  filter,
  onFilterChange,
}: {
  total: number;
  selected: number;
  verified: number;
  failed: number;
  pending: number;
  filter: FilterTab;
  onFilterChange: (value: FilterTab) => void;
}) {
  const stats = [
    { label: "Total", value: total, className: "" },
    {
      label: "Selected",
      value: selected,
      className: "text-sky-500 dark:text-sky-400",
    },
    {
      label: "Verified",
      value: verified,
      className: "text-emerald-500 dark:text-emerald-400",
    },
    {
      label: "Failed",
      value: failed,
      className: "text-red-500 dark:text-red-400",
    },
    {
      label: "Pending",
      value: pending,
      className: "text-muted-foreground",
    },
  ];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border bg-card p-3"
          >
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
              {stat.label}
            </p>
            <p
              className={cn(
                "mt-0.5 font-mono text-xl font-semibold tabular-nums",
                stat.className
              )}
            >
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-1">
        {FILTERS.map((item) => (
          <Button
            key={item.value}
            size="sm"
            variant={filter === item.value ? "default" : "outline"}
            onClick={() => onFilterChange(item.value)}
            type="button"
          >
            {item.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
