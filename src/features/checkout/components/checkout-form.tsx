"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import {
  useForm,
  useWatch,
  type FieldErrors,
  type UseFormRegister,
} from "react-hook-form";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HoneypotField } from "@/components/honeypot-field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { applyCouponAction } from "@/features/coupons/actions";
import { formatBDT } from "@/lib/utils";
import type { AppLocale } from "@/i18n/routing";

import { placeOrderAction } from "../actions";
import { checkoutSchema, type CheckoutInput } from "../schemas";
import type {
  CheckoutLineItem,
  CheckoutPaymentOption,
  CheckoutPrefill,
  CheckoutShippingOption,
} from "../types";

interface CheckoutFormProps {
  readonly items: readonly CheckoutLineItem[];
  readonly subtotalPoisha: number;
  readonly shippingMethods: readonly CheckoutShippingOption[];
  readonly availablePayments: readonly CheckoutPaymentOption[];
  readonly comingSoonPayments: readonly CheckoutPaymentOption[];
  readonly prefill: CheckoutPrefill | null;
  readonly isLoggedIn: boolean;
}

interface FieldProps {
  readonly name: keyof CheckoutInput;
  readonly label: string;
  readonly type?: string;
  readonly errors: FieldErrors<CheckoutInput>;
  readonly register: UseFormRegister<CheckoutInput>;
  readonly autoComplete?: string;
}

function Field({
  name,
  label,
  type = "text",
  errors,
  register,
  autoComplete,
}: FieldProps): React.ReactElement {
  const t = useTranslations();
  const message = errors[name]?.message;
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        type={type}
        autoComplete={autoComplete}
        aria-invalid={message ? true : undefined}
        {...register(name)}
      />
      {message ? (
        <p role="alert" className="text-sm text-destructive">
          {t(message)}
        </p>
      ) : null}
    </div>
  );
}

