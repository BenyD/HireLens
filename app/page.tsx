import type { Metadata } from "next"
import ClientPage from "./clientpage"

export const metadata: Metadata = {
  title: "HireLens | AI Resume Analyzer",
  description: "Optimize your resume for job applications with AI-powered analysis",
}

export default function Home() {
  return <ClientPage />
}

