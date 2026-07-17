import "server-only";

import { db } from "@/lib/db";

const PAGE_SIZE = 30;

export interface AuditLogRow {
  readonly id: string;
  readonly action: string;
  readonly entityType: string;
  readonly entityId: string | null;
  readonly before: string | null;
  readonly after: string | null;
  readonly ip: string | null;
  readonly createdAt: Date;
  readonly adminUser: { name: string } | null;
}

export async function findAuditLogs(params: {
  page?: number;
  action?: string;
}): Promise<{ logs: AuditLogRow[]; total: number }> {
  const page = Math.max(1, params.page ?? 1);
  const where = params.action ? { action: { contains: params.action } } : {};

  const [logs, total] = await Promise.all([
    db.auditLog.findMany({
      where,
      include: { adminUser: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    db.auditLog.count({ where }),
  ]);

  return { logs: logs as AuditLogRow[], total };
}
