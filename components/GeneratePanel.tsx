"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { copyToClipboard, downloadTextFile } from "@/lib/api-client";
import { Braces, Copy, Download, FileCode2 } from "lucide-react";
import { useState } from "react";

export function GeneratePanel({
  code,
  json,
  variableName,
  selectedCount,
  skippedCount,
}: {
  code: string;
  json: string;
  variableName: string;
  selectedCount: number;
  skippedCount: number;
}) {
  const [copied, setCopied] = useState<"ts" | "json" | null>(null);

  const handleCopyTs = async () => {
    const ok = await copyToClipboard(code);
    setCopied(ok ? "ts" : null);
    if (ok) {
      toast.success("TypeScript copied to clipboard");
      setTimeout(() => setCopied(null), 1500);
    } else {
      toast.error("Could not copy to clipboard");
    }
  };

  const handleCopyJson = async () => {
    const ok = await copyToClipboard(json);
    setCopied(ok ? "json" : null);
    if (ok) {
      toast.success("JSON copied to clipboard");
      setTimeout(() => setCopied(null), 1500);
    } else {
      toast.error("Could not copy to clipboard");
    }
  };

  const handleDownloadTs = () => {
    const filename = `${variableName}.ts`;
    downloadTextFile(filename, code, "text/typescript");
    toast.success(`Downloaded ${filename}`);
  };

  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <FileCode2 className="size-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold">Generated Playlist</h2>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-mono">{selectedCount} selected</span>
            {skippedCount > 0 ? (
              <span className="font-mono">{skippedCount} skipped</span>
            ) : null}
          </div>
        </div>

        <pre className="max-h-80 overflow-auto rounded-lg border bg-black/40 p-3 font-mono text-xs leading-relaxed text-emerald-300/90">
          <code>{code || "No selected songs yet — pick a JioSaavn match for each song."}</code>
        </pre>

        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={handleCopyTs} disabled={!code} type="button">
            <Copy />
            {copied === "ts" ? "Copied!" : "Copy TypeScript"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleDownloadTs}
            disabled={!code}
            type="button"
          >
            <Download />
            Download .ts
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={handleCopyJson}
            disabled={!json}
            type="button"
          >
            <Braces />
            {copied === "json" ? "Copied!" : "Copy JSON"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
