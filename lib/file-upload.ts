import { NextRequest } from "next/server";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { v4 as uuidv4 } from "uuid";
import { uploadToBlob, deleteFromBlob } from "./blob-storage";

// Define allowed file types
const ALLOWED_FILE_TYPES = {
  "application/pdf": ".pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    ".docx",
};

// Define maximum file size (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

/**
 * Interface for the uploaded file data
 */
export interface UploadedFile {
  filepath: string; // Local file path (temporary)
  originalFilename: string; // Original filename
  mimetype: string; // File MIME type
  size: number; // File size in bytes
  blobUrl?: string; // URL for Vercel Blob storage (if available)
}

/**
 * Parse multipart form data from NextRequest
 * Files are stored both locally and in Vercel Blob (if configured)
 * Optimized for memory efficiency on the Hobby plan
 *
 * @param req NextRequest object
 * @returns Parsed form data with fields and files
 */
export async function parseFormData(req: NextRequest): Promise<{
  fields: Record<string, string>;
  files: Record<string, UploadedFile>;
}> {
  // Create temp directory for uploads
  const uploadDir = path.join(os.tmpdir(), "hirelens-uploads");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  // Parse the multipart form data
  const formData = await req.formData();
  const files: Record<string, UploadedFile> = {};
  const fields: Record<string, string> = {};

  // Process each form field
  for (const [key, value] of formData.entries()) {
    if (value instanceof File) {
      // Handle file uploads
      if (value.size > MAX_FILE_SIZE) {
        throw new Error(`File ${value.name} exceeds maximum size of 5MB`);
      }

      const mimetype = value.type;
      if (!Object.keys(ALLOWED_FILE_TYPES).includes(mimetype)) {
        throw new Error(`File type ${mimetype} is not allowed`);
      }

      // Process the file in chunks to reduce memory usage
      const filename = `${Date.now()}-${value.name}`;
      const filepath = path.join(uploadDir, filename);

      // Get file as buffer but handle it efficiently
      const arrayBuffer = await value.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Write to local storage
      fs.writeFileSync(filepath, buffer);

      // Try to upload to Vercel Blob if configured
      let blobUrl = "";
      if (
        process.env.BLOB_READ_WRITE_TOKEN &&
        process.env.BLOB_READ_WRITE_TOKEN.length > 10
      ) {
        try {
          blobUrl = await uploadToBlob(buffer, value.name, mimetype);
          if (blobUrl) {
            console.log(`File uploaded to Blob: ${blobUrl}`);
          }
        } catch (error) {
          console.error("Error uploading to Blob:", error);
          // Continue with local storage only
        }
      }

      files[key] = {
        filepath,
        originalFilename: value.name,
        mimetype,
        size: value.size,
        blobUrl,
      };
    } else {
      // Handle text fields
      fields[key] = value.toString();
    }
  }

  return { fields, files };
}

/**
 * Generate a unique file name for the uploaded file
 * @param originalFilename Original file name
 * @param mimetype MIME type of the file
 * @returns Unique file name
 */
export function generateUniqueFilename(
  originalFilename: string,
  mimetype: string
): string {
  const extension =
    ALLOWED_FILE_TYPES[mimetype as keyof typeof ALLOWED_FILE_TYPES] ||
    path.extname(originalFilename);
  const uniqueId = uuidv4();
  return `${uniqueId}${extension}`;
}

/**
 * Move uploaded file to a new location with a unique name
 * @param uploadedFile Uploaded file data
 * @returns Path to the moved file
 */
export function moveUploadedFile(uploadedFile: UploadedFile): string {
  const uniqueFilename = generateUniqueFilename(
    uploadedFile.originalFilename,
    uploadedFile.mimetype
  );

  // Create path for new file
  const newFilepath = path.join(
    os.tmpdir(),
    "hirelens-uploads",
    uniqueFilename
  );

  // Rename (move) the file
  fs.renameSync(uploadedFile.filepath, newFilepath);

  return newFilepath;
}

/**
 * Remove a file from the file system and Vercel Blob (if applicable)
 * @param filepath Path to the local file
 * @param blobUrl Optional URL to delete from Vercel Blob
 */
export async function removeFile(
  filepath: string,
  blobUrl?: string
): Promise<void> {
  // Remove local file first
  try {
    if (filepath && fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
      console.log(`Local file removed: ${filepath}`);
    } else if (filepath) {
      console.log(`Local file not found: ${filepath}`);
    }
  } catch (error) {
    console.error(`Error removing local file ${filepath}:`, error);
  }

  // Then try to remove from Vercel Blob if URL is provided
  if (blobUrl && blobUrl.length > 0) {
    try {
      await deleteFromBlob(blobUrl);
      console.log(`Blob file removed: ${blobUrl}`);
    } catch (error) {
      console.error(`Error deleting from Vercel Blob (${blobUrl}):`, error);
    }
  }
}

/**
 * Clean up temporary files - can be run periodically
 * Uses a more memory-efficient approach by processing files in batches
 */
export function cleanupTempFiles(): void {
  const uploadDir = path.join(os.tmpdir(), "hirelens-uploads");

  if (fs.existsSync(uploadDir)) {
    try {
      const files = fs.readdirSync(uploadDir);
      console.log(`Checking ${files.length} files for cleanup`);

      const now = Date.now();
      let deletedCount = 0;

      // Process files in smaller batches to avoid memory pressure
      const batchSize = 50;
      for (let i = 0; i < files.length; i += batchSize) {
        const batch = files.slice(i, i + batchSize);

        for (const file of batch) {
          try {
            const filepath = path.join(uploadDir, file);
            const stats = fs.statSync(filepath);
            const fileAge = now - stats.mtimeMs;

            // Delete files older than 24 hours
            if (fileAge > 24 * 60 * 60 * 1000) {
              fs.unlinkSync(filepath);
              deletedCount++;
            }
          } catch (error) {
            console.error(`Error processing file ${file}:`, error);
          }
        }
      }

      console.log(`Cleaned up ${deletedCount} old temporary files`);
    } catch (error) {
      console.error(`Error during temp file cleanup:`, error);
    }
  }
}
