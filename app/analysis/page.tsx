"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Download,
  RefreshCw,
  Loader2,
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
import Header from "@/components/header";
import Footer from "@/components/footer";
import { motion } from "framer-motion";

export default function AnalysisPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [improvedResume, setImprovedResume] = useState<string | null>(null);
  const [atsScore, setAtsScore] = useState(0);
  const [improvedScore, setImprovedScore] = useState(0);
  const [activeTab, setActiveTab] = useState("original");
  const router = useRouter();

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Fetch analysis results or start analysis on mount
  useEffect(() => {
    const fetchOrStartAnalysis = async () => {
      setIsLoading(true);

      try {
        // First try to get existing analysis
        const response = await fetch("/api/analyze", {
          method: "GET",
        });

        if (response.ok) {
          // Analysis results are available
          const data = await response.json();
          handleAnalysisResults(data);
          return;
        }

        // If no results are available, need to start analysis
        setIsAnalyzing(true);
        const analysisResponse = await fetch("/api/analyze", {
          method: "POST",
        });

        if (!analysisResponse.ok) {
          const errorData = await analysisResponse.json();
          throw new Error(errorData.error || "Failed to analyze resume");
        }

        const analysisData = await analysisResponse.json();
        handleAnalysisResults(analysisData);
      } catch (error) {
        console.error("Error in analysis:", error);
        setError(
          error instanceof Error
            ? error.message
            : "An unexpected error occurred"
        );
      } finally {
        setIsLoading(false);
        setIsAnalyzing(false);
      }
    };

    fetchOrStartAnalysis();
  }, []);

  // Process analysis results and animate scores
  const handleAnalysisResults = (data: any) => {
    setAnalysisResults(data.analysis);
    setImprovedResume(data.improvedResume);

    // Animate the scores
    const targetAtsScore = data.analysis.atsScore;
    const targetImprovedScore = 92; // Usually this would come from the API

    // Animate ATS score
    let currentAtsScore = 0;
    const atsScoreInterval = setInterval(() => {
      if (currentAtsScore >= targetAtsScore) {
        clearInterval(atsScoreInterval);
        setAtsScore(targetAtsScore);
      } else {
        currentAtsScore += 1;
        setAtsScore(currentAtsScore);
      }
    }, 30);

    // Animate improved score
    let currentImprovedScore = 0;
    const improvedScoreInterval = setInterval(() => {
      if (currentImprovedScore >= targetImprovedScore) {
        clearInterval(improvedScoreInterval);
        setImprovedScore(targetImprovedScore);
      } else {
        currentImprovedScore += 1;
        setImprovedScore(currentImprovedScore);
      }
    }, 30);

    return () => {
      clearInterval(atsScoreInterval);
      clearInterval(improvedScoreInterval);
    };
  };

  const handleStartNewAnalysis = () => {
    router.push("/");
  };

  const handleDownloadResume = () => {
    const content =
      activeTab === "original" ? "Original Resume" : improvedResume;
    const blob = new Blob([content || ""], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${
      activeTab === "original" ? "original" : "improved"
    }_resume.txt`;
    document.body.appendChild(a);
    a.click();

    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleRegenerateResume = async () => {
    setIsAnalyzing(true);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to regenerate resume");
      }

      const data = await response.json();
      setAnalysisResults(data.analysis);
      setImprovedResume(data.improvedResume);

      // Show success message
      setActiveTab("improved");
    } catch (error) {
      console.error("Error regenerating resume:", error);
      setError(
        error instanceof Error ? error.message : "Failed to regenerate resume"
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-color-danger/10 text-color-danger hover:bg-color-danger/20 border-color-danger/20";
      case "medium":
        return "bg-color-warning/10 text-color-warning hover:bg-color-warning/20 border-color-warning/20";
      case "low":
        return "bg-color-success/10 text-color-success hover:bg-color-success/20 border-color-success/20";
      default:
        return "bg-primary/10 text-primary hover:bg-primary/20 border-primary/20";
    }
  };

  // Loading state or error state
  if (isLoading || error || !analysisResults) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <section className="w-full py-12 md:py-24 section-bg-subtle">
            <div className="container px-4 md:px-6">
              <motion.div
                className="mx-auto max-w-3xl space-y-8 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                {error ? (
                  <>
                    <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-gradient">
                      Analysis Error
                    </h1>
                    <p className="text-muted-foreground md:text-lg">{error}</p>
                    <Button onClick={handleStartNewAnalysis} className="mt-4">
                      Start Over
                    </Button>
                  </>
                ) : (
                  <>
                    <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-gradient">
                      Analyzing Your Resume
                    </h1>
                    <p className="text-muted-foreground md:text-lg">
                      We're comparing your resume with the job description to
                      provide personalized feedback.
                    </p>
                    <div className="mx-auto max-w-md space-y-4">
                      <Progress value={65} className="h-2 w-full bg-muted" />
                      <p className="text-sm text-muted-foreground">
                        This may take a moment...
                      </p>
                    </div>
                  </>
                )}
              </motion.div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  // Render analysis results
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 section-bg-subtle">
          <div className="container px-4 md:px-6">
            <motion.div
              className="mx-auto max-w-4xl space-y-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-gradient">
                  Resume Analysis Results
                </h1>
                <p className="text-muted-foreground md:text-lg">
                  Here's how your resume matches the job description and
                  suggestions for improvement.
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <Card className="card-highlight">
                  <CardHeader className="pb-2">
                    <CardTitle>Current ATS Score</CardTitle>
                    <CardDescription>
                      How well your resume matches the job description
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="relative h-32 w-32">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-4xl font-bold">
                            {atsScore}%
                          </span>
                        </div>
                        <svg className="h-full w-full" viewBox="0 0 100 100">
                          <circle
                            className="stroke-muted-foreground/20"
                            cx="50"
                            cy="50"
                            r="40"
                            strokeWidth="10"
                            fill="none"
                          />
                          <circle
                            className="stroke-color-warning"
                            cx="50"
                            cy="50"
                            r="40"
                            strokeWidth="10"
                            fill="none"
                            strokeLinecap="round"
                            strokeDasharray={`${atsScore * 2.51} 251`}
                            transform="rotate(-90 50 50)"
                          />
                        </svg>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-color-warning">
                          {atsScore < 70 ? "Needs Improvement" : "Good Match"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="card-highlight">
                  <CardHeader className="pb-2">
                    <CardTitle>Potential Improved Score</CardTitle>
                    <CardDescription>
                      Expected score after implementing our suggestions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="relative h-32 w-32">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-4xl font-bold">
                            {improvedScore}%
                          </span>
                        </div>
                        <svg className="h-full w-full" viewBox="0 0 100 100">
                          <circle
                            className="stroke-muted-foreground/20"
                            cx="50"
                            cy="50"
                            r="40"
                            strokeWidth="10"
                            fill="none"
                          />
                          <circle
                            className="stroke-color-success"
                            cx="50"
                            cy="50"
                            r="40"
                            strokeWidth="10"
                            fill="none"
                            strokeLinecap="round"
                            strokeDasharray={`${improvedScore * 2.51} 251`}
                            transform="rotate(-90 50 50)"
                          />
                        </svg>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-color-success">
                          Excellent Match
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="card-highlight">
                <CardHeader>
                  <CardTitle>Suggestions for Improvement</CardTitle>
                  <CardDescription>
                    Follow these recommendations to improve your ATS score and
                    chances of getting an interview
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="multiple" className="w-full">
                    {analysisResults.suggestedImprovements.map(
                      (suggestion: any, index: number) => (
                        <AccordionItem
                          key={index}
                          value={`suggestion-${index}`}
                        >
                          <AccordionTrigger className="text-left">
                            <div className="flex items-center space-x-2">
                              <Badge
                                className={`${getSeverityColor(
                                  suggestion.severity
                                )} rounded-sm px-1.5 py-0.5`}
                                variant="outline"
                              >
                                {suggestion.severity}
                              </Badge>
                              <span>{suggestion.category}</span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-3 pb-1 pt-1">
                              <p className="text-sm text-muted-foreground">
                                {suggestion.description}
                              </p>
                              <ul className="ml-6 list-disc text-sm">
                                {suggestion.suggestions.map(
                                  (item: string, idx: number) => (
                                    <li key={idx} className="mt-1">
                                      {item}
                                    </li>
                                  )
                                )}
                              </ul>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      )
                    )}
                  </Accordion>
                </CardContent>
              </Card>

              <Card className="card-highlight">
                <CardHeader>
                  <CardTitle>Missing Keywords</CardTitle>
                  <CardDescription>
                    Include these keywords in your resume to improve ATS
                    matching
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  {analysisResults.missingKeywords.map(
                    (keyword: string, index: number) => (
                      <Badge
                        key={index}
                        className="bg-primary/10 text-primary hover:bg-primary/20"
                      >
                        {keyword}
                      </Badge>
                    )
                  )}
                </CardContent>
              </Card>

              <Card className="card-highlight">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="space-y-1">
                    <CardTitle>Resume Content</CardTitle>
                    <CardDescription>
                      Compare your original resume with our improved version
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="original" onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="original">
                        Original Resume
                      </TabsTrigger>
                      <TabsTrigger value="improved">
                        Improved Resume
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="original" className="mt-4 space-y-4">
                      <div className="rounded-lg border bg-muted/40 p-4">
                        <p className="text-sm text-muted-foreground">
                          This is your original resume content.
                        </p>
                      </div>
                      <div className="space-y-4 rounded-lg border bg-card p-4 text-card-foreground shadow">
                        <pre className="whitespace-pre-wrap text-sm">
                          {/* Original resume content would go here */}
                          {/* Since we don't store the original text format in the session, we show a placeholder */}
                          Your original resume format is not preserved in this
                          view. Please download your original resume file for
                          the exact formatting.
                        </pre>
                      </div>
                    </TabsContent>
                    <TabsContent value="improved" className="mt-4 space-y-4">
                      <div className="rounded-lg border bg-muted/40 p-4 border-color-success/20 dark:border-color-success/10">
                        <p className="text-sm text-muted-foreground">
                          This is how your resume could look after implementing
                          our suggestions.
                        </p>
                      </div>
                      <div className="space-y-4 rounded-lg border border-color-success/20 bg-card p-4 text-card-foreground shadow dark:border-color-success/10">
                        <pre className="whitespace-pre-wrap text-sm">
                          {improvedResume}
                        </pre>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
                <CardFooter className="flex flex-wrap justify-end gap-2">
                  <Button
                    variant="outline"
                    className="gap-1.5 border-primary/50 text-primary hover:bg-primary/10 hover:text-primary dark:border-primary/30 dark:hover:bg-primary/20"
                    onClick={handleDownloadResume}
                  >
                    <Download size={16} />
                    Download{" "}
                    {activeTab === "original" ? "Original" : "Improved"} Resume
                  </Button>
                  {activeTab === "improved" && (
                    <Button
                      className="gap-1.5 btn-gradient"
                      onClick={handleRegenerateResume}
                      disabled={isAnalyzing}
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 size={16} className="mr-2 animate-spin" />
                          Regenerating...
                        </>
                      ) : (
                        <>
                          <RefreshCw size={16} />
                          Regenerate Improved Resume
                        </>
                      )}
                    </Button>
                  )}
                </CardFooter>
              </Card>

              <div className="flex justify-center">
                <Button
                  size="lg"
                  className="gap-1.5 btn-gradient"
                  onClick={handleStartNewAnalysis}
                >
                  Start New Analysis
                  <ArrowRight size={16} />
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
