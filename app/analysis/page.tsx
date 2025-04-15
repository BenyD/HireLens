"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Download,
  RefreshCw,
  FileText,
  Upload,
  X,
  Loader2,
  Sparkles,
  Key,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Textarea } from "@/components/ui/textarea";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { motion } from "framer-motion";
import {
  extractTextFromFile,
  analyzeResume,
  storeResume,
  storeJobDescription,
  storeAnalysis,
} from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

type UploadStep = "resume" | "job-description" | "analysis";

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

type AnalysisResult = {
  score: number;
  suggestions: Suggestion[];
  keywords: Keyword[];
};

function generateSessionId(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export default function AnalysisPage() {
  const [currentStep, setCurrentStep] = useState<UploadStep>("resume");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jobDescriptionFile, setJobDescriptionFile] = useState<File | null>(
    null
  );
  const [jobDescriptionText, setJobDescriptionText] = useState("");
  const [activeTab, setActiveTab] = useState("paste");
  const [isLoading, setIsLoading] = useState(false);
  const [atsScore, setAtsScore] = useState(0);
  const [improvedScore, setImprovedScore] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    null
  );
  const [sessionId, setSessionId] = useState<string | null>(null);
  const router = useRouter();

  const handleResumeFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (
      selectedFile &&
      (selectedFile.type === "application/pdf" ||
        selectedFile.type ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document")
    ) {
      setResumeFile(selectedFile);
    }
  };

  const handleJobDescriptionFileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFile = e.target.files?.[0];
    if (
      selectedFile &&
      (selectedFile.type === "application/pdf" ||
        selectedFile.type ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document")
    ) {
      setJobDescriptionFile(selectedFile);
    }
  };

  const handleResumeUpload = async () => {
    if (resumeFile) {
      try {
        setIsLoading(true);
        const resumeText = await extractTextFromFile(resumeFile);
        // Generate a UUID for this session
        const newSessionId = generateSessionId();
        setSessionId(newSessionId);
        await storeResume(newSessionId, resumeText);
        setCurrentStep("job-description");
        toast.success("Resume uploaded successfully");
      } catch (error) {
        toast.error("Failed to process resume");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    let atsScoreInterval: NodeJS.Timeout;
    let improvedScoreInterval: NodeJS.Timeout;

    if (analysisResult) {
      const baseScore = Math.floor(analysisResult.score * 100);
      // Calculate improved score based on implementing all suggestions
      const potentialImprovement = analysisResult.suggestions.length * 5; // Each suggestion could improve score by 5%
      const improvedScoreTarget = Math.min(
        100,
        baseScore + potentialImprovement
      );

      atsScoreInterval = setInterval(() => {
        setAtsScore((prev) => {
          const next = prev + 1;
          if (next >= baseScore) {
            clearInterval(atsScoreInterval);
            return baseScore;
          }
          return next;
        });
      }, 30);

      improvedScoreInterval = setInterval(() => {
        setImprovedScore((prev) => {
          const next = prev + 1;
          if (next >= improvedScoreTarget) {
            clearInterval(improvedScoreInterval);
            return improvedScoreTarget;
          }
          return next;
        });
      }, 30);
    }

    return () => {
      if (atsScoreInterval) clearInterval(atsScoreInterval);
      if (improvedScoreInterval) clearInterval(improvedScoreInterval);
    };
  }, [analysisResult]);

  const handleJobDescriptionSubmit = async () => {
    try {
      setIsLoading(true);
      let jobDescriptionContent = "";

      if (activeTab === "paste") {
        jobDescriptionContent = jobDescriptionText;
      } else if (jobDescriptionFile) {
        jobDescriptionContent = await extractTextFromFile(jobDescriptionFile);
      }

      if (!jobDescriptionContent) {
        toast.error("Please provide a job description");
        return;
      }

      if (!sessionId) {
        toast.error("Session expired. Please upload your resume again.");
        setCurrentStep("resume");
        return;
      }

      const jobDescription = await storeJobDescription(
        sessionId,
        jobDescriptionContent
      );
      const { data: resume, error: resumeError } = await supabase
        .from("resumes")
        .select()
        .eq("session_id", sessionId)
        .single();

      if (resumeError) throw resumeError;

      const analysis = await analyzeResume(
        resume.content,
        jobDescriptionContent
      );
      await storeAnalysis(sessionId, resume.id, jobDescription.id, analysis);

      setAnalysisResult(analysis);
      setCurrentStep("analysis");
    } catch (error) {
      console.error("Analysis error:", error);
      toast.error("Failed to analyze resume. Please try again later.");
      setCurrentStep("job-description");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartNewAnalysis = () => {
    setCurrentStep("resume");
    setResumeFile(null);
    setJobDescriptionFile(null);
    setJobDescriptionText("");
    setAtsScore(0);
    setImprovedScore(0);
    setAnalysisResult(null);
    setSessionId(null);
  };

  const handleDownloadResume = async () => {
    if (!resumeFile) return;

    try {
      const blob = new Blob([resumeFile.name], { type: "text/plain" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = resumeFile.name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      toast.error("Failed to download resume");
      console.error(error);
    }
  };

  const handleRegenerateResume = async () => {
    if (!analysisResult) return;

    try {
      setIsLoading(true);
      // Here you would implement the resume regeneration logic
      // using the analysis results to improve the resume
      toast.success("Resume regenerated successfully");
    } catch (error) {
      toast.error("Failed to regenerate resume");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionAction = (action: Suggestion["actionItems"]) => {
    if (action) {
      action.forEach((item) => {
        console.log(`Action Item: ${item}`);
      });
    }
  };

  const getSeverityColor = (severity: "high" | "medium" | "low" | string) => {
    switch (severity) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="w-full py-8 md:py-12 lg:py-24 section-bg-subtle">
          <div className="container px-4 md:px-6">
            {currentStep === "resume" && (
              <motion.div
                className="mx-auto max-w-3xl space-y-6 md:space-y-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="text-center space-y-2">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tighter text-gradient">
                    Upload Your Resume
                  </h1>
                  <p className="text-sm sm:text-base md:text-lg text-muted-foreground">
                    Start by uploading your resume in PDF or DOCX format
                  </p>
                </div>

                <Card className="card-highlight">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col items-center space-y-4">
                      <div className="flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-primary/10">
                        <Upload
                          size={24}
                          className="text-primary sm:w-8 sm:h-8"
                        />
                      </div>
                      <div className="space-y-2 text-center">
                        <h3 className="text-lg sm:text-xl font-semibold">
                          Upload Resume
                        </h3>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          PDF or DOCX (max 5MB)
                        </p>
                      </div>
                      <input
                        type="file"
                        className="sr-only"
                        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        onChange={handleResumeFileChange}
                      />
                      <Button
                        variant="outline"
                        className="border-primary/50 text-primary hover:bg-primary/10 hover:text-primary dark:border-primary/30 dark:hover:bg-primary/20 w-full sm:w-auto"
                        onClick={() =>
                          (
                            document.querySelector(
                              'input[type="file"]'
                            ) as HTMLInputElement
                          )?.click()
                        }
                      >
                        Browse Files
                      </Button>
                      {resumeFile && (
                        <div className="flex items-center space-x-2 w-full justify-center">
                          <FileText size={16} className="text-primary" />
                          <span className="text-sm truncate max-w-[200px] sm:max-w-none">
                            {resumeFile.name}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setResumeFile(null)}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <X size={16} />
                          </Button>
                        </div>
                      )}
                      <Button
                        onClick={handleResumeUpload}
                        disabled={!resumeFile}
                        className="btn-primary w-full"
                      >
                        Continue
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {currentStep === "job-description" && (
              <motion.div
                className="mx-auto max-w-3xl space-y-6 md:space-y-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="text-center space-y-2">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tighter text-gradient">
                    Add Job Description
                  </h1>
                  <p className="text-sm sm:text-base md:text-lg text-muted-foreground">
                    Upload or paste the job description to analyze against your
                    resume
                  </p>
                </div>

                <Tabs
                  defaultValue="paste"
                  onValueChange={setActiveTab}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="paste">Paste Text</TabsTrigger>
                    <TabsTrigger value="upload">Upload File</TabsTrigger>
                  </TabsList>
                  <TabsContent value="paste" className="mt-4">
                    <Card className="card-highlight">
                      <CardContent className="p-4 sm:p-6">
                        <Textarea
                          placeholder="Paste the job description here..."
                          className="min-h-[200px] resize-none border-primary/20 focus-visible:ring-primary/50 dark:border-primary/10"
                          value={jobDescriptionText}
                          onChange={(e) =>
                            setJobDescriptionText(e.target.value)
                          }
                        />
                      </CardContent>
                    </Card>
                  </TabsContent>
                  <TabsContent value="upload" className="mt-4">
                    <Card className="card-highlight">
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex flex-col items-center space-y-4">
                          <div className="flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-primary/10">
                            <Upload
                              size={24}
                              className="text-primary sm:w-8 sm:h-8"
                            />
                          </div>
                          <div className="space-y-2 text-center">
                            <h3 className="text-lg sm:text-xl font-semibold">
                              Upload Job Description
                            </h3>
                            <p className="text-xs sm:text-sm text-muted-foreground">
                              PDF or DOCX (max 5MB)
                            </p>
                          </div>
                          <input
                            type="file"
                            className="sr-only"
                            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                            onChange={handleJobDescriptionFileChange}
                          />
                          <Button
                            variant="outline"
                            className="border-primary/50 text-primary hover:bg-primary/10 hover:text-primary dark:border-primary/30 dark:hover:bg-primary/20 w-full sm:w-auto"
                            onClick={() =>
                              (
                                document.querySelector(
                                  'input[type="file"]'
                                ) as HTMLInputElement
                              )?.click()
                            }
                          >
                            Browse Files
                          </Button>
                          {jobDescriptionFile && (
                            <div className="flex items-center space-x-2 w-full justify-center">
                              <FileText size={16} className="text-primary" />
                              <span className="text-sm truncate max-w-[200px] sm:max-w-none">
                                {jobDescriptionFile.name}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setJobDescriptionFile(null)}
                                className="text-muted-foreground hover:text-destructive"
                              >
                                <X size={16} />
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>

                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep("resume")}
                    className="border-primary/50 text-primary hover:bg-primary/10 hover:text-primary dark:border-primary/30 dark:hover:bg-primary/20 w-full sm:w-auto"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleJobDescriptionSubmit}
                    disabled={
                      isLoading ||
                      (activeTab === "paste"
                        ? !jobDescriptionText.trim()
                        : !jobDescriptionFile)
                    }
                    className="btn-primary w-full sm:w-auto"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 size={16} className="mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      "Analyze Resume"
                    )}
                  </Button>
                </div>
              </motion.div>
            )}

            {currentStep === "analysis" && analysisResult && (
              <motion.div
                className="mx-auto max-w-4xl space-y-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="text-center space-y-2">
                  <h1 className="text-3xl font-bold tracking-tight">
                    Resume Analysis Results
                  </h1>
                  <p className="text-muted-foreground">
                    Here's how your resume matches the job description and
                    suggestions for improvement.
                  </p>
                </div>

                {/* Overall Score Section */}
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h2 className="text-2xl font-semibold mb-4">
                    Resume Match Score
                  </h2>
                  <div className="flex items-center justify-around">
                    <div className="flex flex-col items-center">
                      <h3 className="text-lg font-medium mb-2">
                        Current Score
                      </h3>
                      <div className="w-32 h-32">
                        <CircularProgressbar
                          value={atsScore}
                          text={`${atsScore}%`}
                          styles={buildStyles({
                            pathColor: `rgba(59, 130, 246, ${atsScore / 100})`,
                            textColor: "#1f2937",
                            trailColor: "#e5e7eb",
                            textSize: "20px",
                          })}
                        />
                      </div>
                    </div>
                    <div className="flex items-center text-2xl font-bold text-gray-400 mx-4">
                      →
                    </div>
                    <div className="flex flex-col items-center">
                      <h3 className="text-lg font-medium mb-2">
                        Potential Score
                      </h3>
                      <div className="w-32 h-32">
                        <CircularProgressbar
                          value={improvedScore}
                          text={`${improvedScore}%`}
                          styles={buildStyles({
                            pathColor: `rgba(34, 197, 94, ${
                              improvedScore / 100
                            })`,
                            textColor: "#1f2937",
                            trailColor: "#e5e7eb",
                            textSize: "20px",
                          })}
                        />
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 text-center mt-4">
                    Implement our suggestions to potentially improve your match
                    score by {improvedScore - atsScore}%
                  </p>
                </div>

                {/* AI Analysis Section */}
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h2 className="text-2xl font-semibold mb-6">
                    Resume Improvement Suggestions
                  </h2>
                  <div className="space-y-6">
                    {analysisResult.suggestions.map(
                      (suggestion: Suggestion, index: number) => (
                        <div
                          key={index}
                          className={`p-6 rounded-lg border ${
                            suggestion.severity === "high"
                              ? "border-red-200 bg-red-50"
                              : suggestion.severity === "medium"
                              ? "border-yellow-200 bg-yellow-50"
                              : "border-green-200 bg-green-50"
                          }`}
                        >
                          <div className="flex items-start gap-4">
                            <div className="flex-shrink-0">
                              {suggestion.severity === "high" ? (
                                <div className="p-2 bg-red-100 rounded-full">
                                  <svg
                                    className="w-6 h-6 text-red-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                    />
                                  </svg>
                                </div>
                              ) : suggestion.severity === "medium" ? (
                                <div className="p-2 bg-yellow-100 rounded-full">
                                  <svg
                                    className="w-6 h-6 text-yellow-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                  </svg>
                                </div>
                              ) : (
                                <div className="p-2 bg-green-100 rounded-full">
                                  <svg
                                    className="w-6 h-6 text-green-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                  </svg>
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-lg font-semibold">
                                  {suggestion.title}
                                </h3>
                                <span
                                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                                    suggestion.severity === "high"
                                      ? "bg-red-100 text-red-800"
                                      : suggestion.severity === "medium"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-green-100 text-green-800"
                                  }`}
                                >
                                  {suggestion.severity.charAt(0).toUpperCase() +
                                    suggestion.severity.slice(1)}{" "}
                                  Priority
                                </span>
                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                                  {suggestion.category.charAt(0).toUpperCase() +
                                    suggestion.category.slice(1)}
                                </span>
                              </div>
                              <p className="text-gray-600 mb-4">
                                {suggestion.description}
                              </p>
                              <div className="space-y-2">
                                <h4 className="font-medium text-sm text-gray-900">
                                  Action Items:
                                </h4>
                                <ul className="list-disc list-inside space-y-1 text-gray-600">
                                  {suggestion.actionItems.map(
                                    (item, itemIndex) => (
                                      <li key={itemIndex} className="text-sm">
                                        {item}
                                      </li>
                                    )
                                  )}
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* Key Skills Section */}
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h2 className="text-2xl font-semibold mb-6">Key Skills</h2>
                  <div className="space-y-6">
                    {/* Group skills by category */}
                    {Object.entries(
                      analysisResult.keywords.reduce(
                        (acc: { [key: string]: string[] }, keyword) => {
                          const category = keyword.entity_group.toLowerCase();
                          if (!acc[category]) {
                            acc[category] = [];
                          }
                          acc[category].push(keyword.word);
                          return acc;
                        },
                        {}
                      )
                    ).map(([category, skills]) => (
                      <div key={category} className="space-y-3">
                        <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                          {/* Category icons */}
                          {category === "programming" && (
                            <svg
                              className="w-5 h-5 text-blue-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                              />
                            </svg>
                          )}
                          {category === "frameworks" && (
                            <svg
                              className="w-5 h-5 text-purple-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                              />
                            </svg>
                          )}
                          {category === "databases" && (
                            <svg
                              className="w-5 h-5 text-green-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 7v10c0 2 1.5 3 3.5 3h9c2 0 3.5-1 3.5-3V7c0-2-1.5-3-3.5-3h-9C5.5 4 4 5 4 7zm8 11c.8 0 1.5-.7 1.5-1.5S12.8 15 12 15s-1.5.7-1.5 1.5S11.2 18 12 18z"
                              />
                            </svg>
                          )}
                          {category === "cloud" && (
                            <svg
                              className="w-5 h-5 text-cyan-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
                              />
                            </svg>
                          )}
                          {category === "ai_ml" && (
                            <svg
                              className="w-5 h-5 text-indigo-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                              />
                            </svg>
                          )}
                          {category === "soft_skills" && (
                            <svg
                              className="w-5 h-5 text-yellow-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                              />
                            </svg>
                          )}
                          {category === "tools" && (
                            <svg
                              className="w-5 h-5 text-red-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                          )}
                          {category
                            .split("_")
                            .map(
                              (word) =>
                                word.charAt(0).toUpperCase() + word.slice(1)
                            )
                            .join(" ")}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {skills.map((skill, index) => (
                            <span
                              key={index}
                              className={`px-3 py-1.5 text-sm font-medium rounded-full ${
                                category === "programming"
                                  ? "bg-blue-100 text-blue-800"
                                  : category === "frameworks"
                                  ? "bg-purple-100 text-purple-800"
                                  : category === "databases"
                                  ? "bg-green-100 text-green-800"
                                  : category === "cloud"
                                  ? "bg-cyan-100 text-cyan-800"
                                  : category === "ai_ml"
                                  ? "bg-indigo-100 text-indigo-800"
                                  : category === "soft_skills"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  {analysisResult.keywords.length === 0 && (
                    <p className="text-gray-500 text-center py-4">
                      No key skills identified in the job description.
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    variant="outline"
                    onClick={handleStartNewAnalysis}
                    className="gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Start New Analysis
                  </Button>
                  <Button onClick={handleDownloadResume} className="gap-2">
                    <Download className="h-4 w-4" />
                    Download Resume
                  </Button>
                </div>
              </motion.div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
