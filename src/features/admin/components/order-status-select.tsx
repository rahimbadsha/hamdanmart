"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { OrderStatus } from "@/lib/constants";

import { adminUpdateOrderStatusAction } from "../actions/order-actions";

const TRANSITIONS: Partial<Record<OrderStatus, OrderStatus[]>> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
};

interface OrderStatusSelectProps {
  readonly orderNumber: string;
  readonly currentStatus: string;
}

export function OrderStatusSelect({
  orderNumber,
  currentStatus,
}: OrderStatusSelectProps): React.ReactElement | null {
  const [pending, startTransition] = useTransition();
  const options = TRANSITIONS[currentStatus as OrderStatus];

  if (!options || options.length === 0) return null;

  function handleChange(newStatus: string): void {
    startTransition(async () => {
      const result = await adminUpdateOrderStatusAction({
        orderNumber,
        status: newStatus,
      });
      if (result && !result.ok) {
        toast.error(result.error);
      } else {
        toast.success(`Status updated to ${newStatus}`);
      }
    });
  }

  return (
    <div className="flex items-center gap-2">
      <Select onValueChange={handleChange} disabled={pending}>
        <SelectTrigger className="w-44">
          <SelectValue placeholder="Update status…" />
        </SelectTrigger>
        <SelectContent>
          {options.map((status) => (
            <SelectItem key={status} value={status}>
              {status}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
