import type { Metadata } from "next";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requirePermission } from "@/lib/auth/guards";
import { getSettings } from "@/features/admin/repositories/settings-repository";
import { SettingsForm } from "@/features/admin/components/settings-form";

export const metadata: Metadata = { title: "Settings — HamdanMart Admin" };

const SETTING_KEYS = [
  "store_name",
  "store_phone",
  "store_email",
  "store_address",
  "free_shipping_threshold",
  "low_stock_threshold",
] as const;

export default async function SettingsPage(): Promise<React.ReactElement> {
  await requirePermission("settings.write");
  const settings = await getSettings(SETTING_KEYS);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Store Settings</h1>
      <Card>
        <CardHeader>
          <CardTitle>General</CardTitle>
        </CardHeader>
        <CardContent>
          <SettingsForm settings={settings} />
        </CardContent>
      </Card>
    </div>
  );
}
