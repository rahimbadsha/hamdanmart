import type { Metadata } from "next";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requirePermission } from "@/lib/auth/guards";
import { formatDateTime } from "@/lib/utils";
import { findAuditLogs } from "@/features/admin/repositories/audit-log-repository";

export const metadata: Metadata = { title: "Audit Logs — HamdanMart Admin" };

interface AuditLogsPageProps {
  readonly searchParams: Promise<{ page?: string; action?: string }>;
}

export default async function AuditLogsPage({
  searchParams,
}: AuditLogsPageProps): Promise<React.ReactElement> {
  await requirePermission("audit_logs.read");
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const { logs, total } = await findAuditLogs({ page, action: params.action });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Audit Logs</h1>
        <p className="text-sm text-muted-foreground">{total} entries</p>
      </div>

      {logs.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground">No audit logs yet.</p>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => (
            <Card key={log.id}>
              <CardHeader className="py-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{log.action}</Badge>
                    <span className="text-sm font-medium">
                      {log.entityType}
                      {log.entityId ? ` #${log.entityId.slice(0, 8)}` : ""}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{log.adminUser?.name ?? "System"}</span>
                    {log.ip ? <span>{log.ip}</span> : null}
                    <span>{formatDateTime(log.createdAt)}</span>
                  </div>
                </div>
              </CardHeader>
              {log.before || log.after ? (
                <CardContent className="py-2">
                  <div className="grid gap-2 text-xs sm:grid-cols-2">
                    {log.before ? (
                      <div>
                        <p className="mb-1 font-medium text-muted-foreground">Before</p>
                        <pre className="overflow-x-auto rounded bg-muted p-2">
                          {JSON.stringify(JSON.parse(log.before), null, 2)}
                        </pre>
                      </div>
                    ) : null}
                    {log.after ? (
                      <div>
                        <p className="mb-1 font-medium text-muted-foreground">After</p>
                        <pre className="overflow-x-auto rounded bg-muted p-2">
                          {JSON.stringify(JSON.parse(log.after), null, 2)}
                        </pre>
                      </div>
                    ) : null}
                  </div>
                </CardContent>
              ) : null}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
