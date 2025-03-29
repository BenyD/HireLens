// Server-side resume analyzer
import { Document } from "@langchain/core/documents";
import { PromptTemplate } from "@langchain/core/prompts";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";
import { HuggingFaceInference } from "@langchain/community/llms/hf";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";
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

    // Create the model - using HuggingFace instead of OpenAI
    const model = new HuggingFaceInference({
      model:
        process.env.HF_MODEL_NAME || "mistralai/Mixtral-8x7B-Instruct-v0.1",
      apiKey: process.env.HF_API_KEY || "",
      temperature: 0.1,
    });

    // Join all document content
    const resumeText = resumeContent.map((doc) => doc.pageContent).join("\n");

    // Direct prompt approach instead of RunnableSequence - simplified to avoid issues
    const prompt = await PromptTemplate.fromTemplate(
      `You are a professional resume analyzer.
      Extract the following information from the resume below in a structured format.
      Return ONLY the JSON specified in the instructions below.
      
      {format_instructions}
      
      Resume:
      {resume_text}
      `
    ).format({
      format_instructions: formatInstructions,
      resume_text: resumeText,
    });

    // Invoke the model directly
    const response = await model.invoke(prompt);

    // Parse the result with error handling
    try {
      const parsedResult = await parser.parse(response);
      return parsedResult;
    } catch (parseError) {
      console.error("Error parsing model response:", parseError);

      // Try to extract valid JSON from the response as a fallback
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const extractedJson = JSON.parse(jsonMatch[0]);
          return extractedJson as ResumeStructure;
        } catch (jsonError) {
          console.error("Failed to extract valid JSON from response");
        }
      }

      throw new Error(
        "Could not parse model response into the expected format"
      );
    }
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

    // Create the model using HuggingFace
    const model = new HuggingFaceInference({
      model:
        process.env.HF_MODEL_NAME || "mistralai/Mixtral-8x7B-Instruct-v0.1",
      apiKey: process.env.HF_API_KEY || "",
      temperature: 0.2,
    });

    // Join all document content
    const resumeText = resumeContent.map((doc) => doc.pageContent).join("\n");
    const jobDescriptionText = jobDescription
      .map((doc) => doc.pageContent)
      .join("\n");

    // Direct prompt approach instead of RunnableSequence
    const prompt = await PromptTemplate.fromTemplate(
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
    ).format({
      format_instructions: formatInstructions,
      resume_text: resumeText,
      job_description: jobDescriptionText,
    });

    // Invoke the model directly
    const response = await model.invoke(prompt);

    // Parse the result with error handling
    try {
      const parsedResult = await parser.parse(response);
      return parsedResult;
    } catch (parseError) {
      console.error("Error parsing model response:", parseError);

      // Try to extract valid JSON from the response as a fallback
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const extractedJson = JSON.parse(jsonMatch[0]);
          return extractedJson;
        } catch (jsonError) {
          console.error("Failed to extract valid JSON from response");
        }
      }

      throw new Error(
        "Could not parse model response into the expected format"
      );
    }
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
    // Create the model using HuggingFace
    const model = new HuggingFaceInference({
      model:
        process.env.HF_MODEL_NAME || "mistralai/Mixtral-8x7B-Instruct-v0.1",
      apiKey: process.env.HF_API_KEY || "",
      temperature: 0.3,
    });

    // Join all document content
    const resumeText = resumeContent.map((doc) => doc.pageContent).join("\n");
    const jobDescriptionText = jobDescription
      .map((doc) => doc.pageContent)
      .join("\n");

    // Direct prompt approach instead of RunnableSequence
    const prompt = await PromptTemplate.fromTemplate(
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
    ).format({
      resume_text: resumeText,
      job_description: jobDescriptionText,
      analysis: JSON.stringify(analysis, null, 2),
    });

    // Invoke the model directly
    const result = await model.invoke(prompt);
    return result;
  } catch (error) {
    console.error("Error generating improved resume:", error);
    throw new Error("Failed to generate improved resume");
  }
}
