"use client";

import { useRef, useTransition } from "react";
import { Upload } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import { uploadMediaAction } from "../actions";

export function UploadButton(): React.ReactElement {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();

  function handleChange(e: React.ChangeEvent<HTMLInputElement>): void {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    startTransition(async () => {
      const result = await uploadMediaAction(formData);
      if (!result.ok) {
        toast.error(result.error);
      } else {
        toast.success("Image uploaded");
      }
      if (inputRef.current) inputRef.current.value = "";
    });
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
        className="hidden"
        onChange={handleChange}
      />
      <Button onClick={() => inputRef.current?.click()} disabled={pending} size="sm">
        <Upload className="mr-1.5 size-4" />
        {pending ? "Uploading…" : "Upload Image"}
      </Button>
    </>
  );
}
