import "server-only";

import { db } from "@/lib/db";

/**
 * Settings data access — string key-value store managed from the dashboard.
 * Known keys are defined by callers (settings service, Phase 6).
 */

export async function getSetting(key: string): Promise<string | null> {
  const row = await db.setting.findUnique({ where: { key } });
  return row?.value ?? null;
}

export async function getSettings(
  keys: readonly string[],
): Promise<Record<string, string>> {
  const rows = await db.setting.findMany({ where: { key: { in: [...keys] } } });
  return Object.fromEntries(rows.map((row) => [row.key, row.value]));
}

export async function setSetting(key: string, value: string): Promise<void> {
  await db.setting.upsert({
    where: { key },
    create: { key, value },
    update: { value },
  });
}
