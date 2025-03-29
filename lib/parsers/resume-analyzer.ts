"use client";

import { Document } from "@langchain/core/documents";
import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { z } from "zod";

// Define the structured output schema for resume analysis
const resumeStructureSchema = z.object({
  contactInfo: z.object({
    name: z.string().optional(),
    email: z.string().optional(),
    phone: z.string().optional(),
    location: z.string().optional(),
    linkedin: z.string().optional(),
  }),
  summary: z.string().optional(),
  education: z
    .array(
      z.object({
        institution: z.string(),
        degree: z.string(),
        field: z.string().optional(),
        date: z.string().optional(),
      })
    )
    .optional(),
  experience: z
    .array(
      z.object({
        company: z.string(),
        position: z.string(),
        duration: z.string().optional(),
        description: z.array(z.string()).optional(),
      })
    )
    .optional(),
  skills: z.array(z.string()).optional(),
  certifications: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
});

// Type for resume structure
export type ResumeStructure = z.infer<typeof resumeStructureSchema>;

/**
 * Extracts structured information from a resume document
 * @param resumeContent Document objects containing resume text
 * @returns Structured resume data
 */
export async function extractResumeInformation(
  resumeContent: Document[]
): Promise<ResumeStructure> {
  try {
    // Create the output parser
    const parser = StructuredOutputParser.fromZodSchema(resumeStructureSchema);
    const formatInstructions = parser.getFormatInstructions();

    // Create the model
    const model = new ChatOpenAI({
      modelName: process.env.PDF_EXTRACTION_MODEL || "gpt-3.5-turbo",
      temperature: 0,
    });

    // Create a prompt for resume extraction
    const prompt = PromptTemplate.fromTemplate(
      `You are a professional resume analyzer.
      Extract the following information from the resume below in a structured format.
      Return ONLY the JSON specified in the instructions below.
      
      {format_instructions}
      
      Resume:
      {resume_text}
      `
    );

    // Join all document content
    const resumeText = resumeContent.map((doc) => doc.pageContent).join("\n");

    // Format the prompt with the resume text and format instructions
    const formattedPrompt = await prompt.format({
      format_instructions: formatInstructions,
      resume_text: resumeText,
    });

    // Invoke the model
    const result = await model.invoke(formattedPrompt);

    // Parse the result - convert content to string
    const parsedResult = await parser.parse(
      typeof result.content === "string"
        ? result.content
        : JSON.stringify(result.content)
    );

    return parsedResult;
  } catch (error) {
    console.error("Error extracting resume information:", error);
    throw new Error("Failed to extract information from resume");
  }
}

/**
 * Analyzes a resume against a job description
 * @param resumeContent Document objects containing resume text
 * @param jobDescription Document objects containing job description
 * @returns Analysis results
 */
export async function analyzeResumeAgainstJob(
  resumeContent: Document[],
  jobDescription: Document[]
): Promise<any> {
  try {
    // Create the output schema for analysis
    const analysisSchema = z.object({
      atsScore: z.number().min(0).max(100),
      missingKeywords: z.array(z.string()),
      suggestedImprovements: z.array(
        z.object({
          category: z.string(),
          description: z.string(),
          suggestions: z.array(z.string()),
          severity: z.enum(["high", "medium", "low"]),
        })
      ),
      skillsGap: z.array(z.string()),
    });

    const parser = StructuredOutputParser.fromZodSchema(analysisSchema);
    const formatInstructions = parser.getFormatInstructions();

    // Create the model
    const model = new ChatOpenAI({
      modelName: process.env.MODEL_NAME || "gpt-4o-mini",
      temperature: 0.2,
    });

    // Create a prompt for analysis
    const prompt = PromptTemplate.fromTemplate(
      `You are an expert ATS (Applicant Tracking System) resume analyzer.
      Compare the resume with the job description below and provide a detailed analysis.
      Focus on relevance, keyword matching, and areas for improvement.
      Return ONLY the JSON specified in the instructions below.
      
      {format_instructions}
      
      Resume:
      {resume_text}
      
      Job Description:
      {job_description}
      `
    );

    // Join all document content
    const resumeText = resumeContent.map((doc) => doc.pageContent).join("\n");
    const jobDescriptionText = jobDescription
      .map((doc) => doc.pageContent)
      .join("\n");

    // Format the prompt with the texts and format instructions
    const formattedPrompt = await prompt.format({
      format_instructions: formatInstructions,
      resume_text: resumeText,
      job_description: jobDescriptionText,
    });

    // Invoke the model
    const result = await model.invoke(formattedPrompt);

    // Parse the result - convert content to string
    const parsedResult = await parser.parse(
      typeof result.content === "string"
        ? result.content
        : JSON.stringify(result.content)
    );

    return parsedResult;
  } catch (error) {
    console.error("Error analyzing resume against job:", error);
    throw new Error("Failed to analyze resume against job description");
  }
}

/**
 * Generates an improved version of the resume based on job description
 * @param resumeContent Document objects containing resume text
 * @param jobDescription Document objects containing job description
 * @param analysis Analysis results from analyzeResumeAgainstJob
 * @returns Improved resume text
 */
export async function generateImprovedResume(
  resumeContent: Document[],
  jobDescription: Document[],
  analysis: any
): Promise<string> {
  try {
    // Create the model
    const model = new ChatOpenAI({
      modelName: process.env.MODEL_NAME || "gpt-4o-mini",
      temperature: 0.3,
    });

    // Create a prompt for generating improved resume
    const prompt = PromptTemplate.fromTemplate(
      `You are an expert resume writer.
      Your task is to improve the resume below based on the job description and analysis provided.
      Focus on addressing the missing keywords, implementing suggested improvements, and filling skill gaps.
      Maintain the overall structure and format of the original resume, but enhance the content.
      
      Original Resume:
      {resume_text}
      
      Job Description:
      {job_description}
      
      Analysis:
      {analysis}
      
      Return the improved resume as a plain text document.
      `
    );

    // Join all document content
    const resumeText = resumeContent.map((doc) => doc.pageContent).join("\n");
    const jobDescriptionText = jobDescription
      .map((doc) => doc.pageContent)
      .join("\n");

    // Format the prompt with the texts
    const formattedPrompt = await prompt.format({
      resume_text: resumeText,
      job_description: jobDescriptionText,
      analysis: JSON.stringify(analysis, null, 2),
    });

    // Invoke the model
    const result = await model.invoke(formattedPrompt);

    return typeof result.content === "string"
      ? result.content
      : JSON.stringify(result.content);
  } catch (error) {
    console.error("Error generating improved resume:", error);
    throw new Error("Failed to generate improved resume");
  }
}
