"use client";

import { useState, useTransition } from "react";
import { Pencil } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ActionResult } from "@/lib/action-result";

interface InlineEditFieldProps {
  readonly value: number;
  readonly label: string;
  readonly onSave: (value: number) => Promise<ActionResult>;
}

export function InlineEditField({
  value,
  label,
  onSave,
}: InlineEditFieldProps): React.ReactElement {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));
  const [pending, startTransition] = useTransition();

  if (!editing) {
    return (
      <button
        type="button"
        className="group flex items-center gap-1 text-sm"
        onClick={() => {
          setDraft(String(value));
          setEditing(true);
        }}
      >
        <span>{value}</span>
        <Pencil className="size-3 opacity-0 group-hover:opacity-50" />
      </button>
    );
  }

  function handleSave(): void {
    const num = Number(draft);
    if (Number.isNaN(num) || num < 0) {
      toast.error("Invalid number");
      return;
    }
    startTransition(async () => {
      const result = await onSave(num);
      if (result && !result.ok) {
        toast.error(result.error);
      } else {
        setEditing(false);
      }
    });
  }

  return (
    <div className="flex items-center gap-1">
      <Input
        type="number"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        className="h-7 w-20 text-xs"
        aria-label={label}
        disabled={pending}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSave();
          if (e.key === "Escape") setEditing(false);
        }}
        autoFocus
      />
      <Button
        type="button"
        size="sm"
        variant="ghost"
        className="h-7 text-xs"
        onClick={handleSave}
        disabled={pending}
      >
        Save
      </Button>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        className="h-7 text-xs"
        onClick={() => setEditing(false)}
        disabled={pending}
      >
        ✕
      </Button>
    </div>
  );
}
