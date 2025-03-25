"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle, AlertTriangle, ArrowRight, Download, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { motion } from "framer-motion"

export default function AnalysisPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [atsScore, setAtsScore] = useState(0)
  const [improvedScore, setImprovedScore] = useState(0)
  const [activeTab, setActiveTab] = useState("original")
  const router = useRouter()

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // Simulate loading and analysis
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)

      // Animate scores
      const atsScoreInterval = setInterval(() => {
        setAtsScore((prev) => {
          const next = prev + 1
          if (next >= 68) {
            clearInterval(atsScoreInterval)
            return 68
          }
          return next
        })
      }, 30)

      const improvedScoreInterval = setInterval(() => {
        setImprovedScore((prev) => {
          const next = prev + 1
          if (next >= 92) {
            clearInterval(improvedScoreInterval)
            return 92
          }
          return next
        })
      }, 30)

      return () => {
        clearInterval(atsScoreInterval)
        clearInterval(improvedScoreInterval)
      }
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  const handleStartNewAnalysis = () => {
    router.push("/")
  }

  const handleDownloadResume = () => {
    // In a real app, this would download the resume
    alert(`Downloading ${activeTab === "original" ? "original" : "improved"} resume`)
  }

  const handleRegenerateResume = () => {
    // In a real app, this would regenerate the improved resume
    alert("Regenerating improved resume")
  }

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
  ]

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-color-danger/10 text-color-danger hover:bg-color-danger/20 border-color-danger/20"
      case "medium":
        return "bg-color-warning/10 text-color-warning hover:bg-color-warning/20 border-color-warning/20"
      case "low":
        return "bg-color-success/10 text-color-success hover:bg-color-success/20 border-color-success/20"
      default:
        return "bg-primary/10 text-primary hover:bg-primary/20 border-primary/20"
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 section-bg-subtle">
          <div className="container px-4 md:px-6">
            {isLoading ? (
              <motion.div
                className="mx-auto max-w-3xl space-y-8 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-gradient">
                  Analyzing Your Resume
                </h1>
                <p className="text-muted-foreground md:text-lg">
                  We're comparing your resume with the job description to provide personalized feedback.
                </p>
                <div className="mx-auto max-w-md space-y-4">
                  <Progress value={65} className="h-2 w-full bg-muted" />
                  <p className="text-sm text-muted-foreground">This may take a moment...</p>
                </div>
              </motion.div>
            ) : (
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
                    Here's how your resume matches the job description and suggestions for improvement.
                  </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <Card className="card-highlight">
                    <CardHeader className="pb-2">
                      <CardTitle>Current ATS Score</CardTitle>
                      <CardDescription>How well your resume matches the job description</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <div className="relative h-32 w-32">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-4xl font-bold">{atsScore}%</span>
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
                      <CardDescription>Expected score after implementing our suggestions</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <div className="relative h-32 w-32">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-4xl font-bold">{improvedScore}%</span>
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
                          <p className="text-sm font-medium text-color-success">Excellent Match</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="card-highlight">
                  <CardHeader>
                    <CardTitle>Improvement Suggestions</CardTitle>
                    <CardDescription>
                      Implement these changes to improve your resume's match with the job description
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                      {suggestions.map((suggestion) => (
                        <AccordionItem key={suggestion.id} value={suggestion.id} className="border-b-primary/10">
                          <AccordionTrigger className="flex items-center hover:text-primary">
                            <div className="flex items-center gap-2">
                              {suggestion.severity === "high" ? (
                                <AlertTriangle size={20} className="text-color-danger" />
                              ) : (
                                <CheckCircle size={20} className="text-color-warning" />
                              )}
                              <span>{suggestion.title}</span>
                              <Badge className={`ml-2 ${getSeverityColor(suggestion.severity)}`}>
                                {suggestion.severity}
                              </Badge>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-4 pt-2">
                              <p className="text-sm text-muted-foreground">{suggestion.description}</p>
                              <ul className="space-y-2">
                                {suggestion.items.map((item, index) => (
                                  <li key={index} className="flex items-start gap-2 text-sm">
                                    <ArrowRight size={16} className="mt-0.5 text-primary" />
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
                    <CardTitle>Resume Comparison</CardTitle>
                    <CardDescription>Compare your original resume with our improved version</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="original" onValueChange={setActiveTab} className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="original">Original Resume</TabsTrigger>
                        <TabsTrigger value="improved">Improved Resume</TabsTrigger>
                      </TabsList>
                      <TabsContent value="original" className="mt-4 space-y-4">
                        <div className="rounded-lg border bg-muted/40 p-4 border-primary/20 dark:border-primary/10">
                          <p className="text-sm text-muted-foreground">
                            This is a preview of your original resume. We've highlighted areas that could be improved.
                          </p>
                        </div>
                        <div className="rounded-lg border p-4 space-y-4 border-primary/20 dark:border-primary/10">
                          <div>
                            <h3 className="text-lg font-semibold">John Doe</h3>
                            <p className="text-sm text-muted-foreground">Software Developer</p>
                          </div>
                          <div>
                            <h4 className="text-md font-medium">Professional Summary</h4>
                            <p className="text-sm">
                              Software developer with 5 years of experience in web development and application design.
                              <span className="bg-color-danger/20 px-1 mx-1 rounded">
                                Proficient in JavaScript and React.
                              </span>
                            </p>
                          </div>
                          <div>
                            <h4 className="text-md font-medium">Experience</h4>
                            <div className="space-y-2">
                              <div>
                                <p className="text-sm font-medium">Software Developer, ABC Company</p>
                                <p className="text-xs text-muted-foreground">Jan 2020 - Present</p>
                                <ul className="text-sm list-disc list-inside space-y-1 mt-1">
                                  <li>Developed web applications using React</li>
                                  <li>
                                    <span className="bg-color-danger/20 px-1 rounded">
                                      Collaborated with design team on UI/UX improvements
                                    </span>
                                  </li>
                                  <li>Implemented RESTful APIs</li>
                                </ul>
                              </div>
                            </div>
                          </div>
                          <div>
                            <h4 className="text-md font-medium">Skills</h4>
                            <p className="text-sm">
                              JavaScript, React, HTML, CSS, Node.js,
                              <span className="bg-color-danger/20 px-1 mx-1 rounded">Git</span>
                            </p>
                          </div>
                        </div>
                      </TabsContent>
                      <TabsContent value="improved" className="mt-4 space-y-4">
                        <div className="rounded-lg border bg-muted/40 p-4 border-color-success/20 dark:border-color-success/10">
                          <p className="text-sm text-muted-foreground">
                            This is how your resume could look after implementing our suggestions.
                          </p>
                        </div>
                        <div className="rounded-lg border p-4 space-y-4 border-color-success/20 dark:border-color-success/10">
                          <div>
                            <h3 className="text-lg font-semibold">John Doe</h3>
                            <p className="text-sm text-muted-foreground">Software Developer</p>
                          </div>
                          <div>
                            <h4 className="text-md font-medium">Professional Summary</h4>
                            <p className="text-sm">
                              Results-driven Software Developer with 5 years of experience in web development and
                              application design.
                              <span className="bg-color-success/20 px-1 mx-1 rounded">
                                Proficient in JavaScript, React, and data visualization with a strong background in
                                project management and agile methodologies.
                              </span>
                            </p>
                          </div>
                          <div>
                            <h4 className="text-md font-medium">Experience</h4>
                            <div className="space-y-2">
                              <div>
                                <p className="text-sm font-medium">Software Developer, ABC Company</p>
                                <p className="text-xs text-muted-foreground">01/2020 - Present</p>
                                <ul className="text-sm list-disc list-inside space-y-1 mt-1">
                                  <li>Developed web applications using React, increasing user engagement by 35%</li>
                                  <li>
                                    <span className="bg-color-success/20 px-1 rounded">
                                      Led UI/UX improvements using data visualization techniques, resulting in a 28%
                                      improvement in user satisfaction
                                    </span>
                                  </li>
                                  <li>
                                    <span className="bg-color-success/20 px-1 rounded">
                                      Implemented RESTful APIs and SQL databases for data-driven applications
                                    </span>
                                  </li>
                                  <li>
                                    <span className="bg-color-success/20 px-1 rounded">
                                      Managed project timelines and resources using agile methodology
                                    </span>
                                  </li>
                                </ul>
                              </div>
                            </div>
                          </div>
                          <div>
                            <h4 className="text-md font-medium">Skills</h4>
                            <p className="text-sm">
                              JavaScript, React, HTML, CSS, Node.js, Git,
                              <span className="bg-color-success/20 px-1 mx-1 rounded">
                                Python, SQL, Data Visualization, Project Management, Agile Methodology
                              </span>
                            </p>
                          </div>
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
                      Download {activeTab === "original" ? "Original" : "Improved"} Resume
                    </Button>
                    {activeTab === "improved" && (
                      <Button className="gap-1.5 btn-gradient" onClick={handleRegenerateResume}>
                        <RefreshCw size={16} />
                        Regenerate Improved Resume
                      </Button>
                    )}
                  </CardFooter>
                </Card>

                <div className="flex justify-center">
                  <Button size="lg" className="gap-1.5 btn-gradient" onClick={handleStartNewAnalysis}>
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
  )
}

