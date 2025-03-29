import { Document } from "@langchain/core/documents";
import { ResumeStructure } from "./server-resume-analyzer";

/**
 * Simple local resume parser to extract information without relying on external APIs
 * Used as a fallback when API calls fail
 *
 * @param resumeContent Document objects containing resume text
 * @returns Basic structured resume data
 */
export function extractBasicResumeInfo(
  resumeContent: Document[]
): ResumeStructure {
  // Join all document content
  const text = resumeContent.map((doc) => doc.pageContent).join("\n");

  // Initialize structure
  const structure: ResumeStructure = {
    contactInfo: {},
    skills: [],
    experience: [],
    education: [],
  };

  // Extract basic contact info (simple regex patterns)
  const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/);
  if (emailMatch) {
    structure.contactInfo.email = emailMatch[0];
  }

  const phoneMatch = text.match(
    /(\+\d{1,3}[\s.-])?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/
  );
  if (phoneMatch) {
    structure.contactInfo.phone = phoneMatch[0];
  }

  // Extract potential name (very naive - first line or prominent text)
  const lines = text.split("\n").filter((line) => line.trim().length > 0);
  if (lines.length > 0 && lines[0].length < 50) {
    structure.contactInfo.name = lines[0].trim();
  }

  // Extract skills (keywords that appear in lists or after "skills" sections)
  const skillsMatch = text.match(
    /skills[:\s]+([\s\S]*?)(?:\n\n|\n\w+:|\n\w+\s+:|\n?\Z)/i
  );
  if (skillsMatch && skillsMatch[1]) {
    const skillsText = skillsMatch[1];
    // Extract skills as comma, bullet or line separated
    const skillsList = skillsText
      .split(/[,•\n]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && s.length < 30);

    structure.skills = skillsList;
  }

  // Look for experience sections
  const experienceMatch = text.match(
    /experience[:\s]+([\s\S]*?)(?:education|skills|references|\n\n\w+:|\n?\Z)/i
  );
  if (experienceMatch && experienceMatch[1]) {
    const expText = experienceMatch[1];

    // Split into potential job entries (naive approach)
    const expEntries = expText.split(/\n\n+/);

    structure.experience = expEntries.slice(0, 5).map((entry) => {
      // Try to extract company name and position
      const firstLine = entry.split("\n")[0];
      let company = "";
      let position = "";

      if (
        firstLine.includes("-") ||
        firstLine.includes("|") ||
        firstLine.includes(",")
      ) {
        const parts = firstLine.split(/[-|,]/);
        if (parts.length >= 2) {
          company = parts[0].trim();
          position = parts[1].trim();
        }
      } else {
        position = firstLine.trim();
      }

      return {
        company: company || "Unknown Company",
        position: position || "Unknown Position",
        description: entry
          .split("\n")
          .slice(1)
          .map((s) => s.trim())
          .filter(Boolean),
      };
    });
  }

  // Look for education sections
  const educationMatch = text.match(
    /education[:\s]+([\s\S]*?)(?:experience|skills|references|\n\n\w+:|\n?\Z)/i
  );
  if (educationMatch && educationMatch[1]) {
    const eduText = educationMatch[1];

    // Split into potential education entries
    const eduEntries = eduText.split(/\n\n+/);

    structure.education = eduEntries.slice(0, 3).map((entry) => {
      const lines = entry.split("\n");

      // Try to extract institution and degree
      let institution = "";
      let degree = "";

      if (lines.length > 0) {
        institution = lines[0].trim();
      }

      if (lines.length > 1) {
        // Look for common degree terms
        const degreeLine = lines.find((line) =>
          /bachelor|master|phd|degree|diploma|certificate/i.test(line)
        );

        if (degreeLine) {
          degree = degreeLine.trim();
        } else if (lines.length > 1) {
          degree = lines[1].trim();
        }
      }

      return {
        institution: institution || "Unknown Institution",
        degree: degree || "Unknown Degree",
      };
    });
  }

  // Extract a basic summary if available
  const summaryMatch = text.match(
    /summary[:\s]+([\s\S]*?)(?:\n\n|\n\w+:|\n?\Z)/i
  );
  if (summaryMatch && summaryMatch[1]) {
    structure.summary = summaryMatch[1].trim();
  }

  return structure;
}

/**
 * Simple analysis of resume against job description
 * Used as a fallback when API calls fail
 *
 * @param resumeContent Resume content
 * @param jobDescription Job description content
 * @returns Basic analysis
 */
export function analyzeBasicResumeMatch(
  resumeContent: Document[],
  jobDescription: Document[]
): any {
  // Join all document content
  const resumeText = resumeContent
    .map((doc) => doc.pageContent)
    .join("\n")
    .toLowerCase();
  const jobText = jobDescription
    .map((doc) => doc.pageContent)
    .join("\n")
    .toLowerCase();

  // Extract keywords from job description (very naive approach)
  const jobWords = jobText
    .split(/\W+/)
    .filter(
      (word) =>
        word.length > 3 &&
        ![
          "with",
          "that",
          "this",
          "have",
          "from",
          "your",
          "will",
          "about",
          "they",
          "when",
        ].includes(word)
    );

  // Count unique words
  const wordCounts = new Map<string, number>();
  for (const word of jobWords) {
    wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
  }

  // Sort by frequency
  const sortedWords = Array.from(wordCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .map((entry) => entry[0]);

  // Get top keywords
  const topKeywords = sortedWords.slice(0, 20);

  // Check which keywords are missing from resume
  const missingKeywords = topKeywords.filter(
    (keyword) => !resumeText.includes(keyword)
  );

  // Calculate a simple match score
  const matchedKeywords = topKeywords.length - missingKeywords.length;
  const matchScore = Math.round((matchedKeywords / topKeywords.length) * 100);

  // Generate simple improvement suggestions
  const suggestions = [
    {
      category: "Keyword Optimization",
      description: "Add missing keywords to improve ATS compatibility",
      suggestions: missingKeywords.map(
        (keyword) => `Include the keyword "${keyword}" in your resume`
      ),
      severity:
        missingKeywords.length > 5
          ? "high"
          : missingKeywords.length > 2
          ? "medium"
          : "low",
    },
    {
      category: "Content Enhancement",
      description: "Improve your resume content based on job requirements",
      suggestions: [
        "Quantify your achievements with specific numbers when possible",
        "Match your skills section to the requirements in the job description",
        "Use action verbs at the beginning of bullet points",
      ],
      severity: "medium",
    },
  ];

  return {
    atsScore: matchScore,
    missingKeywords,
    suggestedImprovements: suggestions,
    skillsGap: missingKeywords.slice(0, 5),
  };
}

/**
 * Generate a simple improved resume version
 * Used as a fallback when API calls fail
 *
 * @param resumeContent Resume content
 * @param jobDescription Job description content
 * @param analysis Analysis results
 * @returns Simple improved resume text
 */
export function generateBasicImprovedResume(
  resumeContent: Document[],
  jobDescription: Document[],
  analysis: any
): string {
  // Get original resume text
  const originalResume = resumeContent.map((doc) => doc.pageContent).join("\n");

  // Extract missing keywords from analysis
  const missingKeywords = analysis.missingKeywords || [];

  // Create a very basic improvement by adding a skills section with missing keywords
  const improvedResume = `${originalResume}

ADDITIONAL SKILLS RELEVANT TO THIS POSITION:
${missingKeywords.join(", ")}

Note: This is a basic automated improvement. For better results, manually incorporate 
these keywords naturally throughout your resume where relevant.`;

  return improvedResume;
}
