import "server-only";

import { db } from "@/lib/db";
import type { Media } from "@/generated/prisma/client";

const PAGE_SIZE = 24;

export async function findMedia(params: {
  page?: number;
  search?: string;
}): Promise<{ items: Media[]; total: number }> {
  const page = Math.max(1, params.page ?? 1);
  const where = params.search ? { filename: { contains: params.search } } : {};

  const [items, total] = await Promise.all([
    db.media.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    db.media.count({ where }),
  ]);

  return { items, total };
}

export async function findMediaById(id: string): Promise<Media | null> {
  return db.media.findUnique({ where: { id } });
}

export async function createMedia(data: {
  filename: string;
  path: string;
  mimeType: string;
  sizeBytes: number;
  width: number | null;
  height: number | null;
  altEn: string | null;
  altBn: string | null;
}): Promise<Media> {
  return db.media.create({ data });
}

export async function deleteMedia(id: string): Promise<void> {
  await db.media.delete({ where: { id } });
}

export async function updateMediaAlt(
  id: string,
  altEn: string | null,
  altBn: string | null,
): Promise<void> {
  await db.media.update({
    where: { id },
    data: { altEn, altBn },
  });
}
