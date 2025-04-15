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

interface ScoreFactors {
  modelConfidence: number;
  keywordMatches: number;
  labelRelevance: number;
  experienceAlignment: number;
  skillDiversity: number;
  formatQuality: number;
  educationMatch: number;
  industryAlign: number;
}

interface ScoreBreakdown {
  currentScore: number;
  potentialScore: number;
  improvements: {
    category: string;
    current: number;
    potential: number;
    suggestedImprovements: string[];
  }[];
}

function calculateDetailedScore(
  analysis: any,
  keywords: Keyword[],
  resumeText: string,
  jobDescriptionText: string
): ScoreBreakdown {
  // Calculate current scores for each factor
  const currentScores = {
    modelConfidence: analysis?.scores?.[0] || 0.5,
    keywordMatch: calculateKeywordScore(keywords),
    labelRelevance: calculateLabelScore(analysis?.labels?.[0]),
    experienceAlign: calculateExperienceAlignment(
      resumeText,
      jobDescriptionText
    ),
    skillDiversity: calculateSkillDiversity(keywords),
    formatQuality: evaluateFormatQuality(resumeText),
    educationMatch: evaluateEducationMatch(resumeText, jobDescriptionText),
    industryAlign: calculateIndustryAlignment(resumeText, jobDescriptionText),
  };

  // Calculate potential improvements for each factor
  const improvements = [];
  let currentTotal = 0;
  let potentialTotal = 0;

  // Weights for each factor
  const weights = {
    modelConfidence: 0.15,
    keywordMatch: 0.2,
    labelRelevance: 0.1,
    experienceAlign: 0.15,
    skillDiversity: 0.1,
    formatQuality: 0.1,
    educationMatch: 0.1,
    industryAlign: 0.1,
  };

  // Calculate scores and potential improvements for each factor
  for (const [factor, currentScore] of Object.entries(currentScores)) {
    const weight = weights[factor as keyof typeof weights];
    const weightedCurrent = currentScore * weight;
    currentTotal += weightedCurrent;

    // Calculate potential improvement for each factor
    const potentialScore = calculatePotentialScore(factor, currentScore);
    const weightedPotential = potentialScore * weight;
    potentialTotal += weightedPotential;

    improvements.push({
      category: factor,
      current: weightedCurrent,
      potential: weightedPotential,
      suggestedImprovements: generateImprovementSuggestions(
        factor,
        currentScore,
        potentialScore
      ),
    });
  }

  return {
    currentScore: currentTotal,
    potentialScore: potentialTotal,
    improvements,
  };
}

function calculatePotentialScore(factor: string, currentScore: number): number {
  // Define maximum achievable improvement for each factor
  const maxImprovements = {
    modelConfidence: 0.2, // Can improve by up to 20%
    keywordMatch: 0.3, // Can improve by up to 30%
    labelRelevance: 0.15, // Can improve by up to 15%
    experienceAlign: 0.25, // Can improve by up to 25%
    skillDiversity: 0.2, // Can improve by up to 20%
    formatQuality: 0.35, // Can improve by up to 35%
    educationMatch: 0.2, // Can improve by up to 20%
    industryAlign: 0.15, // Can improve by up to 15%
  };

  const maxImprovement =
    maxImprovements[factor as keyof typeof maxImprovements] || 0.2;
  return Math.min(1, currentScore + maxImprovement);
}

function evaluateEducationMatch(
  resumeText: string,
  jobDescriptionText: string
): number {
  const educationKeywords = [
    "bachelor's",
    "master's",
    "phd",
    "doctorate",
    "degree",
    "certification",
    "certified",
    "license",
    "diploma",
  ];

  const requiredEducation = educationKeywords.filter((keyword) =>
    jobDescriptionText.toLowerCase().includes(keyword)
  );

  const matchedEducation = requiredEducation.filter((keyword) =>
    resumeText.toLowerCase().includes(keyword)
  );

  return requiredEducation.length > 0
    ? matchedEducation.length / requiredEducation.length
    : 1;
}

function calculateIndustryAlignment(
  resumeText: string,
  jobDescriptionText: string
): number {
  // Extract industry-specific terms from job description
  const industryTerms = extractIndustryTerms(jobDescriptionText);

  // Count how many industry terms appear in the resume
  const matchedTerms = industryTerms.filter((term) =>
    resumeText.toLowerCase().includes(term.toLowerCase())
  );

  return industryTerms.length > 0
    ? matchedTerms.length / industryTerms.length
    : 0.5;
}

