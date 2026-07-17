import "server-only";

import { headers } from "next/headers";

import { db } from "@/lib/db";

export interface AuditEntry {
  readonly adminUserId: string;
  readonly action: string;
  readonly entityType: string;
  readonly entityId?: string;
  readonly before?: Record<string, unknown>;
  readonly after?: Record<string, unknown>;
}

export async function writeAuditLog(entry: AuditEntry): Promise<void> {
  const hdrs = await headers();
  const ip = hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;

  await db.auditLog.create({
    data: {
      adminUserId: entry.adminUserId,
      action: entry.action,
      entityType: entry.entityType,
      entityId: entry.entityId ?? null,
      before: entry.before ? JSON.stringify(entry.before) : null,
      after: entry.after ? JSON.stringify(entry.after) : null,
      ip,
    },
  });
}
