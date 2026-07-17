"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";

import { logoutAction } from "../actions";
import { adminLogoutAction } from "../actions/admin";

interface LogoutButtonProps {
  readonly variant?: "customer" | "admin";
}

export function LogoutButton({
  variant = "customer",
}: LogoutButtonProps): React.ReactElement {
  const t = useTranslations("auth");
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await (variant === "admin" ? adminLogoutAction() : logoutAction());
        })
      }
    >
      {t("logout")}
    </Button>
  );
}
