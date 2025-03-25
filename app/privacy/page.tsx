"use client"

import { useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { motion } from "framer-motion"
import { ShieldCheck, Lock, Database, Eye, FileText } from "lucide-react"

export default function PrivacyPage() {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

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
                  Privacy Policy
                </h1>
                <p className="text-muted-foreground md:text-lg">
                  At HireLens, we prioritize your privacy and data security
                </p>
              </div>

              <Card className="card-highlight">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShieldCheck size={24} className="text-primary" />
                    Our Privacy Commitment
                  </CardTitle>
                  <CardDescription>How we protect your data and respect your privacy</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium flex items-center gap-2">
                      <Lock size={20} className="text-primary" />
                      No Account Required
                    </h3>
                    <p className="text-muted-foreground">
                      HireLens is designed to be used without creating an account. We don't collect or store any
                      personal information about you. You can use our service completely anonymously.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-medium flex items-center gap-2">
                      <Database size={20} className="text-primary" />
                      Local Processing
                    </h3>
                    <p className="text-muted-foreground">
                      Your resume and job description are processed locally in your browser. The data never leaves your
                      device and is not stored on our servers. Once you close your browser, all your data is
                      automatically deleted.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-medium flex items-center gap-2">
                      <Eye size={20} className="text-primary" />
                      No Tracking
                    </h3>
                    <p className="text-muted-foreground">
                      We don't use cookies or any tracking technologies to monitor your behavior. We believe in
                      providing a service that respects your privacy completely.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-medium flex items-center gap-2">
                      <FileText size={20} className="text-primary" />
                      Your Data Ownership
                    </h3>
                    <p className="text-muted-foreground">
                      You retain full ownership of your resume and all data you provide. We do not claim any rights to
                      your content and do not use it for any purpose other than providing you with analysis and
                      suggestions.
                    </p>
                  </div>

                  <div className="border-t pt-4 mt-4">
                    <p className="text-sm text-muted-foreground">
                      This privacy policy was last updated on March 17, 2025. If you have any questions or concerns
                      about our privacy practices, please contact us at privacy@hirelens.com.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

