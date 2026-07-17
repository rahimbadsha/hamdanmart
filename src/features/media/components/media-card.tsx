"use client";

import { Trash2 } from "lucide-react";
import Image from "next/image";
import { useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import { deleteMediaAction } from "../actions";

interface MediaCardProps {
  readonly id: string;
  readonly path: string;
  readonly filename: string;
  readonly sizeBytes: number;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function MediaCard({
  id,
  path,
  filename,
  sizeBytes,
}: MediaCardProps): React.ReactElement {
  const [pending, startTransition] = useTransition();

  function handleDelete(): void {
    startTransition(async () => {
      const result = await deleteMediaAction(id);
      if (result && !result.ok) {
        toast.error(result.error);
      } else {
        toast.success("Deleted");
      }
    });
  }

  return (
    <div className="group relative overflow-hidden rounded-lg border bg-card">
      <div className="relative aspect-square">
        <Image
          src={path}
          alt={filename}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 200px"
        />
      </div>
      <div className="flex items-center justify-between gap-1 p-2">
        <div className="min-w-0">
          <p className="truncate text-xs font-medium">{filename}</p>
          <p className="text-xs text-muted-foreground">{formatSize(sizeBytes)}</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="size-7 shrink-0 text-destructive opacity-0 transition-opacity group-hover:opacity-100"
          onClick={handleDelete}
          disabled={pending}
          aria-label="Delete"
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}
