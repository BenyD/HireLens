"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  FileText,
  CheckCircle,
  BarChart,
  ArrowDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/header";
import Footer from "@/components/footer";
import UploadDropzone from "@/components/upload-dropzone";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

export default function ClientPage() {
  const router = useRouter();

  const handleGetStarted = () => {
    const uploadSection = document.getElementById("upload-section");
    if (uploadSection) {
      uploadSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleLearnMore = () => {
    const featuresSection = document.getElementById("features");
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleTryItNow = () => {
    const uploadSection = document.getElementById("upload-section");
    if (uploadSection) {
      uploadSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-16 lg:py-24 bg-background relative overflow-hidden">
          {/* Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-color-primary/5 rounded-full blur-3xl" />
            <div className="absolute top-60 -left-20 w-72 h-72 bg-color-secondary/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-20 w-80 h-80 bg-color-accent/5 rounded-full blur-3xl" />
          </div>

          <div className="container px-4 md:px-6 relative">
            <div className="max-w-3xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-4"
              >
                <div className="inline-block mb-4">
                  <span className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium bg-primary/10 text-primary">
                    AI-Powered Resume Analysis
                  </span>
                </div>

                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                  Land Your Dream Job with{" "}
                  <span className="text-gradient">HireLens</span>
                </h1>

                <p className="mx-auto max-w-[700px] text-muted-foreground text-lg md:text-xl">
                  Optimize your resume for ATS systems and increase your
                  interview chances with our AI-powered resume analyzer.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                  <Button
                    size="lg"
                    className="btn-primary"
                    onClick={handleGetStarted}
                  >
                    Get Started
                  </Button>
                  <Button size="lg" variant="outline" onClick={handleLearnMore}>
                    Learn More
                  </Button>
                </div>

                <div className="pt-12 pb-8">
                  <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{
                      repeat: Number.POSITIVE_INFINITY,
                      duration: 2,
                    }}
                    className="flex justify-center"
                  >
                    <Link
                      href="#upload-section"
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      <ArrowDown size={24} />
                      <span className="sr-only">Scroll down</span>
                    </Link>
                  </motion.div>
                </div>
              </motion.div>
            </div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-8 mt-8 md:mt-12"
            >
              <div className="bg-card rounded-lg p-6 shadow-sm border border-border flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-color-primary/10 flex items-center justify-center mb-4">
                  <CheckCircle size={24} className="text-color-primary" />
                </div>
                <h3 className="text-2xl font-bold">93%</h3>
                <p className="text-muted-foreground">Higher Interview Rate</p>
              </div>

              <div className="bg-card rounded-lg p-6 shadow-sm border border-border flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-color-secondary/10 flex items-center justify-center mb-4">
                  <FileText size={24} className="text-color-secondary" />
                </div>
                <h3 className="text-2xl font-bold">10,000+</h3>
                <p className="text-muted-foreground">Resumes Analyzed</p>
              </div>

              <div className="bg-card rounded-lg p-6 shadow-sm border border-border flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-color-accent/10 flex items-center justify-center mb-4">
                  <BarChart size={24} className="text-color-accent" />
                </div>
                <h3 className="text-2xl font-bold">85%</h3>
                <p className="text-muted-foreground">ATS Pass Rate</p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Upload Section */}
        <section
          id="upload-section"
          className="w-full py-12 md:py-24 section-bg-subtle"
        >
          <div className="container px-4 md:px-6">
            <motion.div
              className="mx-auto flex max-w-[800px] flex-col items-center justify-center space-y-8 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <div className="space-y-4">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
                  Start Your Resume Analysis
                </h2>
                <p className="mx-auto max-w-[600px] text-muted-foreground text-lg">
                  Get personalized feedback and suggestions to improve your
                  resume and increase your chances of landing interviews.
                </p>
              </div>
              <Card className="w-full max-w-md card-highlight">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                      <FileText size={32} className="text-primary" />
                    </div>
                    <div className="space-y-2 text-center">
                      <h3 className="text-xl font-semibold">
                        Analyze Your Resume
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Upload your resume and job description to get started
                      </p>
                    </div>
                    <Button
                      size="lg"
                      className="btn-primary w-full"
                      onClick={() => router.push("/analysis")}
                    >
                      Get Started <ArrowRight size={16} className="ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="w-full py-16 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
                How It Works
              </h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground text-lg mt-4">
                Three simple steps to optimize your resume for job applications
              </p>
            </div>

            <motion.div
              className="grid gap-8 md:grid-cols-3"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-color-primary/10 mb-4">
                  <FileText size={24} className="text-color-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">1. Upload Resume</h3>
                <p className="text-muted-foreground">
                  Upload your resume in PDF format for our AI to analyze.
                </p>
              </div>

              <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-color-secondary/10 mb-4">
                  <FileText size={24} className="text-color-secondary" />
                </div>
                <h3 className="text-xl font-bold mb-2">
                  2. Add Job Description
                </h3>
                <p className="text-muted-foreground">
                  Paste or upload the job description you're applying for.
                </p>
              </div>

              <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-color-accent/10 mb-4">
                  <BarChart size={24} className="text-color-accent" />
                </div>
                <h3 className="text-xl font-bold mb-2">3. Get Analysis</h3>
                <p className="text-muted-foreground">
                  Receive detailed feedback and suggestions to improve your
                  resume.
                </p>
              </div>
            </motion.div>

            <div className="mt-12 text-center">
              <Button className="btn-primary" onClick={handleTryItNow}>
                Try It Now <ArrowRight size={16} className="ml-2" />
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section
          id="features"
          className="w-full py-16 md:py-24 section-bg-accent"
        >
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
                Key Features
              </h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground text-lg mt-4">
                Everything you need to optimize your resume for job applications
              </p>
            </div>

            <div className="grid gap-6 md:gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: "ATS Compatibility Check",
                  description:
                    "Ensure your resume passes through Applicant Tracking Systems with our compatibility analysis.",
                  icon: (
                    <CheckCircle size={24} className="text-color-success" />
                  ),
                },
                {
                  title: "Keyword Optimization",
                  description:
                    "Identify missing keywords from the job description to increase your match rate.",
                  icon: <FileText size={24} className="text-color-primary" />,
                },
                {
                  title: "Format Improvement",
                  description:
                    "Get suggestions to improve your resume format for better readability and ATS parsing.",
                  icon: <FileText size={24} className="text-color-secondary" />,
                },
                {
                  title: "Skills Gap Analysis",
                  description:
                    "Identify skills mentioned in the job description that are missing from your resume.",
                  icon: <BarChart size={24} className="text-color-warning" />,
                },
                {
                  title: "Content Enhancement",
                  description:
                    "Receive suggestions to strengthen your resume content with quantifiable achievements.",
                  icon: <FileText size={24} className="text-color-accent" />,
                },
                {
                  title: "Privacy First",
                  description:
                    "Your data never leaves your device. We process everything locally for maximum privacy.",
                  icon: <CheckCircle size={24} className="text-color-info" />,
                },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-card rounded-lg p-6 shadow-sm border border-border"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold">{feature.title}</h3>
                  </div>
                  <p className="text-muted-foreground">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-16 md:py-24 section-bg-primary">
          <div className="container px-4 md:px-6">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
                Ready to Land Your Dream Job?
              </h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground text-lg mt-4 mb-8">
                Start optimizing your resume today and increase your chances of
                getting interviews.
              </p>
              <Button
                size="lg"
                className="btn-primary"
                onClick={handleGetStarted}
              >
                Analyze Your Resume Now
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
