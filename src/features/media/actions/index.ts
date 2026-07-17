"use server";

import { revalidatePath } from "next/cache";

import { toActionFailure, type ActionFailure } from "@/lib/action-result";

import { deleteMediaFile, setMediaAlt, uploadMedia } from "../services/media-service";

interface UploadSuccess {
  readonly ok: true;
  readonly mediaId: string;
}

export type UploadResult = UploadSuccess | ActionFailure;

export async function uploadMediaAction(formData: FormData): Promise<UploadResult> {
  try {
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return { ok: false, error: "No file provided" };
    }
    const media = await uploadMedia(file);
    revalidatePath("/admin/media");
    return { ok: true, mediaId: media.id };
  } catch (error) {
    return toActionFailure(error);
  }
}

export async function deleteMediaAction(id: string): Promise<ActionFailure | undefined> {
  try {
    await deleteMediaFile(id);
    revalidatePath("/admin/media");
    return undefined;
  } catch (error) {
    return toActionFailure(error);
  }
}

export async function updateMediaAltAction(input: {
  id: string;
  altEn: string | null;
  altBn: string | null;
}): Promise<ActionFailure | undefined> {
  try {
    await setMediaAlt(input.id, input.altEn, input.altBn);
    revalidatePath("/admin/media");
    return undefined;
  } catch (error) {
    return toActionFailure(error);
  }
}
