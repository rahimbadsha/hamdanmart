import { Toaster } from "@/components/ui/sonner";
import { StorefrontFooter } from "@/components/storefront/footer";
import { StorefrontHeader } from "@/components/storefront/header";

export default function StorefrontLayout({
  children,
}: {
  readonly children: React.ReactNode;
}): React.ReactElement {
  return (
    <div className="flex min-h-screen flex-col">
      <StorefrontHeader />
      {children}
      <StorefrontFooter />
      <Toaster position="top-center" />
    </div>
  );
}