function extractIndustryTerms(text: string): string[] {
  // Common industry sectors and related terms
  const industryKeywords = {
    technology: [
      "software",
      "IT",
      "tech",
      "digital",
      "cyber",
      "web",
      "cloud",
      "data",
    ],
    finance: [
      "banking",
      "investment",
      "financial",
      "trading",
      "accounting",
      "fintech",
    ],
    healthcare: [
      "medical",
      "healthcare",
      "clinical",
      "patient",
      "health",
      "pharmaceutical",
    ],
    marketing: [
      "marketing",
      "advertising",
      "brand",
      "digital marketing",
      "social media",
    ],
    manufacturing: [
      "manufacturing",
      "production",
      "assembly",
      "quality control",
      "operations",
    ],
    // Add more industries as needed
  };

  const foundTerms = new Set<string>();

  Object.values(industryKeywords).forEach((terms) => {
    terms.forEach((term) => {
      if (text.toLowerCase().includes(term.toLowerCase())) {
        foundTerms.add(term);
      }
    });
  });

  return Array.from(foundTerms);
}

function generateImprovementSuggestions(
  factor: string,
  currentScore: number,
  potentialScore: number
): string[] {
  const gap = potentialScore - currentScore;
  if (gap < 0.1) return []; // No significant improvement needed

  const suggestions: { [key: string]: string[] } = {
    modelConfidence: [
      "Align your resume more closely with the job requirements",
      "Use more industry-specific terminology",
      "Highlight relevant achievements more prominently",
    ],
    keywordMatch: [
      "Add missing keywords from the job description",
      "Use variations of key terms",
      "Include industry-standard abbreviations",
    ],
    formatQuality: [
      "Improve section organization",
      "Add more quantifiable achievements",
      "Use consistent formatting throughout",
    ],
    // Add more suggestions for other factors
  };

  return (
    suggestions[factor] || ["Review and enhance this aspect of your resume"]
  );
}

function calculateExperienceAlignment(
  resumeText: string,
  jobDescriptionText: string
): number {
  // Extract years of experience from both texts
  const resumeExperience = extractExperienceYears(resumeText);
  const jobExperience = extractExperienceYears(jobDescriptionText);

  // Calculate alignment score based on experience match
  if (resumeExperience >= jobExperience) return 1.0;
  if (resumeExperience >= jobExperience * 0.8) return 0.8;
  if (resumeExperience >= jobExperience * 0.6) return 0.6;
  return 0.4;
}

function calculateSkillDiversity(keywords: Keyword[]): number {
  // Group keywords by category
  const categories = new Set(keywords.map((k) => k.entity_group));
  const uniqueSkills = new Set(keywords.map((k) => k.word));

  // Calculate diversity score based on:
  // 1. Number of different skill categories (40% weight)
  // 2. Number of unique skills (60% weight)
  const categoryScore = Math.min(categories.size / 7, 1); // 7 is the number of skill categories
  const uniqueSkillsScore = Math.min(uniqueSkills.size / 20, 1); // Normalize to max 20 skills

  return categoryScore * 0.4 + uniqueSkillsScore * 0.6;
}

function evaluateFormatQuality(resumeText: string): number {
  // Check for common formatting issues
  const hasSections = /(experience|education|skills|summary)/i.test(resumeText);
  const hasBulletPoints = /\n\s*[•\-*]\s/.test(resumeText);
  const hasQuantifiableAchievements = /\d+%|\$\d+|\d+\s*(years|months)/i.test(
    resumeText
  );
  const hasActionVerbs =
    /(managed|led|developed|implemented|achieved|increased|decreased)/i.test(
      resumeText
    );

  // Calculate format score based on presence of key elements
  let score = 0;
  if (hasSections) score += 0.3;
  if (hasBulletPoints) score += 0.2;
  if (hasQuantifiableAchievements) score += 0.3;
  if (hasActionVerbs) score += 0.2;

  return score;
}

