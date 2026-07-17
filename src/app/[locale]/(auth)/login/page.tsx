import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { LoginForm } from "@/features/auth/components/login-form";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth");
  return { title: t("loginTitle") };
}

interface LoginPageProps {
  readonly searchParams: Promise<{ reset?: string }>;
}

export default async function LoginPage({
  searchParams,
}: LoginPageProps): Promise<React.ReactElement> {
  const t = await getTranslations("auth");
  const { reset } = await searchParams;

  return (
    <div className="space-y-4">
      <h1 className="text-center text-lg font-semibold">{t("loginTitle")}</h1>
      {reset ? (
        <p role="status" className="rounded-md bg-secondary p-3 text-sm">
          {t("passwordResetDone")}
        </p>
      ) : null}
      <LoginForm />
    </div>
  );
}
