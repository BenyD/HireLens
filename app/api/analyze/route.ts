import { NextRequest, NextResponse } from "next/server";
import {
  getOrCreateSessionId,
  getSessionData,
  storeAnalysisResults,
  storeImprovedResume,
} from "@/lib/session-storage";
import {
  analyzeResumeAgainstJob,
  generateImprovedResume,
} from "@/lib/parsers/server-resume-analyzer";
import {
  analyzeBasicResumeMatch,
  generateBasicImprovedResume,
} from "@/lib/parsers/local-resume-parser";

/**
 * Handle resume analysis request
 */
export async function POST(req: NextRequest) {
  console.log("Starting resume analysis...");

  try {
    // Get session ID
    const sessionId = await getOrCreateSessionId();
    console.log(`Using session ID: ${sessionId}`);

    // Get session data
    const sessionData = getSessionData(sessionId);

    // Check if resume and job description are available
    if (
      !sessionData ||
      !sessionData.resumeContent ||
      !sessionData.jobDescriptionContent
    ) {
      console.error("Missing resume or job description in session");
      return NextResponse.json(
        {
          error:
            "Resume or job description not found. Please upload them first.",
        },
        { status: 400 }
      );
    }

    // Log the content we have
    console.log(
      `Resume content: ${sessionData.resumeContent.length} documents`
    );
    console.log(
      `Job description: ${sessionData.jobDescriptionContent.length} documents`
    );

    try {
      // Try AI-based analysis first
      let analysisResults;
      let improvedResume;

      try {
        console.log("Attempting AI-based analysis...");
        // Analyze resume against job description using AI
        analysisResults = await analyzeResumeAgainstJob(
          sessionData.resumeContent,
          sessionData.jobDescriptionContent
        );
        console.log("AI analysis successful");

        // Generate improved resume using AI
        console.log("Generating improved resume with AI...");
        improvedResume = await generateImprovedResume(
          sessionData.resumeContent,
          sessionData.jobDescriptionContent,
          analysisResults
        );
        console.log("AI resume generation successful");
      } catch (aiError) {
        console.error("Error using AI for analysis:", aiError);

        // Fall back to local analysis
        console.log("Falling back to local resume analysis...");

        // Use local fallback functions
        analysisResults = analyzeBasicResumeMatch(
          sessionData.resumeContent,
          sessionData.jobDescriptionContent
        );
        console.log("Local analysis completed");

        improvedResume = generateBasicImprovedResume(
          sessionData.resumeContent,
          sessionData.jobDescriptionContent,
          analysisResults
        );
        console.log("Local resume generation completed");
      }

      // Store results in session
      storeAnalysisResults(sessionId, analysisResults);
      storeImprovedResume(sessionId, improvedResume);
      console.log("Analysis results stored in session");

      // Return results
      return NextResponse.json(
        {
          success: true,
          message: "Resume analysis completed successfully",
          analysis: analysisResults,
          improvedResume: improvedResume,
        },
        { status: 200 }
      );
    } catch (error) {
      console.error("Error analyzing resume:", error);
      return NextResponse.json(
        { error: "Failed to analyze resume" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error handling analysis request:", error);
    return NextResponse.json(
      { error: "Failed to process analysis request" },
      { status: 500 }
    );
  }
}

/**
 * Handle GET request to retrieve analysis results
 */
export async function GET(req: NextRequest) {
  console.log("Retrieving analysis results...");

  try {
    // Get session ID
    const sessionId = await getOrCreateSessionId();
    console.log(`Using session ID: ${sessionId}`);

    // Get session data
    const sessionData = getSessionData(sessionId);

    // Check if analysis results are available
    if (!sessionData || !sessionData.analysisResults) {
      console.error("No analysis results found in session");
      return NextResponse.json(
        {
          error:
            "Analysis results not found. Please analyze your resume first.",
        },
        { status: 404 }
      );
    }

    console.log("Returning analysis results from session");
    // Return analysis results
    return NextResponse.json(
      {
        success: true,
        analysis: sessionData.analysisResults,
        improvedResume: sessionData.improvedResume,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error retrieving analysis results:", error);
    return NextResponse.json(
      { error: "Failed to retrieve analysis results" },
      { status: 500 }
    );
  }
}
