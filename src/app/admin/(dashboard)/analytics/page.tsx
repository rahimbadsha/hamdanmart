import type { Metadata } from "next";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requirePermission } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { formatBDT } from "@/lib/utils";

export const metadata: Metadata = { title: "Analytics — HamdanMart Admin" };

async function getAnalytics(): Promise<{
  totalRevenue: number;
  orderCount: number;
  avgOrderValue: number;
  topProducts: Array<{ nameEn: string; totalSold: number; revenue: number }>;
  statusBreakdown: Array<{ status: string; count: number }>;
}> {
  const [revenueAgg, orderCount, topItems, statusGroups] = await Promise.all([
    db.order.aggregate({
      _sum: { totalPoisha: true },
      where: { status: { not: "CANCELLED" } },
    }),
    db.order.count({ where: { status: { not: "CANCELLED" } } }),
    db.orderItem.groupBy({
      by: ["nameEn"],
      _sum: { quantity: true, totalPoisha: true },
      orderBy: { _sum: { totalPoisha: "desc" } },
      take: 10,
    }),
    db.order.groupBy({
      by: ["status"],
      _count: true,
      orderBy: { _count: { id: "desc" } },
    }),
  ]);

  const totalRevenue = revenueAgg._sum.totalPoisha ?? 0;

  return {
    totalRevenue,
    orderCount,
    avgOrderValue: orderCount > 0 ? Math.round(totalRevenue / orderCount) : 0,
    topProducts: topItems.map((item) => ({
      nameEn: item.nameEn,
      totalSold: item._sum.quantity ?? 0,
      revenue: item._sum.totalPoisha ?? 0,
    })),
    statusBreakdown: statusGroups.map((g) => ({
      status: g.status,
      count: g._count,
    })),
  };
}

export default async function AdminAnalyticsPage(): Promise<React.ReactElement> {
  await requirePermission("reports.read");
  const analytics = await getAnalytics();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Analytics</h1>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatBDT(analytics.totalRevenue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Completed Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{analytics.orderCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Avg. Order Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatBDT(analytics.avgOrderValue)}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Products</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.topProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No sales data yet.</p>
            ) : (
              <ol className="space-y-2 text-sm">
                {analytics.topProducts.map((product, index) => (
                  <li key={product.nameEn} className="flex items-center justify-between">
                    <span>
                      <span className="mr-2 text-muted-foreground">{index + 1}.</span>
                      {product.nameEn}
                      <span className="ml-1 text-muted-foreground">
                        ({product.totalSold} sold)
                      </span>
                    </span>
                    <span className="font-medium">{formatBDT(product.revenue)}</span>
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Order Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {analytics.statusBreakdown.map((entry) => (
                <li key={entry.status} className="flex items-center justify-between">
                  <span>{entry.status}</span>
                  <span className="font-bold">{entry.count}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
