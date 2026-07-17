"use client";

import {
  BarChart3,
  Box,
  Image,
  LayoutDashboard,
  Package,
  ScrollText,
  Settings,
  ShoppingCart,
  Tag,
  Ticket,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: Tag },
  { href: "/admin/inventory", label: "Inventory", icon: Box },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/coupons", label: "Coupons", icon: Ticket },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/media", label: "Media", icon: Image },
  { href: "/admin/audit-logs", label: "Audit Logs", icon: ScrollText },
  { href: "/admin/settings", label: "Settings", icon: Settings },
] as const;

export function AdminSidebar(): React.ReactElement {
  const pathname = usePathname();

  return (
    <aside className="hidden w-56 shrink-0 border-r bg-background lg:block">
      <div className="p-4">
        <Link href="/admin" className="text-lg font-bold">
          HamdanMart
        </Link>
        <p className="text-xs text-muted-foreground">Admin Panel</p>
      </div>
      <nav className="space-y-0.5 px-2">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              <Icon className="size-4" />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
