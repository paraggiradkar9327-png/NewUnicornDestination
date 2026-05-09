// ==============================
// FILE UPLOAD HELPER
// ==============================
import { supabase } from "./supabase.js";

/**
 * Upload a file to the given Supabase Storage bucket.
 * Returns the public URL on success, null on failure.
 *
 * @param {string} bucket  - Storage bucket name ("Photos" | "Videos")
 * @param {File}   file    - The File object to upload
 * @returns {Promise<string|null>}
 */
export async function uploadFile(bucket, file) {
    const filePath = `${Date.now()}_${file.name}`;

    const { error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

    if (error) {
        console.error("Upload error:", error);
        return null;
    }

    const { data } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

    return data.publicUrl;
}