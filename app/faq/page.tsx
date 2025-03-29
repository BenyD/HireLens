"use client";

import { useEffect } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { motion } from "framer-motion";

export default function FAQPage() {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const faqs = [
    {
      question: "How does HireLens analyze my resume?",
      answer:
        "HireLens uses advanced AI algorithms to analyze your resume against the job description you provide. It identifies missing keywords, formatting issues, and content gaps that might prevent your resume from passing through Applicant Tracking Systems (ATS).",
    },
    {
      question: "Is my data secure and private?",
      answer:
        "Yes, your privacy is our top priority. HireLens is designed with a privacy-first approach. Your resume and job description data is processed locally and never stored on our servers. Once you close your browser, all your data is automatically deleted.",
    },
    {
      question: "What file formats are supported for resume uploads?",
      answer:
        "Currently, HireLens supports PDF format for resume uploads. For job descriptions, we support both PDF and DOCX formats, or you can simply paste the text directly.",
    },
    {
      question: "How accurate is the ATS score prediction?",
      answer:
        "Our ATS score prediction is based on industry standards and best practices used by common Applicant Tracking Systems. While we strive for high accuracy, different companies may use different ATS configurations, so consider our score as a strong guideline rather than an absolute measure.",
    },
    {
      question: "Do I need to create an account to use HireLens?",
      answer:
        "No, HireLens doesn't require any account creation or sign-up. We believe in providing a frictionless experience while maintaining your privacy. Simply upload your resume and start analyzing right away.",
    },
    {
      question: "Can I use HireLens on mobile devices?",
      answer:
        "Yes, HireLens is fully responsive and works on all devices including smartphones and tablets. You can analyze your resume on the go!",
    },
    {
      question: "How can I implement the suggested improvements to my resume?",
      answer:
        "After analysis, HireLens provides specific suggestions for improvement. You can download your original resume, make the suggested changes in your preferred word processor, or use our 'Improved Resume' version as a starting point.",
    },
    {
      question: "Is HireLens free to use?",
      answer:
        "Yes, HireLens is completely free to use. We believe everyone should have access to tools that help them land their dream job without financial barriers.",
    },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 section-bg-subtle">
          <div className="container px-4 md:px-6">
            <motion.div
              className="mx-auto max-w-3xl space-y-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-gradient">
                  Frequently Asked Questions
                </h1>
                <p className="text-muted-foreground md:text-lg">
                  Find answers to common questions about HireLens and how it can
                  help you land your dream job.
                </p>
              </div>

              <Card className="card-highlight">
                <CardHeader>
                  <CardTitle>Common Questions</CardTitle>
                  <CardDescription>
                    Everything you need to know about HireLens
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {faqs.map((faq, index) => (
                      <AccordionItem
                        key={index}
                        value={`item-${index}`}
                        className="border-b-primary/10"
                      >
                        <AccordionTrigger className="text-left hover:text-primary">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>

              <div className="text-center">
                <p className="text-muted-foreground">
                  Still have questions? Contact us at{" "}
                  <a
                    href="mailto:benydishon@gmail.com"
                    className="text-primary hover:underline"
                  >
                    benydishon@gmail.com
                  </a>
                </p>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
