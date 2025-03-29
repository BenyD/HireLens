import { NextRequest, NextResponse } from "next/server";
import { parseFormData, removeFile } from "@/lib/file-upload";
import { parseFile, parseText } from "@/lib/parsers/document-parser";
import {
  getOrCreateSessionId,
  storeJobDescriptionContent,
} from "@/lib/session-storage";

// Disable default body parser to handle file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

/**
 * Handle job description upload request
 */
export async function POST(req: NextRequest) {
  console.log("Processing job description upload request...");
  let filePath = "";
  let blobUrl = undefined;

  try {
    // Parse form data
    const { fields, files } = await parseFormData(req);
    console.log("Form data parsed successfully");

    // Get session ID
    console.log("Getting session ID...");
    const sessionId = await getOrCreateSessionId();
    console.log(`Using session ID: ${sessionId}`);

    // Check if the request includes a file or text
    const jobDescriptionFile = files.jobDescription;
    const jobDescriptionText = fields.jobDescriptionText;

    // If neither file nor text is provided, return an error
    if (!jobDescriptionFile && !jobDescriptionText) {
      console.error("No job description provided in request");
      return NextResponse.json(
        { error: "No job description provided" },
        { status: 400 }
      );
    }

    try {
      let jobDescriptionContent;

      if (jobDescriptionFile) {
        // If a file is provided, process it
        filePath = jobDescriptionFile.filepath;
        blobUrl = jobDescriptionFile.blobUrl;
        const mimetype = jobDescriptionFile.mimetype || "application/pdf";
        console.log(
          `Processing job description file: ${jobDescriptionFile.originalFilename} (${mimetype})`
        );
        console.log(`Local path: ${filePath}`);
        if (blobUrl) {
          console.log(`Blob URL: ${blobUrl}`);
        }

        try {
          // NOTE: We always parse from local file path, not from Blob URL
          console.log("Parsing job description file from local path...");
          jobDescriptionContent = await parseFile(filePath, mimetype);
          console.log(
            `Job description parsed: ${jobDescriptionContent.length} document(s) extracted`
          );
        } finally {
          // Clean up the file regardless of success or failure
          console.log("Cleaning up uploaded file...");
          await removeFile(filePath, blobUrl);
          filePath = ""; // Reset filepath after cleanup
          blobUrl = undefined; // Reset blob URL
        }
      } else {
        // If text is provided, process it
        console.log(
          `Processing job description text (${jobDescriptionText.length} characters)`
        );
        jobDescriptionContent = parseText(jobDescriptionText);
        console.log("Job description text processed");
      }

      // Store job description content in the session
      storeJobDescriptionContent(sessionId, jobDescriptionContent);
      console.log("Job description stored in session");

      // Return success response
      return NextResponse.json(
        {
          success: true,
          message: "Job description processed successfully",
        },
        { status: 200 }
      );
    } catch (error) {
      console.error("Error processing job description:", error);
      // Clean up any remaining files
      if (filePath) {
        await removeFile(filePath, blobUrl);
      }
      return NextResponse.json(
        { error: "Failed to process job description" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error handling job description upload:", error);
    // Clean up any remaining files
    if (filePath) {
      await removeFile(filePath, blobUrl);
    }
    return NextResponse.json(
      { error: "Failed to upload job description" },
      { status: 500 }
    );
  }
}
