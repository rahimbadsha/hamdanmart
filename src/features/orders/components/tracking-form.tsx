"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TrackingFormProps {
  readonly defaultOrderNumber?: string;
}

/**
 * Public order-tracking form. Submits to the same page as query params so the
 * result is server-rendered (order number + phone required — no enumeration).
 */
export function TrackingForm({
  defaultOrderNumber = "",
}: TrackingFormProps): React.ReactElement {
  const t = useTranslations("orders");
  const router = useRouter();
  const [orderNumber, setOrderNumber] = useState(defaultOrderNumber);
  const [phone, setPhone] = useState("");

  function onSubmit(event: React.FormEvent): void {
    event.preventDefault();
    const params = new URLSearchParams({
      order: orderNumber.trim(),
      phone: phone.trim(),
    });
    router.push(`?${params.toString()}`);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="order">{t("orderNumber")}</Label>
        <Input
          id="order"
          value={orderNumber}
          onChange={(event) => setOrderNumber(event.target.value)}
          placeholder="HM-260717-0001"
          required
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="phone">{t("trackPhone")}</Label>
        <Input
          id="phone"
          type="tel"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          placeholder="017XXXXXXXX"
          required
        />
      </div>
      <Button type="submit" className="w-full">
        {t("trackOrder")}
      </Button>
    </form>
  );
}