function extractExperienceYears(text: string): number {
  // Extract years of experience using regex patterns
  const patterns = [
    /(\d+)\s*(?:years?|yrs?)\s*(?:of\s*)?experience/i,
    /(\d+)\s*(?:years?|yrs?)\s*(?:in\s*)?(?:the\s*)?(?:field|industry)/i,
    /(\d+)\s*(?:years?|yrs?)\s*(?:working|professional)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return parseInt(match[1], 10);
    }
  }

  // If no explicit years found, estimate based on content length and keywords
  const hasSeniorKeywords = /(senior|lead|principal|manager|director)/i.test(
    text
  );
  const hasJuniorKeywords = /(junior|entry|associate|assistant)/i.test(text);

  if (hasSeniorKeywords) return 5;
  if (hasJuniorKeywords) return 1;
  return 3; // Default to mid-level experience
}

function calculateKeywordScore(keywords: Keyword[]): number {
  const requiredKeywords = keywords.length;
  const keywordMatches = keywords.filter((k) => k.score > 0.7).length;
  return requiredKeywords > 0 ? keywordMatches / requiredKeywords : 0;
}

function calculateLabelScore(label: string | undefined): number {
  return label === "highly relevant to job"
    ? 1
    : label === "somewhat relevant to job"
    ? 0.6
    : 0.2;
}

interface SkillAnalysis {
  category: string;
  matched: EnhancedSkill[];
  missing: EnhancedSkill[];
  importance: "critical" | "recommended" | "nice-to-have";
}

interface EnhancedSkill {
  word: string;
  score: number;
  proficiencyLevel: "expert" | "advanced" | "intermediate" | "beginner";
  description: string;
  yearsOfExperience?: number;
  lastUsed?: string;
  category: string;
  subcategory?: string;
  importance: "critical" | "recommended" | "nice-to-have";
}

const SKILL_CATEGORIES = {
  programming: {
    languages: [
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
      "dart",
      "lua",
      "shell",
    ],
    web: [
      "html",
      "css",
      "sass",
      "less",
      "webgl",
      "svg",
      "canvas",
      "web components",
    ],
    mobile: [
      "react native",
      "flutter",
      "ionic",
      "xamarin",
      "android",
      "ios",
      "swift ui",
      "jetpack compose",
    ],
  },
  frameworks: {
    frontend: [
      "react",
      "angular",
      "vue",
      "svelte",
      "next.js",
      "nuxt",
      "gatsby",
      "remix",
      "tailwind",
      "bootstrap",
      "material-ui",
      "chakra-ui",
    ],
    backend: [
      "django",
      "flask",
      "fastapi",
      "express",
      "spring",
      "laravel",
      "ruby on rails",
      "asp.net",
      "nest.js",
      "strapi",
      "graphql",
    ],
    testing: [
      "jest",
      "cypress",
      "selenium",
      "playwright",
      "mocha",
      "junit",
      "pytest",
    ],
  },
  databases: {
    relational: [
      "postgresql",
      "mysql",
      "oracle",
      "sqlite",
      "sql server",
      "mariadb",
    ],
    nosql: [
      "mongodb",
      "cassandra",
      "redis",
      "dynamodb",
      "firebase",
      "neo4j",
      "elasticsearch",
    ],
    tools: ["prisma", "sequelize", "typeorm", "mongoose", "knex"],
  },
  cloud: {
    platforms: [
      "aws",
      "azure",
      "gcp",
      "digitalocean",
      "heroku",
      "vercel",
      "netlify",
    ],
    containerization: [
      "docker",
      "kubernetes",
      "openshift",
      "rancher",
      "podman",
    ],
    infrastructure: [
      "terraform",
      "ansible",
      "jenkins",
      "gitlab ci",
      "github actions",
      "circleci",
      "prometheus",
      "grafana",
    ],
  },
  ai_ml: {
    frameworks: [
      "tensorflow",
      "pytorch",
      "keras",
      "scikit-learn",
      "hugging face",
      "opencv",
    ],
    specialties: [
      "machine learning",
      "deep learning",
      "nlp",
      "computer vision",
      "reinforcement learning",
      "data science",
      "neural networks",
    ],
    tools: ["pandas", "numpy", "matplotlib", "jupyter", "rapids", "dask"],
  },
  soft_skills: {
    leadership: [
      "team leadership",
      "project management",
      "mentoring",
      "strategic planning",
      "decision making",
      "conflict resolution",
    ],
    communication: [
      "verbal communication",
      "written communication",
      "presentation skills",
      "stakeholder management",
      "technical writing",
    ],
    methodologies: ["agile", "scrum", "kanban", "lean", "waterfall", "devops"],
  },
  security: {
    concepts: [
      "cryptography",
      "authentication",
      "authorization",
      "oauth",
      "jwt",
      "penetration testing",
      "security auditing",
    ],
    tools: [
      "burp suite",
      "wireshark",
      "metasploit",
      "nmap",
      "snyk",
      "owasp zap",
    ],
    compliance: ["gdpr", "hipaa", "pci dss", "sox", "iso 27001"],
  },
  design: {
    tools: [
      "figma",
      "sketch",
      "adobe xd",
      "photoshop",
      "illustrator",
      "indesign",
    ],
    concepts: [
      "ui design",
      "ux design",
      "responsive design",
      "accessibility",
      "design systems",
    ],
    prototyping: ["invision", "principle", "framer", "proto.io"],
  },
};

