"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { FileIcon as FilePdf, Upload, FileQuestionIcon as FileDoc, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { motion } from "framer-motion"

export default function JobDescriptionPage() {
  const [jobDescription, setJobDescription] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("paste")
  const router = useRouter()
  const { toast } = useToast()

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (
      selectedFile &&
      (selectedFile.type === "application/pdf" ||
        selectedFile.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document")
    ) {
      setFile(selectedFile)
    } else if (selectedFile) {
      toast({
        title: "Invalid file format",
        description: "Please upload a PDF or DOCX file.",
        variant: "destructive",
      })
    }
  }

  const handleSubmit = () => {
    if (activeTab === "paste" && !jobDescription.trim()) {
      toast({
        title: "Job description required",
        description: "Please enter a job description.",
        variant: "destructive",
      })
      return
    }

    if (activeTab === "upload" && !file) {
      toast({
        title: "File required",
        description: "Please upload a job description file.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    // Simulate processing
    setTimeout(() => {
      setIsLoading(false)
      router.push("/analysis")
    }, 2000)

    // In a real app, you would process the job description here
    // const formData = new FormData();
    // if (activeTab === "upload" && file) {
    //   formData.append("jobDescriptionFile", file);
    // } else {
    //   formData.append("jobDescriptionText", jobDescription);
    // }
    // await fetch("/api/process-job-description", { method: "POST", body: formData });
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 section-bg-subtle">
          <div className="container px-4 md:px-6">
            <motion.div
              className="mx-auto max-w-2xl space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="space-y-2 text-center">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-gradient">
                  Add Job Description
                </h1>
                <p className="text-muted-foreground md:text-lg">
                  Provide the job description you're applying for to get tailored resume feedback.
                </p>
              </div>

              <Tabs defaultValue="paste" onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="paste">Paste Text</TabsTrigger>
                  <TabsTrigger value="upload">Upload File</TabsTrigger>
                </TabsList>
                <TabsContent value="paste" className="mt-4">
                  <Card className="card-highlight">
                    <CardContent className="pt-6">
                      <Textarea
                        placeholder="Paste the job description here..."
                        className="min-h-[200px] resize-none border-primary/20 focus-visible:ring-primary/50 dark:border-primary/10"
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="upload" className="mt-4">
                  <Card className="card-highlight">
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center justify-center space-y-4 py-6">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                          <Upload size={24} className="text-primary" />
                        </div>
                        <div className="space-y-1 text-center">
                          <p className="text-sm font-medium">Upload job description file</p>
                          <p className="text-xs text-muted-foreground">PDF or DOCX (max 5MB)</p>
                        </div>
                        <label htmlFor="job-description-upload">
                          <div className="relative">
                            <input
                              id="job-description-upload"
                              type="file"
                              className="sr-only"
                              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                              onChange={handleFileChange}
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-primary/50 text-primary hover:bg-primary/10 hover:text-primary dark:border-primary/30 dark:hover:bg-primary/20"
                            >
                              Browse Files
                            </Button>
                          </div>
                        </label>
                        {file && (
                          <div className="flex items-center space-x-2">
                            {file.type.includes("pdf") ? (
                              <FilePdf size={16} className="text-primary" />
                            ) : (
                              <FileDoc size={16} className="text-color-info" />
                            )}
                            <span className="text-sm">{file.name}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end">
                <Button onClick={handleSubmit} disabled={isLoading} className="btn-gradient">
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
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

