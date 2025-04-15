import { NextResponse } from "next/server";
import axios from "axios";

const HUGGING_FACE_API_KEY = process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY;
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

const MODELS = {
  classification: "MoritzLaurer/DeBERTa-v3-large-mnli-fever-anli-ling-wanli",
  generation: "gpt2", // Using GPT-2 as a fallback model
};

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchHuggingFace(
  endpoint: string,
  payload: any,
  retryCount = 0
) {
  try {
    const response = await axios.post(
      `https://api-inference.huggingface.co/models/${endpoint}`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${HUGGING_FACE_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error(
      `Error calling ${endpoint}:`,
      error.response?.status,
      error.response?.data
    );

    // Check if model is loading (503 status)
    if (error.response?.status === 503 && retryCount < MAX_RETRIES) {
      console.log(
        `Model ${endpoint} is loading, retrying in ${RETRY_DELAY}ms... (attempt ${
          retryCount + 1
        }/${MAX_RETRIES})`
      );
      await sleep(RETRY_DELAY * (retryCount + 1)); // Exponential backoff
      return fetchHuggingFace(endpoint, payload, retryCount + 1);
    }

    return null;
  }
}

async function extractKeywords(text: string) {
  // Enhanced list of skills with categories
  const skillCategories = {
    programming: [
      "javascript",
      "typescript",
      "python",
      "java",
      "c++",
      "c#",
      "ruby",
      "php",
      "swift",
      "kotlin",
      "rust",
      "go",
      "scala",
      "perl",
      "r",
      "matlab",
      "sql",
      "nosql",
      "html",
      "css",
      "sass",
    ],
    frameworks: [
      "react",
      "angular",
      "vue",
      "svelte",
      "next.js",
      "nuxt",
      "django",
      "flask",
      "spring",
      "express",
      "fastapi",
      "laravel",
      "ruby on rails",
      "asp.net",
    ],
    databases: [
      "mongodb",
      "postgresql",
      "mysql",
      "oracle",
      "sqlite",
      "redis",
      "cassandra",
      "dynamodb",
      "elasticsearch",
      "neo4j",
      "firebase",
    ],
    cloud: [
      "aws",
      "azure",
      "gcp",
      "docker",
      "kubernetes",
      "terraform",
      "jenkins",
      "gitlab",
      "github actions",
      "circleci",
      "ansible",
      "prometheus",
      "grafana",
    ],
    ai_ml: [
      "machine learning",
      "deep learning",
      "tensorflow",
      "pytorch",
      "keras",
      "scikit-learn",
      "pandas",
      "numpy",
      "computer vision",
      "nlp",
      "data science",
      "big data",
      "hadoop",
      "spark",
    ],
    soft_skills: [
      "leadership",
      "management",
      "communication",
      "problem-solving",
      "teamwork",
      "agile",
      "scrum",
      "kanban",
      "project management",
      "critical thinking",
      "time management",
    ],
    tools: [
      "git",
      "jira",
      "confluence",
      "slack",
      "figma",
      "sketch",
      "adobe",
      "postman",
      "swagger",
      "webpack",
      "babel",
      "vite",
      "docker-compose",
      "nginx",
    ],
  };

  const words = text.toLowerCase().split(/\W+/);
  const allSkills = Object.values(skillCategories).flat();

  // Find exact matches and partial matches
  const foundSkills = new Set([
    ...words.filter((word) => allSkills.includes(word)),
    ...allSkills.filter(
      (skill) => text.toLowerCase().includes(skill) && skill.includes(" ")
    ),
  ]);

  return [...foundSkills].map((skill) => ({
    entity_group:
      Object.entries(skillCategories)
        .find(([_, skills]) => skills.includes(skill))?.[0]
        .toUpperCase() || "SKILL",
    score: 1,
    word: skill,
    start: text.toLowerCase().indexOf(skill),
    end: text.toLowerCase().indexOf(skill) + skill.length,
  }));
}

type Suggestion = {
  title: string;
  description: string;
  severity: "high" | "medium" | "low";
  category: "skills" | "experience" | "format" | "keywords" | "education";
  actionItems: string[];
};

interface Keyword {
  entity_group: string;
  score: number;
  word: string;
  start: number;
  end: number;
}

function calculateScore(analysis: any, keywords: Keyword[]): number {
  // Base score from model confidence (0.5 weight)
  const modelScore = analysis?.scores?.[0] || 0.5;

  // Keyword match score (0.3 weight)
  const requiredKeywords = keywords.length;
  const keywordScore =
    requiredKeywords > 0
      ? keywords.filter((k) => k.score > 0.7).length / requiredKeywords
      : 0;

  // Label score (0.2 weight)
  const labelScore =
    analysis?.labels?.[0] === "highly relevant to job"
      ? 1
      : analysis?.labels?.[0] === "somewhat relevant to job"
      ? 0.6
      : 0.2;

  // Weighted average
  const finalScore = modelScore * 0.5 + keywordScore * 0.3 + labelScore * 0.2;

  return finalScore;
}

export async function POST(request: Request) {
  try {
    const { resumeText, jobDescriptionText } = await request.json();

    console.log("Analyzing texts:", {
      resumeLength: resumeText.length,
      jobDescriptionLength: jobDescriptionText.length,
    });

    // Perform text classification with improved model
    const analysis = await fetchHuggingFace(MODELS.classification, {
      inputs: [resumeText, jobDescriptionText],
      parameters: {
        candidate_labels: [
          "highly relevant to job",
          "somewhat relevant to job",
          "not relevant to job",
        ],
      },
    });

    // Extract keywords using our enhanced function
    const keywords = await extractKeywords(jobDescriptionText);

    // Calculate the final score
    const score = calculateScore(analysis, keywords);

    // Define categories for suggestions
    const categories = [
      "skills",
      "experience",
      "format",
      "keywords",
      "education",
    ] as const;

    // Generate detailed suggestions using GPT model
    const promptTemplate = `Analyze this resume against the job description and provide specific, actionable suggestions for improvement.
Focus on these key areas:
1. Skills Match: Technical and soft skills alignment
2. Experience Relevance: How well past experience matches requirements
3. Resume Format: Structure, clarity, and presentation
4. Keywords: Important terms from job description
5. Education & Certifications: Required qualifications

For each suggestion:
- Identify the specific issue
- Explain why it matters
- Provide concrete steps for improvement

Resume:
${resumeText.substring(0, 500)}...

Job Description:
${jobDescriptionText.substring(0, 500)}...

Provide detailed analysis and suggestions:`;

    const suggestions = await fetchHuggingFace(MODELS.generation, {
      inputs: promptTemplate,
      parameters: {
        max_length: 500,
        temperature: 0.7,
        top_p: 0.9,
        do_sample: true,
        return_full_text: false,
      },
    });

    // Process and structure the suggestions
    const formattedSuggestions: Suggestion[] = [
      {
        title: "Skills Gap Analysis",
        description:
          "Key technical or soft skills missing from your resume that are required in the job description.",
        severity: "high",
        category: "skills",
        actionItems: [
          "Add missing technical skills: " +
            keywords
              .filter(
                (k: Keyword) =>
                  k.entity_group === "PROGRAMMING" ||
                  k.entity_group === "FRAMEWORKS"
              )
              .map((k: Keyword) => k.word)
              .join(", "),
          "Highlight relevant soft skills mentioned in the job description",
          "Quantify your skill proficiency levels where possible",
        ],
      },
      {
        title: "Experience Alignment",
        description:
          "Ways to better align your experience with job requirements",
        severity: "high",
        category: "experience",
        actionItems: [
          "Focus on achievements rather than just responsibilities",
          "Use metrics and numbers to quantify your impact",
          "Match your experience descriptions to job requirements",
        ],
      },
      {
        title: "Keyword Optimization",
        description: "Important keywords from the job description to include",
        severity: "medium",
        category: "keywords",
        actionItems: [
          "Include these key terms: " +
            keywords.map((k: Keyword) => k.word).join(", "),
          "Naturally incorporate keywords into experience descriptions",
          "Ensure technical terms are properly capitalized",
        ],
      },
      {
        title: "Resume Format Enhancement",
        description:
          "Improvements to make your resume more readable and ATS-friendly",
        severity: "medium",
        category: "format",
        actionItems: [
          "Use clear section headings",
          "Ensure consistent formatting throughout",
          "Keep bullet points concise and impactful",
        ],
      },
      {
        title: "Education & Certifications",
        description:
          "Educational requirements and professional certifications alignment",
        severity: "low",
        category: "education",
        actionItems: [
          "Highlight relevant coursework",
          "Add any missing certifications",
          "Include ongoing education or training",
        ],
      },
    ];

    const result = {
      score,
      suggestions: formattedSuggestions,
      keywords: Array.isArray(keywords) ? keywords : [],
    };

    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Analysis error:", error);
    return new Response(JSON.stringify({ error: "Failed to analyze resume" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
