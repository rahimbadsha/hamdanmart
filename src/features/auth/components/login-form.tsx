"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

import { loginAction } from "../actions";
import { loginSchema, type LoginInput } from "../schemas";
import { AuthField } from "./auth-field";

export function LoginForm(): React.ReactElement {
  const t = useTranslations();
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  function onSubmit(values: LoginInput): void {
    setFormError(null);
    startTransition(async () => {
      const result = await loginAction(values);
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
      <AuthField<LoginInput>
        name="email"
        label={t("auth.email")}
        type="email"
        autoComplete="email"
        register={register}
        errors={errors}
      />
      <AuthField<LoginInput>
        name="password"
        label={t("auth.password")}
        type="password"
        autoComplete="current-password"
        register={register}
        errors={errors}
      />
      <div className="text-right text-sm">
        <Link href="/forgot-password" className="text-muted-foreground underline">
          {t("auth.forgotPassword")}
        </Link>
      </div>
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? t("common.loading") : t("auth.loginButton")}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        {t("auth.noAccount")}{" "}
        <Link href="/register" className="underline">
          {t("auth.registerLink")}
        </Link>
      </p>
    </form>
  );
}
