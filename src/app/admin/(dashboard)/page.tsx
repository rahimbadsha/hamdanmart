import type { Metadata } from "next";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";
import { formatBDT } from "@/lib/utils";

export const metadata: Metadata = { title: "Dashboard — HamdanMart Admin" };

async function getStats(): Promise<{
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  totalProducts: number;
  totalCustomers: number;
  lowStockCount: number;
}> {
  const [
    totalOrders,
    pendingOrders,
    revenueAgg,
    totalProducts,
    totalCustomers,
    lowStockCount,
  ] = await Promise.all([
    db.order.count(),
    db.order.count({ where: { status: { in: ["PENDING", "CONFIRMED"] } } }),
    db.order.aggregate({
      _sum: { totalPoisha: true },
      where: { status: { not: "CANCELLED" } },
    }),
    db.product.count({ where: { isActive: true, deletedAt: null } }),
    db.user.count(),
    db.inventory.count({ where: { quantity: { lt: 5 } } }),
  ]);

  return {
    totalOrders,
    pendingOrders,
    totalRevenue: revenueAgg._sum.totalPoisha ?? 0,
    totalProducts,
    totalCustomers,
    lowStockCount,
  };
}

export default async function AdminDashboardPage(): Promise<React.ReactElement> {
  const stats = await getStats();

  const cards = [
    { title: "Total Orders", value: String(stats.totalOrders) },
    { title: "Pending Orders", value: String(stats.pendingOrders) },
    { title: "Revenue", value: formatBDT(stats.totalRevenue) },
    { title: "Active Products", value: String(stats.totalProducts) },
    { title: "Customers", value: String(stats.totalCustomers) },
    { title: "Low Stock Items", value: String(stats.lowStockCount) },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{card.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
