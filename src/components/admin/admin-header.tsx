import { Badge } from "@/components/ui/badge";
import { getCurrentAdmin } from "@/lib/auth/session";
import { LogoutButton } from "@/features/auth/components/logout-button";

export async function AdminHeader(): Promise<React.ReactElement> {
  const admin = await getCurrentAdmin();

  return (
    <header className="flex h-14 items-center justify-between border-b bg-background px-4">
      <span className="text-sm font-medium lg:hidden">HamdanMart Admin</span>
      <div className="ml-auto flex items-center gap-3">
        {admin ? (
          <>
            <span className="text-sm">{admin.name}</span>
            <Badge variant="secondary" className="text-xs">
              {admin.role.name}
            </Badge>
            <LogoutButton variant="admin" />
          </>
        ) : null}
      </div>
    </header>
  );
}
