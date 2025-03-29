import { cookies } from "next/headers";
import { Document } from "@langchain/core/documents";
import { ResumeStructure } from "./parsers/server-resume-analyzer";

// Session data type
export interface SessionData {
  resumeContent?: Document[];
  resumeStructure?: ResumeStructure;
  jobDescriptionContent?: Document[];
  analysisResults?: any;
  improvedResume?: string;
  sessionId: string;
}

// In-memory storage for session data
// This will be cleared when the server restarts
// For production, you would use a more persistent storage like Redis
const sessionStorage = new Map<string, SessionData>();

/**
 * Generate a random session ID
 * @returns Random session ID
 */
export function generateSessionId(): string {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

/**
 * Get the current session ID from cookies or create a new one
 * @returns Session ID
 */
export async function getOrCreateSessionId(): Promise<string> {
  try {
    const cookieStore = cookies();
    const existingSessionId = cookieStore.get("sessionId")?.value;

    if (existingSessionId) {
      return existingSessionId;
    }

    const newSessionId = generateSessionId();

    try {
      cookieStore.set("sessionId", newSessionId, {
        httpOnly: true,
        path: "/",
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
        maxAge: 24 * 60 * 60, // 24 hours
      });
    } catch (error) {
      console.error("Error setting cookie:", error);
      // Continue even if setting cookie fails
    }

    return newSessionId;
  } catch (error) {
    console.error("Error in session management:", error);
    // Fallback to a new session ID if anything fails
    return generateSessionId();
  }
}

/**
 * Get session data for the given session ID
 * @param sessionId Session ID
 * @returns Session data
 */
export function getSessionData(sessionId: string): SessionData | undefined {
  return sessionStorage.get(sessionId);
}

/**
 * Set session data for the given session ID
 * @param sessionId Session ID
 * @param data Session data
 */
export function setSessionData(
  sessionId: string,
  data: Partial<SessionData>
): void {
  const existingData = sessionStorage.get(sessionId) || { sessionId };
  sessionStorage.set(sessionId, { ...existingData, ...data });
}

/**
 * Delete session data for the given session ID
 * @param sessionId Session ID
 */
export function deleteSessionData(sessionId: string): void {
  sessionStorage.delete(sessionId);
}

/**
 * Store resume content in the session
 * @param sessionId Session ID
 * @param resumeContent Resume content
 */
export function storeResumeContent(
  sessionId: string,
  resumeContent: Document[]
): void {
  setSessionData(sessionId, { resumeContent });
}

/**
 * Store resume structure in the session
 * @param sessionId Session ID
 * @param resumeStructure Resume structure
 */
export function storeResumeStructure(
  sessionId: string,
  resumeStructure: ResumeStructure
): void {
  setSessionData(sessionId, { resumeStructure });
}

/**
 * Store job description content in the session
 * @param sessionId Session ID
 * @param jobDescriptionContent Job description content
 */
export function storeJobDescriptionContent(
  sessionId: string,
  jobDescriptionContent: Document[]
): void {
  setSessionData(sessionId, { jobDescriptionContent });
}

/**
 * Store analysis results in the session
 * @param sessionId Session ID
 * @param analysisResults Analysis results
 */
export function storeAnalysisResults(
  sessionId: string,
  analysisResults: any
): void {
  setSessionData(sessionId, { analysisResults });
}

/**
 * Store improved resume in the session
 * @param sessionId Session ID
 * @param improvedResume Improved resume
 */
export function storeImprovedResume(
  sessionId: string,
  improvedResume: string
): void {
  setSessionData(sessionId, { improvedResume });
}

/**
 * Clear all session data when the user closes the browser
 * This would be called by a cleanup mechanism
 */
export function cleanupExpiredSessions(): void {
  // In a real app, you would check for expired sessions based on last access time
  // For this example, we're not implementing this
}