function determineSkillProficiency(
  skill: string,
  resumeText: string,
  jobDescriptionText: string
): EnhancedSkill["proficiencyLevel"] {
  // Look for explicit proficiency indicators
  const expertPatterns = [
    new RegExp(`expert\\s+(?:in\\s+)?${skill}`, "i"),
    new RegExp(`${skill}\\s+expert`, "i"),
    new RegExp(`advanced\\s+${skill}`, "i"),
    new RegExp(`(?:10|[5-9])\\+?\\s+years.*${skill}`, "i"),
  ];

  const advancedPatterns = [
    new RegExp(`proficient\\s+(?:in\\s+)?${skill}`, "i"),
    new RegExp(`${skill}\\s+proficiency`, "i"),
    new RegExp(`(?:[3-4])\\+?\\s+years.*${skill}`, "i"),
  ];

  const intermediatePatterns = [
    new RegExp(`intermediate\\s+(?:in\\s+)?${skill}`, "i"),
    new RegExp(`${skill}\\s+intermediate`, "i"),
    new RegExp(`(?:[1-2])\\+?\\s+years.*${skill}`, "i"),
  ];

  if (expertPatterns.some((pattern) => pattern.test(resumeText))) {
    return "expert";
  } else if (advancedPatterns.some((pattern) => pattern.test(resumeText))) {
    return "advanced";
  } else if (intermediatePatterns.some((pattern) => pattern.test(resumeText))) {
    return "intermediate";
  }
  return "beginner";
}

function extractSkillYearsOfExperience(
  skill: string,
  text: string
): number | undefined {
  const patterns = [
    new RegExp(`(\\d+)\\+?\\s+years?.*${skill}`, "i"),
    new RegExp(`${skill}.*\\s+(\\d+)\\+?\\s+years?`, "i"),
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return parseInt(match[1], 10);
    }
  }
  return undefined;
}

function findSkillCategory(skill: string): {
  category: string;
  subcategory?: string;
} {
  for (const [category, subcategories] of Object.entries(SKILL_CATEGORIES)) {
    for (const [subcategory, skills] of Object.entries(subcategories)) {
      if (skills.includes(skill.toLowerCase())) {
        return { category, subcategory };
      }
    }
  }
  return { category: "other" };
}

function generateSkillDescription(
  skill: string,
  proficiency: EnhancedSkill["proficiencyLevel"],
  yearsOfExperience?: number
): string {
  const proficiencyDescriptions = {
    expert: "Demonstrates mastery and can lead/teach others.",
    advanced: "Strong understanding and extensive experience.",
    intermediate: "Good working knowledge and some experience.",
    beginner: "Basic understanding and limited experience.",
  };

  let description = `${proficiencyDescriptions[proficiency]} `;
  if (yearsOfExperience) {
    description += `${yearsOfExperience}+ years of experience. `;
  }

  return description.trim();
}

