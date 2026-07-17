"use server";

import { revalidatePath } from "next/cache";

import { toActionFailure, type ActionResult } from "@/lib/action-result";
import { requirePermission } from "@/lib/auth/guards";
import { setSetting } from "@/features/admin/repositories/settings-repository";
import { writeAuditLog } from "@/features/admin/services/audit-service";

export async function saveSettingsAction(
  entries: Record<string, string>,
): Promise<ActionResult> {
  try {
    const admin = await requirePermission("settings.write");
    for (const [key, value] of Object.entries(entries)) {
      await setSetting(key, value);
    }
    await writeAuditLog({
      adminUserId: admin.id,
      action: "settings.update",
      entityType: "Setting",
      after: entries,
    });
    revalidatePath("/admin", "layout");
    return undefined;
  } catch (error) {
    return toActionFailure(error);
  }
}
