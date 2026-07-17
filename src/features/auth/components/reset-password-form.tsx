"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";

import { resetPasswordAction } from "../actions";
import { resetPasswordSchema, type ResetPasswordInput } from "../schemas";
import { AuthField } from "./auth-field";

interface ResetPasswordFormProps {
  readonly token: string;
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps): React.ReactElement {
  const t = useTranslations();
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token },
  });

  function onSubmit(values: ResetPasswordInput): void {
    setFormError(null);
    startTransition(async () => {
      const result = await resetPasswordAction(values);
      if (result && !result.ok) setFormError(result.error);
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {formError ? (
        <p
          role="alert"
          className="rounded-md bg-destructive/10 p-3 text-sm text-destructive"
        >
          {t(formError)}
        </p>
      ) : null}
      <input type="hidden" {...register("token")} />
      <AuthField<ResetPasswordInput>
        name="password"
        label={t("auth.newPassword")}
        type="password"
        autoComplete="new-password"
        register={register}
        errors={errors}
      />
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? t("common.loading") : t("auth.resetButton")}
      </Button>
    </form>
  );
}
