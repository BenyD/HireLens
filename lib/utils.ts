import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import mammoth from "mammoth";
import { HfInference } from "@huggingface/inference";
import { supabase } from "./supabase";
import * as pdfjsLib from "pdfjs-dist";
import axios from "axios";
import { PDFPageProxy } from "pdfjs-dist";

const hf = new HfInference(process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY);

// Initialize PDF.js worker
if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

interface GetTextContentParameters {
  normalizeWhitespace?: boolean;
  disableCombineTextItems?: boolean;
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function extractTextFromFile(file: File): Promise<string> {
  if (file.type === "application/pdf") {
    try {
      // Create a URL for the file
      const fileUrl = URL.createObjectURL(file);

      // Configure PDF.js to handle font-related warnings
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

      // Load the PDF document with additional options
      const pdf = await pdfjsLib.getDocument({
        url: fileUrl,
        cMapUrl: `//cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/cmaps/`,
        cMapPacked: true,
        standardFontDataUrl: `//cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/standard_fonts/`,
      }).promise;

      let fullText = "";

      // Extract text from each page
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();

        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(" ")
          .replace(/\s+/g, " ")
          .trim();

        fullText += pageText + "\n\n";
      }

      // Clean up the URL
      URL.revokeObjectURL(fileUrl);

      return fullText.trim();
    } catch (error) {
      console.error("PDF processing error:", error);
      throw new Error("Failed to parse PDF: " + (error as Error).message);
    }
  } else if (
    file.type ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  }
  throw new Error("Unsupported file type");
}

// Add this helper function for retrying failed requests
async function fetchWithRetry(url: string, options: any, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await axios({
        url,
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY}`,
          "Content-Type": "application/json",
        },
        data: options.body ? JSON.parse(options.body) : options,
      });
      return response.data;
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1))); // Exponential backoff
    }
  }
}

export async function analyzeResume(
  resumeText: string,
  jobDescriptionText: string
) {
  try {
    console.log("Starting resume analysis...", {
      resumePreview: resumeText.substring(0, 100) + "...",
      jobDescriptionPreview: jobDescriptionText.substring(0, 100) + "...",
    });

    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        resumeText,
        jobDescriptionText,
      }),
    });

    if (!response.ok) {
      console.error("Analysis API error:", {
        status: response.status,
        statusText: response.statusText,
      });
      throw new Error(`Failed to analyze resume: ${response.statusText}`);
    }

    const result = await response.json();
    console.log("Analysis completed successfully:", result);
    return result;
  } catch (error) {
    console.error("Resume analysis error:", error);
    throw error;
  }
}

export async function storeResume(sessionId: string, content: string) {
  const { data, error } = await supabase
    .from("resumes")
    .insert([{ session_id: sessionId, content }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function storeJobDescription(sessionId: string, content: string) {
  const { data, error } = await supabase
    .from("job_descriptions")
    .insert([{ session_id: sessionId, content }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function storeAnalysis(
  sessionId: string,
  resumeId: string,
  jobDescriptionId: string,
  analysisResult: any
) {
  const { data, error } = await supabase
    .from("analyses")
    .insert([
      {
        session_id: sessionId,
        resume_id: resumeId,
        job_description_id: jobDescriptionId,
        analysis_result: analysisResult,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}
