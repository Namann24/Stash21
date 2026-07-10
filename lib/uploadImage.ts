import { supabase } from "@/lib/supabaseClient";
import { logError } from "@/lib/errorHandler";

async function uploadToBucket(file: File, bucket: string, folder: string): Promise<string | null> {
  const ext = file.name.split(".").pop() || "jpg";
  const fileName = `${folder}/${crypto.randomUUID()}.${ext}`;

  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: "31536000",
        upsert: false
      });

    if (error) {
      logError(`uploadToBucket(${bucket})`, error);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  } catch (err) {
    logError(`uploadToBucket(${bucket})`, err);
    return null;
  }
}

export async function uploadCoverImage(file: File): Promise<string | null> {
  return uploadToBucket(file, "covers", "covers");
}

export async function uploadInlineImage(file: File): Promise<string | null> {
  return uploadToBucket(file, "images", "images");
}
