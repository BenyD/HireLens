import { put, list, del } from "@vercel/blob";
import { v4 as uuidv4 } from "uuid";

// Check if Vercel Blob is configured
const isBlobConfigured =
  process.env.BLOB_READ_WRITE_TOKEN &&
  process.env.BLOB_READ_WRITE_TOKEN.length > 10;

/**
 * Upload a file to Vercel Blob storage
 * @param fileBuffer File buffer to upload
 * @param filename Original filename
 * @param contentType MIME type of the file
 * @returns URL of the uploaded file
 */
export async function uploadToBlob(
  fileBuffer: Buffer,
  filename: string,
  contentType: string
): Promise<string> {
  try {
    // Skip if Blob is not configured
    if (!isBlobConfigured) {
      console.log("Vercel Blob storage not configured, skipping upload");
      return "";
    }

    // Generate a unique filename
    const uniqueFilename = `${uuidv4()}-${filename}`;

    // Upload the file to Vercel Blob
    const blob = await put(uniqueFilename, fileBuffer, {
      contentType,
      access: "private", // Files are private by default
    });

    return blob.url;
  } catch (error) {
    console.error("Error uploading to Vercel Blob:", error);
    // Return empty string instead of throwing
    return "";
  }
}

/**
 * Delete a file from Vercel Blob storage
 * @param url URL of the file to delete
 */
export async function deleteFromBlob(url: string): Promise<void> {
  // Skip if Blob is not configured or URL is empty
  if (!isBlobConfigured || !url) {
    return;
  }

  try {
    await del(url);
  } catch (error) {
    console.error("Error deleting from Vercel Blob:", error);
    // Don't throw here - just log the error
  }
}

/**
 * List files in Vercel Blob storage
 * @param prefix Optional prefix to filter files
 * @returns List of files
 */
export async function listBlobFiles(prefix?: string): Promise<string[]> {
  // Skip if Blob is not configured
  if (!isBlobConfigured) {
    return [];
  }

  try {
    const { blobs } = await list({ prefix });
    return blobs.map((blob) => blob.url);
  } catch (error) {
    console.error("Error listing Vercel Blob files:", error);
    return [];
  }
}

/**
 * Clean up old files from Vercel Blob storage
 * @param olderThan Files older than this date (in ms) will be deleted
 */
export async function cleanupOldFiles(
  olderThan: number = 24 * 60 * 60 * 1000
): Promise<void> {
  // Skip if Blob is not configured
  if (!isBlobConfigured) {
    return;
  }

  try {
    // Use pagination to avoid memory issues with large sets of files
    let cursor: string | undefined;
    let deletedCount = 0;
    const batchSize = 50; // Process in small batches
    const now = Date.now();

    do {
      // Get files with pagination
      const result = await list({ 
        limit: batchSize,
        cursor
      });

      // Get files older than the specified time
      const oldFiles = result.blobs.filter((blob) => {
        const uploadTime = new Date(blob.uploadedAt).getTime();
        return now - uploadTime > olderThan;
      });

      // Delete old files in this batch
      for (const file of oldFiles) {
        await del(file.url);
        deletedCount++;
      }

      // Update cursor for next batch
      cursor = result.cursor;
    } while (cursor);

    console.log(`Cleaned up ${deletedCount} old files`);
  } catch (error) {
    console.error("Error cleaning up old files:", error);
  }
}
