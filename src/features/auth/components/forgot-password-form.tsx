"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";

import { forgotPasswordAction } from "../actions";
import { forgotPasswordSchema, type ForgotPasswordInput } from "../schemas";
import { AuthField } from "./auth-field";

export function ForgotPasswordForm(): React.ReactElement {
  const t = useTranslations();
  const [formError, setFormError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [pending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({ resolver: zodResolver(forgotPasswordSchema) });

  function onSubmit(values: ForgotPasswordInput): void {
    setFormError(null);
    startTransition(async () => {
      const result = await forgotPasswordAction(values);
      if (result && !result.ok) {
        setFormError(result.error);
      } else {
        setSent(true);
      }
    });
  }

  if (sent) {
    return (
      <p role="status" className="rounded-md bg-secondary p-4 text-sm">
        {t("auth.resetEmailSent")}
      </p>
    );
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
      <AuthField<ForgotPasswordInput>
        name="email"
        label={t("auth.email")}
        type="email"
        autoComplete="email"
        register={register}
        errors={errors}
      />
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? t("common.loading") : t("auth.sendResetLink")}
      </Button>
    </form>
  );
}
