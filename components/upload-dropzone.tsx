"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { FileText, Upload, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { motion, AnimatePresence } from "framer-motion"

export default function UploadDropzone() {
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const onDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setIsDragging(false)

      const droppedFile = e.dataTransfer.files[0]
      if (droppedFile && droppedFile.type === "application/pdf") {
        setFile(droppedFile)
      } else {
        toast({
          title: "Invalid file format",
          description: "Please upload a PDF file.",
          variant: "destructive",
        })
      }
    },
    [toast],
  )

  const onFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0]
      if (selectedFile && selectedFile.type === "application/pdf") {
        setFile(selectedFile)
      } else if (selectedFile) {
        toast({
          title: "Invalid file format",
          description: "Please upload a PDF file.",
          variant: "destructive",
        })
      }
    },
    [toast],
  )

  const removeFile = useCallback(() => {
    setFile(null)
  }, [])

  const handleUpload = useCallback(() => {
    if (!file) return

    setIsUploading(true)

    // Simulate upload process
    setTimeout(() => {
      setIsUploading(false)
      toast({
        title: "Resume uploaded successfully",
        description: "Your resume has been uploaded. Proceeding to the next step.",
      })
      router.push("/job-description")
    }, 2000)

    // In a real app, you would upload the file to your server here
    // const formData = new FormData();
    // formData.append("resume", file);
    // await fetch("/api/upload-resume", { method: "POST", body: formData });
  }, [file, router, toast])

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {!file ? (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Card
              className={`border-2 border-dashed ${
                isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/20"
              } transition-colors duration-200`}
            >
              <CardContent
                className="flex flex-col items-center justify-center space-y-4 px-2 py-10 text-xs"
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Upload size={32} className="text-primary" />
                </div>
                <div className="flex flex-col items-center justify-center text-center space-y-2">
                  <h3 className="text-lg font-semibold">Upload your resume</h3>
                  <p className="text-sm text-muted-foreground">Drag and drop your PDF file here, or click to browse</p>
                  <p className="text-xs text-muted-foreground">PDF (max 5MB)</p>
                </div>
                <label htmlFor="resume-upload">
                  <div className="relative">
                    <input
                      id="resume-upload"
                      type="file"
                      className="sr-only"
                      accept="application/pdf"
                      onChange={onFileChange}
                    />
                    <Button
                      variant="outline"
                      className="mt-2 border-primary/50 text-primary hover:bg-primary/10 hover:text-primary dark:border-primary/30 dark:hover:bg-primary/20"
                    >
                      Browse Files
                    </Button>
                  </div>
                </label>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="file-preview"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="card-highlight">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <FileText size={20} className="text-primary" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={removeFile}
                    disabled={isUploading}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <X size={16} weight="bold" />
                    <span className="sr-only">Remove file</span>
                  </Button>
                </div>
                <div className="mt-4 flex justify-end">
                  <Button onClick={handleUpload} disabled={isUploading} className="btn-primary">
                    {isUploading ? (
                      <>
                        <Loader2 size={16} className="mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      "Continue"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

