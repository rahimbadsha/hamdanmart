import "server-only";

import { writeFile, mkdir, unlink } from "fs/promises";
import { join, extname } from "path";
import { randomUUID } from "crypto";

import { requirePermission } from "@/lib/auth/guards";
import { ValidationError } from "@/lib/errors";
import type { Media } from "@/generated/prisma/client";

import {
  createMedia,
  deleteMedia as deleteMediaRecord,
  findMedia,
  findMediaById,
  updateMediaAlt,
} from "../repositories/media-repository";

const UPLOAD_DIR = join(process.cwd(), "public", "uploads");
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
]);

function sanitizeFilename(name: string): string {
  return name
    .normalize("NFC")
    .replace(/[^\w.\-]/g, "_")
    .slice(0, 200);
}

export async function getMedia(params: {
  page?: number;
  search?: string;
}): Promise<{ items: Media[]; total: number }> {
  await requirePermission("media.write");
  return findMedia(params);
}

export async function uploadMedia(file: File): Promise<Media> {
  await requirePermission("media.write");

  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    throw new ValidationError("Only JPEG, PNG, WebP, AVIF, and GIF images are allowed");
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new ValidationError("File size must be under 5 MB");
  }
  if (file.size === 0) {
    throw new ValidationError("File is empty");
  }

  const ext = extname(file.name) || ".jpg";
  const safeName = sanitizeFilename(file.name);
  const uniqueName = `${randomUUID()}${ext}`;

  await mkdir(UPLOAD_DIR, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  const filePath = join(UPLOAD_DIR, uniqueName);
  await writeFile(filePath, buffer);

  return createMedia({
    filename: safeName,
    path: `/uploads/${uniqueName}`,
    mimeType: file.type,
    sizeBytes: file.size,
    width: null,
    height: null,
    altEn: null,
    altBn: null,
  });
}

export async function deleteMediaFile(id: string): Promise<void> {
  await requirePermission("media.write");
  const media = await findMediaById(id);
  if (!media) return;

  try {
    const fullPath = join(process.cwd(), "public", media.path);
    await unlink(fullPath);
  } catch {
    // File already gone — proceed with DB cleanup
  }

  await deleteMediaRecord(id);
}

export async function setMediaAlt(
  id: string,
  altEn: string | null,
  altBn: string | null,
): Promise<void> {
  await requirePermission("media.write");
  await updateMediaAlt(id, altEn, altBn);
}
