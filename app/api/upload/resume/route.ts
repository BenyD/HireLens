import { NextRequest, NextResponse } from "next/server";
import { parseFormData, removeFile } from "@/lib/file-upload";
import { parseFile } from "@/lib/parsers/document-parser";
import { extractResumeInformation } from "@/lib/parsers/server-resume-analyzer";
import { extractBasicResumeInfo } from "@/lib/parsers/local-resume-parser";
import {
  getOrCreateSessionId,
  storeResumeContent,
  storeResumeStructure,
} from "@/lib/session-storage";

// Disable default body parser to handle file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

/**
 * Handle resume upload request
 */
export async function POST(req: NextRequest) {
  console.log("Processing resume upload request...");
  let filePath = "";
  let blobUrl = undefined;

  try {
    // Parse form data
    const { files } = await parseFormData(req);
    console.log("Form data parsed successfully");

    // Get uploaded file
    const resumeFile = files.resume;

    if (!resumeFile) {
      console.error("No resume file provided in request");
      return NextResponse.json(
        { error: "No resume file provided" },
        { status: 400 }
      );
    }

    // Get file path and blob URL if available
    filePath = resumeFile.filepath;
    blobUrl = resumeFile.blobUrl;
    const mimetype = resumeFile.mimetype || "application/pdf";
    console.log(
      `Processing resume: ${resumeFile.originalFilename} (${mimetype})`
    );
    console.log(`Local path: ${filePath}`);
    if (blobUrl) {
      console.log(`Blob URL: ${blobUrl}`);
    }

    try {
      // NOTE: We always parse from local file path, not from Blob URL
      // This is because the document parsers expect file paths
      console.log("Parsing resume file from local path...");
      const resumeContent = await parseFile(filePath, mimetype);
      console.log(
        `Resume parsed: ${resumeContent.length} document(s) extracted`
      );

      // Try to extract structured information from the resume using AI
      let resumeStructure;
      try {
        // Attempt to use the AI-based extraction first
        console.log("Extracting resume information using AI...");
        resumeStructure = await extractResumeInformation(resumeContent);
        console.log("AI extraction successful");
      } catch (aiError) {
        console.error("Error using AI resume extraction:", aiError);
        // Fall back to basic extraction if AI fails
        console.log("Falling back to local resume extraction...");
        resumeStructure = extractBasicResumeInfo(resumeContent);
        console.log("Local extraction completed");
      }

      // Get or create a session ID
      console.log("Getting session ID...");
      const sessionId = await getOrCreateSessionId();
      console.log(`Using session ID: ${sessionId}`);

      // Store the resume content and structure in the session
      storeResumeContent(sessionId, resumeContent);
      storeResumeStructure(sessionId, resumeStructure);
      console.log("Resume data stored in session");

      // Return response
      return NextResponse.json(
        {
          success: true,
          message: "Resume uploaded and processed successfully",
          resume: {
            filename: resumeFile.originalFilename,
            size: resumeFile.size,
            structure: resumeStructure,
          },
        },
        { status: 200 }
      );
    } catch (error) {
      console.error("Error processing resume:", error);
      return NextResponse.json(
        { error: "Failed to process resume" },
        { status: 500 }
      );
    } finally {
      // Clean up the file regardless of success or failure
      console.log("Cleaning up uploaded files...");
      await removeFile(filePath, blobUrl);
    }
  } catch (error) {
    console.error("Error handling resume upload:", error);
    if (filePath) {
      await removeFile(filePath, blobUrl);
    }
    return NextResponse.json(
      { error: "Failed to upload resume" },
      { status: 500 }
    );
  }
}
