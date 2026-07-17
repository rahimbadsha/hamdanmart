"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

import { cancelOrderAction } from "../actions";

interface CancelOrderButtonProps {
  readonly orderNumber: string;
  /** Provided for guest cancellation via the tracking page. */
  readonly phone?: string;
}

export function CancelOrderButton({
  orderNumber,
  phone,
}: CancelOrderButtonProps): React.ReactElement {
  const t = useTranslations();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [pending, startTransition] = useTransition();

  function onConfirm(): void {
    startTransition(async () => {
      const result = await cancelOrderAction({ orderNumber, reason, phone });
      if (result && !result.ok) {
        toast.error(t(result.error));
      } else {
        toast.success(t("orders.cancelled"));
        setOpen(false);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          {t("orders.cancel")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("orders.cancelConfirmTitle")}</DialogTitle>
          <DialogDescription>{t("orders.cancelConfirmHint")}</DialogDescription>
        </DialogHeader>
        <Textarea
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder={t("orders.cancelReasonPlaceholder")}
          rows={3}
        />
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={pending}>
            {t("orders.keepOrder")}
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={pending}>
            {pending ? t("common.loading") : t("orders.confirmCancel")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
