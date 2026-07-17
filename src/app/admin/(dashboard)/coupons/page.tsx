import type { Metadata } from "next";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { requirePermission } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { formatBDT, formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Coupons — HamdanMart Admin" };

export default async function AdminCouponsPage(): Promise<React.ReactElement> {
  await requirePermission("coupons.read");

  const coupons = await db.coupon.findMany({
    where: { deletedAt: null },
    include: { _count: { select: { usages: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Coupons</h1>
        <p className="text-sm text-muted-foreground">{coupons.length} total</p>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Value</TableHead>
              <TableHead className="text-center">Used</TableHead>
              <TableHead className="text-center">Limit</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead className="text-center">Active</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {coupons.map((coupon) => {
              const now = new Date();
              const expired = coupon.endsAt ? coupon.endsAt < now : false;
              return (
                <TableRow key={coupon.id}>
                  <TableCell className="font-mono font-medium">{coupon.code}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{coupon.type}</Badge>
                  </TableCell>
                  <TableCell>
                    {coupon.type === "PERCENT"
                      ? `${coupon.value}%${coupon.maxDiscountPoisha ? ` (max ${formatBDT(coupon.maxDiscountPoisha)})` : ""}`
                      : formatBDT(coupon.value)}
                  </TableCell>
                  <TableCell className="text-center">{coupon._count.usages}</TableCell>
                  <TableCell className="text-center">
                    {coupon.usageLimit ?? "∞"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {coupon.endsAt ? formatDate(coupon.endsAt) : "Never"}
                  </TableCell>
                  <TableCell className="text-center">
                    {coupon.isActive && !expired ? (
                      <Badge variant="default">Active</Badge>
                    ) : expired ? (
                      <Badge variant="destructive">Expired</Badge>
                    ) : (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