export function CheckoutForm({
  items,
  subtotalPoisha,
  shippingMethods,
  availablePayments,
  comingSoonPayments,
  prefill,
  isLoggedIn,
}: CheckoutFormProps): React.ReactElement {
  const t = useTranslations();
  const locale = useLocale() as AppLocale;
  const [pending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCode, setAppliedCode] = useState<string | null>(null);
  const [discountPoisha, setDiscountPoisha] = useState(0);
  const [couponPending, startCouponTransition] = useTransition();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CheckoutInput>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customerName: prefill?.customerName ?? "",
      customerPhone: prefill?.customerPhone ?? "",
      shippingLine1: prefill?.shippingLine1 ?? "",
      shippingLine2: prefill?.shippingLine2 ?? "",
      shippingCity: prefill?.shippingCity ?? "",
      shippingDistrict: prefill?.shippingDistrict ?? "",
      shippingPostalCode: prefill?.shippingPostalCode ?? "",
      shippingMethodId: shippingMethods[0]?.id ?? "",
      paymentMethod: availablePayments[0]?.method ?? "COD",
    },
  });

  const selectedShippingId = useWatch({ control, name: "shippingMethodId" });
  const shippingFee =
    shippingMethods.find((method) => method.id === selectedShippingId)?.feePoisha ?? 0;
  const total = subtotalPoisha - discountPoisha + shippingFee;

  function onApplyCoupon(): void {
    if (!couponCode.trim()) return;
    startCouponTransition(async () => {
      const result = await applyCouponAction({
        code: couponCode,
        subtotalPoisha,
      });
      if (result.ok) {
        setAppliedCode(result.code);
        setDiscountPoisha(result.discountPoisha);
        toast.success(t("checkout.couponApplied"));
      } else {
        setAppliedCode(null);
        setDiscountPoisha(0);
        toast.error(t(result.error));
      }
    });
  }

  function onSubmit(values: CheckoutInput): void {
    setFormError(null);
    startTransition(async () => {
      const result = await placeOrderAction({
        ...values,
        couponCode: appliedCode ?? undefined,
      });
      if (result && !result.ok) setFormError(t(result.error));
    });
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="grid gap-6 lg:grid-cols-[1fr_360px]"
      noValidate
    >
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{t("checkout.shippingAddress")}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Field
              name="customerName"
              label={t("checkout.fullName")}
              errors={errors}
              register={register}
              autoComplete="name"
            />
            <Field
              name="customerPhone"
              label={t("checkout.phone")}
              type="tel"
              errors={errors}
              register={register}
              autoComplete="tel"
            />
            <div className="sm:col-span-2">
              <Field
                name="customerEmail"
                label={t("checkout.emailOptional")}
                type="email"
                errors={errors}
                register={register}
                autoComplete="email"
              />
            </div>
            <div className="sm:col-span-2">
              <Field
                name="shippingLine1"
                label={t("checkout.addressLine1")}
                errors={errors}
                register={register}
                autoComplete="address-line1"
              />
            </div>
            <div className="sm:col-span-2">
              <Field
                name="shippingLine2"
                label={t("checkout.addressLine2")}
                errors={errors}
                register={register}
                autoComplete="address-line2"
              />
            </div>
            <Field
              name="shippingCity"
              label={t("checkout.city")}
              errors={errors}
              register={register}
              autoComplete="address-level2"
            />
            <Field
              name="shippingDistrict"
              label={t("checkout.district")}
              errors={errors}
              register={register}
              autoComplete="address-level1"
            />
            <Field
              name="shippingPostalCode"
              label={t("checkout.postalCode")}
              errors={errors}
              register={register}
              autoComplete="postal-code"
            />
            {isLoggedIn ? (
              <label className="flex items-center gap-2 self-end text-sm">
                <input
                  type="checkbox"
                  className="size-4 accent-primary"
                  {...register("saveAddress")}
                />
                {t("checkout.saveAddress")}
              </label>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("checkout.deliveryMethod")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {shippingMethods.map((method) => (
              <label
                key={method.id}
                className="flex items-center justify-between gap-3 rounded-md border p-3 has-[:checked]:border-primary"
              >
                <span className="flex items-center gap-2">
                  <input
                    type="radio"
                    value={method.id}
                    className="size-4 accent-primary"
                    {...register("shippingMethodId")}
                  />
                  {locale === "bn" ? method.nameBn : method.nameEn}
                </span>
                <span className="font-medium">{formatBDT(method.feePoisha, locale)}</span>
              </label>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("checkout.paymentMethod")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {availablePayments.map((payment) => (
              <label
                key={payment.method}
                className="flex items-center gap-2 rounded-md border p-3 has-[:checked]:border-primary"
              >
                <input
                  type="radio"
                  value={payment.method}
                  className="size-4 accent-primary"
                  {...register("paymentMethod")}
                />
                {locale === "bn" ? payment.labelBn : payment.labelEn}
              </label>
            ))}
            {comingSoonPayments.map((payment) => (
              <div
                key={payment.method}
                className="flex items-center justify-between gap-2 rounded-md border border-dashed p-3 text-muted-foreground"
              >
                <span>{locale === "bn" ? payment.labelBn : payment.labelEn}</span>
                <span className="text-xs">{t("checkout.comingSoon")}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("checkout.orderNote")}</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              rows={3}
              placeholder={t("checkout.notePlaceholder")}
              {...register("customerNote")}
            />
          </CardContent>
        </Card>
      </div>

      <aside className="space-y-4 lg:sticky lg:top-4 lg:self-start">
        <Card>
          <CardHeader>
            <CardTitle>{t("checkout.orderSummary")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2 text-sm">
              {items.map((item, index) => (
                <li key={index} className="flex justify-between gap-2">
                  <span className="min-w-0">
                    <span className="line-clamp-1">
                      {locale === "bn" ? item.nameBn : item.nameEn}
                    </span>
                    <span className="text-muted-foreground">
                      {locale === "bn" ? item.variantNameBn : item.variantNameEn} ×{" "}
                      {item.quantity}
                    </span>
                  </span>
                  <span className="shrink-0">
                    {formatBDT(item.unitPricePoisha * item.quantity, locale)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="space-y-2 border-t pt-3">
              <Label htmlFor="coupon">{t("checkout.coupon")}</Label>
              <div className="flex gap-2">
                <Input
                  id="coupon"
                  value={couponCode}
                  onChange={(event) => setCouponCode(event.target.value)}
                  placeholder="WELCOME10"
                  disabled={couponPending}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={onApplyCoupon}
                  disabled={couponPending}
                >
                  {t("checkout.apply")}
                </Button>
              </div>
              {appliedCode ? (
                <p className="text-sm text-green-700 dark:text-green-500">
                  {t("checkout.couponApplied")} · {appliedCode}
                </p>
              ) : null}
            </div>

            <dl className="space-y-1.5 border-t pt-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">{t("cart.subtotal")}</dt>
                <dd>{formatBDT(subtotalPoisha, locale)}</dd>
              </div>
              {discountPoisha > 0 ? (
                <div className="flex justify-between text-green-700 dark:text-green-500">
                  <dt>{t("checkout.discount")}</dt>
                  <dd>−{formatBDT(discountPoisha, locale)}</dd>
                </div>
              ) : null}
              <div className="flex justify-between">
                <dt className="text-muted-foreground">{t("checkout.shipping")}</dt>
                <dd>{formatBDT(shippingFee, locale)}</dd>
              </div>
              <div className="flex justify-between border-t pt-1.5 text-base font-bold">
                <dt>{t("checkout.total")}</dt>
                <dd>{formatBDT(total, locale)}</dd>
              </div>
            </dl>

            {formError ? (
              <p
                role="alert"
                className="rounded-md bg-destructive/10 p-3 text-sm text-destructive"
              >
                {formError}
              </p>
            ) : null}

            <HoneypotField registration={register("honeypot")} />
            <Button type="submit" size="lg" className="w-full" disabled={pending}>
              {pending ? t("common.loading") : t("checkout.placeOrder")}
            </Button>
          </CardContent>
        </Card>
      </aside>
    </form>
  );
}
