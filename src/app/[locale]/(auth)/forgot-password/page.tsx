import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth");
  return { title: t("forgotTitle") };
}

export default async function ForgotPasswordPage(): Promise<React.ReactElement> {
  const t = await getTranslations("auth");

  return (
    <div className="space-y-4">
      <h1 className="text-center text-lg font-semibold">{t("forgotTitle")}</h1>
      <p className="text-sm text-muted-foreground">{t("forgotHint")}</p>
      <ForgotPasswordForm />
    </div>
  );
}
