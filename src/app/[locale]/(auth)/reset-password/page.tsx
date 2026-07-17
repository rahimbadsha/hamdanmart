import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth");
  return { title: t("resetTitle") };
}

interface ResetPasswordPageProps {
  readonly searchParams: Promise<{ token?: string }>;
}

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps): Promise<React.ReactElement> {
  const t = await getTranslations("auth");
  const { token } = await searchParams;

  if (!token) {
    return (
      <p role="alert" className="text-sm text-destructive">
        {t("invalidResetLink")}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-center text-lg font-semibold">{t("resetTitle")}</h1>
      <ResetPasswordForm token={token} />
    </div>
  );
}
