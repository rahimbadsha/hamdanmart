import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { AppError } from "@/lib/errors";
import { verifyEmail } from "@/features/auth/services/auth-service";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth");
  return { title: t("verifyTitle") };
}

interface VerifyEmailPageProps {
  readonly searchParams: Promise<{ token?: string }>;
}

export default async function VerifyEmailPage({
  searchParams,
}: VerifyEmailPageProps): Promise<React.ReactElement> {
  const t = await getTranslations();
  const { token } = await searchParams;

  let verified = false;
  if (token) {
    try {
      await verifyEmail(token);
      verified = true;
    } catch (error) {
      if (!(error instanceof AppError)) throw error;
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-xl font-semibold">
        {verified ? t("auth.verifySuccess") : t("auth.verifyFailed")}
      </h1>
      <p className="text-sm text-muted-foreground">
        {verified ? t("auth.verifySuccessHint") : t("auth.verifyFailedHint")}
      </p>
      <Link href="/" className="text-sm underline">
        {t("common.backToHome")}
      </Link>
    </main>
  );
}
