"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

import { HoneypotField } from "@/components/honeypot-field";

import { registerAction } from "../actions";
import { registerSchema, type RegisterInput } from "../schemas";
import { AuthField } from "./auth-field";

export function RegisterForm(): React.ReactElement {
  const t = useTranslations();
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  function onSubmit(values: RegisterInput): void {
    setFormError(null);
    startTransition(async () => {
      const result = await registerAction(values);
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
      <AuthField<RegisterInput>
        name="name"
        label={t("auth.name")}
        autoComplete="name"
        register={register}
        errors={errors}
      />
      <AuthField<RegisterInput>
        name="email"
        label={t("auth.email")}
        type="email"
        autoComplete="email"
        register={register}
        errors={errors}
      />
      <AuthField<RegisterInput>
        name="phone"
        label={t("auth.phone")}
        type="tel"
        autoComplete="tel"
        register={register}
        errors={errors}
      />
      <AuthField<RegisterInput>
        name="password"
        label={t("auth.password")}
        type="password"
        autoComplete="new-password"
        register={register}
        errors={errors}
      />
      <HoneypotField registration={register("honeypot")} />
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? t("common.loading") : t("auth.registerButton")}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        {t("auth.haveAccount")}{" "}
        <Link href="/login" className="underline">
          {t("auth.loginLink")}
        </Link>
      </p>
    </form>
  );
}
