"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";

import { adminLoginAction } from "../actions/admin";
import { adminLoginSchema, type AdminLoginInput } from "../schemas";
import { AuthField } from "./auth-field";

export function AdminLoginForm(): React.ReactElement {
  const t = useTranslations();
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminLoginInput>({ resolver: zodResolver(adminLoginSchema) });

  function onSubmit(values: AdminLoginInput): void {
    setFormError(null);
    startTransition(async () => {
      const result = await adminLoginAction(values);
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
      <AuthField<AdminLoginInput>
        name="email"
        label={t("auth.email")}
        type="email"
        autoComplete="email"
        register={register}
        errors={errors}
      />
      <AuthField<AdminLoginInput>
        name="password"
        label={t("auth.password")}
        type="password"
        autoComplete="current-password"
        register={register}
        errors={errors}
      />
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? t("common.loading") : t("auth.loginButton")}
      </Button>
    </form>
  );
}
