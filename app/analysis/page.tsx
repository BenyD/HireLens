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

type UploadStep = "resume" | "job-description" | "analysis";

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
  const router = useRouter();

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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

  const handleResumeUpload = () => {
    if (resumeFile) {
      setCurrentStep("job-description");
    }
  };

  const handleJobDescriptionSubmit = () => {
    if (
      (activeTab === "paste" && jobDescriptionText.trim()) ||
      (activeTab === "upload" && jobDescriptionFile)
    ) {
      setIsLoading(true);
      setCurrentStep("analysis");

      // Simulate loading and analysis
      setTimeout(() => {
        setIsLoading(false);

        // Animate scores
        const atsScoreInterval = setInterval(() => {
          setAtsScore((prev) => {
            const next = prev + 1;
            if (next >= 68) {
              clearInterval(atsScoreInterval);
              return 68;
            }
            return next;
          });
        }, 30);

        const improvedScoreInterval = setInterval(() => {
          setImprovedScore((prev) => {
            const next = prev + 1;
            if (next >= 92) {
              clearInterval(improvedScoreInterval);
              return 92;
            }
            return next;
          });
        }, 30);

        return () => {
          clearInterval(atsScoreInterval);
          clearInterval(improvedScoreInterval);
        };
      }, 2000);
    }
  };

  const handleStartNewAnalysis = () => {
    setCurrentStep("resume");
    setResumeFile(null);
    setJobDescriptionFile(null);
    setJobDescriptionText("");
    setAtsScore(0);
    setImprovedScore(0);
  };

  const handleDownloadResume = () => {
    // In a real app, this would download the resume
    alert(
      `Downloading ${activeTab === "original" ? "original" : "improved"} resume`
    );
  };

  const handleRegenerateResume = () => {
    // In a real app, this would regenerate the improved resume
    alert("Regenerating improved resume");
  };

  const suggestions = [
    {
      id: "keywords",
      title: "Missing Keywords",
      description: "Your resume is missing key terms from the job description.",
      items: [
        "Add 'data visualization' to your skills section",
        "Include 'project management' experience",
        "Mention 'agile methodology' in your work experience",
      ],
      severity: "high",
    },
    {
      id: "format",
      title: "Format Improvements",
      description: "Optimize your resume format for better ATS compatibility.",
      items: [
        "Use standard section headings (Experience, Education, Skills)",
        "Remove tables and complex formatting",
        "Ensure all dates are in MM/YYYY format",
      ],
      severity: "medium",
    },
    {
      id: "content",
      title: "Content Enhancements",
      description: "Strengthen your resume content to better match the job.",
      items: [
        "Quantify your achievements with metrics",
        "Tailor your professional summary to the role",
        "Add relevant certifications",
      ],
      severity: "medium",
    },
    {
      id: "skills",
      title: "Skills Gap",
      description: "Address skill gaps mentioned in the job description.",
      items: [
        "Highlight experience with SQL databases",
        "Add any relevant Python programming experience",
        "Include experience with data analysis tools",
      ],
      severity: "high",
    },
  ];

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

            {currentStep === "analysis" && (
              <motion.div
                className="mx-auto max-w-4xl space-y-6 md:space-y-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="text-center space-y-2">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tighter text-gradient">
                    Resume Analysis Results
                  </h1>
                  <p className="text-sm sm:text-base md:text-lg text-muted-foreground">
                    Here's how your resume matches the job description and
                    suggestions for improvement.
                  </p>
                </div>

                <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
                  <Card className="card-highlight">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg sm:text-xl">
                        Current ATS Score
                      </CardTitle>
                      <CardDescription className="text-sm">
                        How well your resume matches the job description
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <div className="relative h-24 w-24 sm:h-32 sm:w-32">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-2xl sm:text-3xl md:text-4xl font-bold">
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
                      <CardTitle className="text-lg sm:text-xl">
                        Potential Improved Score
                      </CardTitle>
                      <CardDescription className="text-sm">
                        Expected score after implementing our suggestions
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <div className="relative h-24 w-24 sm:h-32 sm:w-32">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-2xl sm:text-3xl md:text-4xl font-bold">
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
                    <CardTitle className="text-lg sm:text-xl">
                      Improvement Suggestions
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Implement these changes to improve your resume's match
                      with the job description
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                      {suggestions.map((suggestion) => (
                        <AccordionItem
                          key={suggestion.id}
                          value={suggestion.id}
                          className="border-b-primary/10"
                        >
                          <AccordionTrigger className="flex items-center hover:text-primary text-sm sm:text-base">
                            <div className="flex items-center gap-2">
                              {suggestion.severity === "high" ? (
                                <AlertTriangle
                                  size={16}
                                  className="text-color-danger"
                                />
                              ) : (
                                <CheckCircle
                                  size={16}
                                  className="text-color-warning"
                                />
                              )}
                              <span>{suggestion.title}</span>
                              <Badge
                                className={`ml-2 text-xs ${getSeverityColor(
                                  suggestion.severity
                                )}`}
                              >
                                {suggestion.severity}
                              </Badge>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-4 pt-2">
                              <p className="text-sm text-muted-foreground">
                                {suggestion.description}
                              </p>
                              <ul className="space-y-2">
                                {suggestion.items.map((item, index) => (
                                  <li
                                    key={index}
                                    className="flex items-start gap-2 text-sm"
                                  >
                                    <ArrowRight
                                      size={16}
                                      className="mt-0.5 text-primary"
                                    />
                                    <span>{item}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>

                <Card className="card-highlight">
                  <CardHeader>
                    <CardTitle className="text-lg sm:text-xl">
                      Resume Comparison
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Compare your original resume with our improved version
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Tabs
                      defaultValue="original"
                      onValueChange={setActiveTab}
                      className="w-full"
                    >
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="original">
                          Original Resume
                        </TabsTrigger>
                        <TabsTrigger value="improved">
                          Improved Resume
                        </TabsTrigger>
                      </TabsList>
                      <TabsContent value="original" className="mt-4 space-y-4">
                        <div className="rounded-lg border bg-muted/40 p-4 border-primary/20 dark:border-primary/10">
                          <p className="text-sm text-muted-foreground">
                            This is a preview of your original resume. We've
                            highlighted areas that could be improved.
                          </p>
                        </div>
                        <div className="rounded-lg border p-4 space-y-4 border-primary/20 dark:border-primary/10">
                          <div>
                            <h3 className="text-base sm:text-lg font-semibold">
                              John Doe
                            </h3>
                            <p className="text-xs sm:text-sm text-muted-foreground">
                              Software Developer
                            </p>
                          </div>
                          <div>
                            <h4 className="text-sm sm:text-base font-medium">
                              Professional Summary
                            </h4>
                            <p className="text-xs sm:text-sm">
                              Software developer with 5 years of experience in
                              web development and application design.
                              <span className="bg-color-danger/20 px-1 mx-1 rounded">
                                Proficient in JavaScript and React.
                              </span>
                            </p>
                          </div>
                          <div>
                            <h4 className="text-sm sm:text-base font-medium">
                              Experience
                            </h4>
                            <div className="space-y-2">
                              <div>
                                <p className="text-xs sm:text-sm font-medium">
                                  Software Developer, ABC Company
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Jan 2020 - Present
                                </p>
                                <ul className="text-xs sm:text-sm list-disc list-inside space-y-1 mt-1">
                                  <li>
                                    Developed web applications using React
                                  </li>
                                  <li>
                                    <span className="bg-color-danger/20 px-1 rounded">
                                      Collaborated with design team on UI/UX
                                      improvements
                                    </span>
                                  </li>
                                  <li>Implemented RESTful APIs</li>
                                </ul>
                              </div>
                            </div>
                          </div>
                          <div>
                            <h4 className="text-sm sm:text-base font-medium">
                              Skills
                            </h4>
                            <p className="text-xs sm:text-sm">
                              JavaScript, React, HTML, CSS, Node.js,
                              <span className="bg-color-danger/20 px-1 mx-1 rounded">
                                Git
                              </span>
                            </p>
                          </div>
                        </div>
                      </TabsContent>
                      <TabsContent value="improved" className="mt-4 space-y-4">
                        <div className="rounded-lg border bg-muted/40 p-4 border-color-success/20 dark:border-color-success/10">
                          <p className="text-sm text-muted-foreground">
                            This is how your resume could look after
                            implementing our suggestions.
                          </p>
                        </div>
                        <div className="rounded-lg border p-4 space-y-4 border-color-success/20 dark:border-color-success/10">
                          <div>
                            <h3 className="text-base sm:text-lg font-semibold">
                              John Doe
                            </h3>
                            <p className="text-xs sm:text-sm text-muted-foreground">
                              Software Developer
                            </p>
                          </div>
                          <div>
                            <h4 className="text-sm sm:text-base font-medium">
                              Professional Summary
                            </h4>
                            <p className="text-xs sm:text-sm">
                              Results-driven Software Developer with 5 years of
                              experience in web development and application
                              design.
                              <span className="bg-color-success/20 px-1 mx-1 rounded">
                                Proficient in JavaScript, React, and data
                                visualization with a strong background in
                                project management and agile methodologies.
                              </span>
                            </p>
                          </div>
                          <div>
                            <h4 className="text-sm sm:text-base font-medium">
                              Experience
                            </h4>
                            <div className="space-y-2">
                              <div>
                                <p className="text-xs sm:text-sm font-medium">
                                  Software Developer, ABC Company
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  01/2020 - Present
                                </p>
                                <ul className="text-xs sm:text-sm list-disc list-inside space-y-1 mt-1">
                                  <li>
                                    Developed web applications using React,
                                    increasing user engagement by 35%
                                  </li>
                                  <li>
                                    <span className="bg-color-success/20 px-1 rounded">
                                      Led UI/UX improvements using data
                                      visualization techniques, resulting in a
                                      28% improvement in user satisfaction
                                    </span>
                                  </li>
                                  <li>
                                    <span className="bg-color-success/20 px-1 rounded">
                                      Implemented RESTful APIs and SQL databases
                                      for data-driven applications
                                    </span>
                                  </li>
                                  <li>
                                    <span className="bg-color-success/20 px-1 rounded">
                                      Managed project timelines and resources
                                      using agile methodology
                                    </span>
                                  </li>
                                </ul>
                              </div>
                            </div>
                          </div>
                          <div>
                            <h4 className="text-sm sm:text-base font-medium">
                              Skills
                            </h4>
                            <p className="text-xs sm:text-sm">
                              JavaScript, React, HTML, CSS, Node.js, Git,
                              <span className="bg-color-success/20 px-1 mx-1 rounded">
                                Python, SQL, Data Visualization, Project
                                Management, Agile Methodology
                              </span>
                            </p>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                  <CardFooter className="flex flex-col sm:flex-row flex-wrap justify-end gap-2">
                    <Button
                      variant="outline"
                      className="gap-1.5 border-primary/50 text-primary hover:bg-primary/10 hover:text-primary dark:border-primary/30 dark:hover:bg-primary/20 w-full sm:w-auto"
                      onClick={handleDownloadResume}
                    >
                      <Download size={16} />
                      Download{" "}
                      {activeTab === "original" ? "Original" : "Improved"}{" "}
                      Resume
                    </Button>
                    {activeTab === "improved" && (
                      <Button
                        className="gap-1.5 btn-gradient w-full sm:w-auto"
                        onClick={handleRegenerateResume}
                      >
                        <RefreshCw size={16} />
                        Regenerate Improved Resume
                      </Button>
                    )}
                  </CardFooter>
                </Card>

                <div className="flex justify-center">
                  <Button
                    size="lg"
                    className="gap-1.5 btn-gradient w-full sm:w-auto"
                    onClick={handleStartNewAnalysis}
                  >
                    Start New Analysis
                    <ArrowRight size={16} />
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
