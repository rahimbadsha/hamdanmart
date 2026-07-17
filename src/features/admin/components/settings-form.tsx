"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { saveSettingsAction } from "../actions/settings-actions";

const FIELDS = [
  { key: "store_name", label: "Store Name", type: "text" },
  { key: "store_phone", label: "Phone", type: "tel" },
  { key: "store_email", label: "Email", type: "email" },
  { key: "store_address", label: "Address", type: "text" },
  {
    key: "free_shipping_threshold",
    label: "Free Shipping Threshold (taka)",
    type: "number",
  },
  { key: "low_stock_threshold", label: "Low Stock Alert Threshold", type: "number" },
] as const;

interface SettingsFormProps {
  readonly settings: Record<string, string>;
}

export function SettingsForm({ settings }: SettingsFormProps): React.ReactElement {
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>): void {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const entries: Record<string, string> = {};
    for (const field of FIELDS) {
      entries[field.key] = (formData.get(field.key) as string) ?? "";
    }
    startTransition(async () => {
      const result = await saveSettingsAction(entries);
      if (result && !result.ok) {
        toast.error(result.error);
      } else {
        toast.success("Settings saved");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {FIELDS.map((field) => (
        <div key={field.key} className="space-y-1.5">
          <Label htmlFor={field.key}>{field.label}</Label>
          <Input
            id={field.key}
            name={field.key}
            type={field.type}
            defaultValue={settings[field.key] ?? ""}
          />
        </div>
      ))}
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save Settings"}
      </Button>
    </form>
  );
}