async function analyzeSkillGaps(
  resumeText: string,
  jobDescriptionText: string
): Promise<SkillAnalysis[]> {
  // Extract all skills from job description
  const jobSkills = await extractKeywords(jobDescriptionText);
  const resumeSkills = await extractKeywords(resumeText);

  // Enhanced skill analysis
  const enhancedSkills: EnhancedSkill[] = jobSkills.map((skill) => {
    const proficiency = determineSkillProficiency(
      skill.word,
      resumeText,
      jobDescriptionText
    );
    const yearsOfExperience = extractSkillYearsOfExperience(
      skill.word,
      resumeText
    );
    const { category, subcategory } = findSkillCategory(skill.word);
    const importance = determineSkillImportance(
      category,
      0,
      jobDescriptionText
    );

    return {
      ...skill,
      proficiencyLevel: proficiency,
      yearsOfExperience,
      description: generateSkillDescription(
        skill.word,
        proficiency,
        yearsOfExperience
      ),
      category,
      subcategory,
      importance,
    };
  });

  // Group by main categories
  const categories = Array.from(
    new Set(enhancedSkills.map((skill) => skill.category))
  );

  return categories.map((category) => {
    const categorySkills = enhancedSkills.filter(
      (skill) => skill.category === category
    );
    const resumeCategorySkills = resumeSkills.filter(
      (skill) => findSkillCategory(skill.word).category === category
    );

    const matched = categorySkills.filter((jobSkill) =>
      resumeCategorySkills.some(
        (resumeSkill) =>
          resumeSkill.word.toLowerCase() === jobSkill.word.toLowerCase()
      )
    );

    const missing = categorySkills.filter(
      (jobSkill) =>
        !resumeCategorySkills.some(
          (resumeSkill) =>
            resumeSkill.word.toLowerCase() === jobSkill.word.toLowerCase()
        )
    );

    return {
      category,
      matched,
      missing,
      importance: determineSkillImportance(
        category,
        missing.length,
        jobDescriptionText
      ),
    };
  });
}

function determineSkillImportance(
  category: string,
  missingCount: number,
  jobDescription: string
): "critical" | "recommended" | "nice-to-have" {
  // Keywords that indicate requirement level
  const requirementIndicators = {
    critical: ["required", "must have", "essential", "necessary"],
    recommended: ["preferred", "desired", "should have"],
    niceToHave: ["nice to have", "plus", "beneficial"],
  };

  // Check if category is mentioned with requirement indicators
  for (const [level, indicators] of Object.entries(requirementIndicators)) {
    for (const indicator of indicators) {
      const pattern = new RegExp(
        `${indicator}.*?${category}|${category}.*?${indicator}`,
        "i"
      );
      if (pattern.test(jobDescription)) {
        return level === "critical"
          ? "critical"
          : level === "recommended"
          ? "recommended"
          : "nice-to-have";
      }
    }
  }

  // Default importance based on missing skills count
  if (missingCount > 3) return "critical";
  if (missingCount > 1) return "recommended";
  return "nice-to-have";
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

    // Calculate the detailed score breakdown
    const scoreBreakdown = calculateDetailedScore(
      analysis,
      keywords,
      resumeText,
      jobDescriptionText
    );

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

    // Perform skill gap analysis
    const skillGapAnalysis = await analyzeSkillGaps(
      resumeText,
      jobDescriptionText
    );

    // Generate skill-specific suggestions
    const skillSuggestions = skillGapAnalysis
      .filter((analysis) => analysis.missing.length > 0)
      .map((analysis) => ({
        title: `${analysis.category.toLowerCase()} Skills Gap`,
        description: `Missing ${
          analysis.missing.length
        } ${analysis.category.toLowerCase()} skills required for this position.`,
        severity:
          analysis.importance === "critical"
            ? "high"
            : analysis.importance === "recommended"
            ? "medium"
            : "low",
        category: "skills",
        actionItems: [
          `Add these missing ${analysis.category.toLowerCase()} skills: ${analysis.missing
            .map((skill) => skill.word)
            .join(", ")}`,
          `Highlight any relevant experience with these technologies`,
          `Consider obtaining certifications in: ${analysis.missing
            .slice(0, 3)
            .map((skill) => skill.word)
            .join(", ")}`,
        ],
      }));

    // Merge skill suggestions with other suggestions
    const allSuggestions = [
      ...skillSuggestions,
      ...formattedSuggestions.filter((s) => s.category !== "skills"),
    ];

    const result = {
      score: scoreBreakdown.currentScore,
      potentialScore: scoreBreakdown.potentialScore,
      improvements: scoreBreakdown.improvements,
      suggestions: allSuggestions,
      keywords: Array.isArray(keywords) ? keywords : [],
      skillGaps: skillGapAnalysis, // Include detailed skill gap analysis in response
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
