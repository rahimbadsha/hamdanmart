import type { Metadata } from "next";

import { getMedia } from "@/features/media/services/media-service";
import { MediaCard } from "@/features/media/components/media-card";
import { UploadButton } from "@/features/media/components/upload-button";

export const metadata: Metadata = { title: "Media — HamdanMart Admin" };

interface MediaPageProps {
  readonly searchParams: Promise<{ page?: string; search?: string }>;
}

export default async function AdminMediaPage({
  searchParams,
}: MediaPageProps): Promise<React.ReactElement> {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const { items, total } = await getMedia({ page, search: params.search });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Media Manager</h1>
          <p className="text-sm text-muted-foreground">{total} files</p>
        </div>
        <UploadButton />
      </div>

      {items.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground">
          No media files yet. Upload your first image.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
          {items.map((item) => (
            <MediaCard
              key={item.id}
              id={item.id}
              path={item.path}
              filename={item.filename}
              sizeBytes={item.sizeBytes}
            />
          ))}
        </div>
      )}
    </div>
  );
}
