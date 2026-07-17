"use client";

import { useTranslations } from "next-intl";
import type { FieldErrors, FieldValues, Path, UseFormRegister } from "react-hook-form";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AuthFieldProps<T extends FieldValues> {
  readonly name: Path<T>;
  readonly label: string;
  readonly type?: string;
  readonly autoComplete?: string;
  readonly register: UseFormRegister<T>;
  readonly errors: FieldErrors<T>;
}

/** Labelled input with a translated validation message. */
export function AuthField<T extends FieldValues>({
  name,
  label,
  type = "text",
  autoComplete,
  register,
  errors,
}: AuthFieldProps<T>): React.ReactElement {
  const t = useTranslations();
  const message = errors[name]?.message;

  return (
    <div className="space-y-1.5">
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        type={type}
        autoComplete={autoComplete}
        aria-invalid={message ? true : undefined}
        {...register(name)}
      />
      {typeof message === "string" ? (
        <p role="alert" className="text-sm text-destructive">
          {t(message)}
        </p>
      ) : null}
    </div>
  );
}
