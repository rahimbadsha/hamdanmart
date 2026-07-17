import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { RegisterForm } from "@/features/auth/components/register-form";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth");
  return { title: t("registerTitle") };
}

export default async function RegisterPage(): Promise<React.ReactElement> {
  const t = await getTranslations("auth");

  return (
    <div className="space-y-4">
      <h1 className="text-center text-lg font-semibold">{t("registerTitle")}</h1>
      <RegisterForm />
    </div>
  );
}
