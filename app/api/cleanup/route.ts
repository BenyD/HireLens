import { NextRequest, NextResponse } from "next/server";
import { cleanupTempFiles } from "@/lib/file-upload";
import { cleanupExpiredSessions } from "@/lib/session-storage";
import { cleanupOldFiles } from "@/lib/blob-storage";

/**
 * Shared cleanup function used by both POST and GET handlers
 */
async function runCleanupTasks() {
  console.log("Running cleanup tasks...");

  // Track what was cleaned
  const cleanupResults = {
    tempFiles: false,
    sessions: false,
    blobStorage: false,
  };

  // 1. Clean up temporary files
  try {
    cleanupTempFiles();
    cleanupResults.tempFiles = true;
    console.log("Temporary files cleaned up");
  } catch (tempError) {
    console.error("Error cleaning up temporary files:", tempError);
  }

  // 2. Clean up expired sessions
  try {
    cleanupExpiredSessions();
    cleanupResults.sessions = true;
    console.log("Expired sessions cleaned up");
  } catch (sessionError) {
    console.error("Error cleaning up expired sessions:", sessionError);
  }

  // 3. Clean up Vercel Blob storage if configured
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      await cleanupOldFiles();
      cleanupResults.blobStorage = true;
      console.log("Blob storage cleaned up");
    } catch (blobError) {
      console.error("Error cleaning up Blob storage:", blobError);
    }
  }

  return cleanupResults;
}

/**
 * API route to clean up resources - POST method
 * This can be called periodically via a cron job or webhook
 * Requires an authorization header for production environments
 */
export async function POST(req: NextRequest) {
  // In production, require authorization for cleanup tasks
  if (process.env.NODE_ENV === "production") {
    const authHeader = req.headers.get("authorization");
    const expectedToken = process.env.CLEANUP_API_TOKEN;

    if (!expectedToken) {
      console.warn("No CLEANUP_API_TOKEN set in production environment");
    } else if (!authHeader || authHeader !== `Bearer ${expectedToken}`) {
      console.warn("Unauthorized cleanup attempt");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const results = await runCleanupTasks();

    return NextResponse.json(
      {
        success: true,
        message: "Cleanup completed",
        results,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error during cleanup:", error);
    return NextResponse.json(
      { error: "Failed to complete cleanup" },
      { status: 500 }
    );
  }
}

/**
 * API route to clean up resources - GET method
 * Provided for convenience but has the same security requirements
 */
export async function GET(req: NextRequest) {
  // Same authorization check as POST
  if (process.env.NODE_ENV === "production") {
    const authHeader = req.headers.get("authorization");
    const expectedToken = process.env.CLEANUP_API_TOKEN;

    if (!expectedToken) {
      console.warn("No CLEANUP_API_TOKEN set in production environment");
    } else if (!authHeader || authHeader !== `Bearer ${expectedToken}`) {
      console.warn("Unauthorized cleanup attempt");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const results = await runCleanupTasks();

    return NextResponse.json(
      {
        success: true,
        message: "Cleanup completed",
        results,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error during cleanup:", error);
    return NextResponse.json(
      { error: "Failed to complete cleanup" },
      { status: 500 }
    );
  }
}
