"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Shield, Zap, Lock, Sparkles, ArrowRight, Check, HelpCircle } from "lucide-react"

export function HeroSection() {
  const handleUploadClick = () => {
    window.location.href = "/upload"
  }

  return (
    <section className="min-h-screen py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.07] via-accent/[0.05] to-background"></div>
      
      {/* Animated Orbs */}
      <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-3xl opacity-60 animate-slow-drift"></div>
      <div className="absolute bottom-20 right-10 w-[30rem] h-[30rem] bg-gradient-to-bl from-accent/20 to-primary/20 rounded-full blur-3xl opacity-60 animate-slow-drift-reverse"></div>

      <div className="max-w-7xl mx-auto relative z-10 space-y-32">
        {/* Hero Content */}
        <div className="text-center">
          {/* AI Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 mb-8 hover:scale-105 transition-transform duration-300">
            <Sparkles className="h-4 w-4 text-primary animate-pulse" />
            <span className="text-sm font-medium text-primary">Powered by Google's Advanced AI</span>
          </div>

          {/* Main Heading */}
          <div className="space-y-4 mb-8">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-sans font-bold text-balance leading-[1.1] tracking-tight">
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent inline-block pb-2">
                Legal Documents,
              </span>
              <br />
              <span className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent inline-block">
                Simplified by AI
              </span>
            </h1>
          </div>

          {/* Description */}
          <p className="text-xl sm:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed text-balance">
            Transform complex legal language into clear insights. Upload any legal document and let our AI explain it in simple terms you can trust.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Button
              size="lg"
              onClick={handleUploadClick}
              className="relative group bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white text-lg px-12 py-7 h-auto rounded-2xl shadow-lg transition-all duration-300 border-0 overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 transition-transform duration-500"></div>
              Upload Your Document
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="text-lg px-8 py-7 h-auto rounded-2xl border-2 border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all duration-300 bg-transparent group"
            >
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent group-hover:text-primary transition-colors duration-300">
                Watch Demo
              </span>
            </Button>
          </div>

          {/* Stats Section */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto px-4">
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary">99%</div>
              <div className="text-sm text-muted-foreground">Accuracy Rate</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary">50K+</div>
              <div className="text-sm text-muted-foreground">Documents Analyzed</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary">&lt;2min</div>
              <div className="text-sm text-muted-foreground">Average Processing</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary">24/7</div>
              <div className="text-sm text-muted-foreground">AI Availability</div>
            </div>
          </div>
        </div>

        {/* Feature Cards with Glassmorphism */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          <Card className="p-8 text-center transition-all duration-500 hover:-translate-y-2 bg-white/40 dark:bg-white/10 backdrop-blur-xl border border-white/20 hover:border-primary/20 group rounded-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.07] to-accent/[0.07] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="flex justify-center mb-6">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 group-hover:from-primary/20 group-hover:to-accent/20 transition-all duration-300">
                  <Shield className="h-8 w-8 text-primary group-hover:scale-110 transition-transform duration-300" />
                </div>
              </div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
                Privacy-First Platform
              </h3>
              <p className="text-muted-foreground/90 leading-relaxed">
                Your documents are processed with end-to-end encryption and never stored. Your privacy is our top priority.
              </p>
            </div>
          </Card>

          <Card className="p-8 text-center transition-all duration-500 hover:-translate-y-2 bg-white/40 dark:bg-white/10 backdrop-blur-xl border border-white/20 hover:border-primary/20 group rounded-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.07] to-accent/[0.07] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="flex justify-center mb-6">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 group-hover:from-primary/20 group-hover:to-accent/20 transition-all duration-300">
                  <Zap className="h-8 w-8 text-primary group-hover:scale-110 transition-transform duration-300" />
                </div>
              </div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
                Instant AI Analysis
              </h3>
              <p className="text-muted-foreground/90 leading-relaxed">
                Get instant insights with our advanced AI that breaks down complex legal terms into simple language.
              </p>
            </div>
          </Card>

          <Card className="p-8 text-center transition-all duration-500 hover:-translate-y-2 bg-white/40 dark:bg-white/10 backdrop-blur-xl border border-white/20 hover:border-primary/20 group rounded-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.07] to-accent/[0.07] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="flex justify-center mb-6">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 group-hover:from-primary/20 group-hover:to-accent/20 transition-all duration-300">
                  <Lock className="h-8 w-8 text-primary group-hover:scale-110 transition-transform duration-300" />
                </div>
              </div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
                Enterprise Security
              </h3>
              <p className="text-muted-foreground/90 leading-relaxed">
                Bank-grade security ensures your documents remain confidential with advanced encryption protocols.
              </p>
            </div>
          </Card>
        </div>

        {/* How It Works Section */}
        <div className="relative">
          <div className="absolute -inset-4 bg-gradient-to-r from-primary/5 to-accent/5 rounded-3xl blur-2xl"></div>
          <div className="relative">
            <h2 className="text-4xl font-bold text-center mb-16">
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                How It Works
              </span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {[
                {
                  step: "1",
                  title: "Upload Document",
                  description: "Simply upload your legal document - contracts, agreements, terms of service, or any legal text.",
                },
                {
                  step: "2",
                  title: "AI Analysis",
                  description: "Our advanced AI processes the document, breaking down complex legal terms and identifying key points.",
                },
                {
                  step: "3",
                  title: "Get Insights",
                  description: "Receive clear explanations, summaries, and insights about your document in plain language.",
                },
              ].map((item, index) => (
                <div key={index} className="relative group">
                  <div className="absolute -inset-4 bg-gradient-to-r from-primary/[0.07] to-accent/[0.07] rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative space-y-4 text-center p-6">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                      <span className="text-xl font-bold text-primary">{item.step}</span>
                    </div>
                    <h3 className="text-xl font-bold text-foreground">{item.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Use Cases Section */}
        <div className="text-center space-y-16">
          <h2 className="text-4xl font-bold">
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Perfect For Every Legal Need
            </span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Contract Review",
                description: "Quickly understand terms and conditions in employment contracts, NDAs, and service agreements.",
              },
              {
                title: "Legal Research",
                description: "Analyze legal documents and get relevant insights for your case or research.",
              },
              {
                title: "Compliance Check",
                description: "Ensure your documents comply with legal requirements and industry standards.",
              },
              {
                title: "Document Analysis",
                description: "Break down complex legal documents into simple, actionable insights.",
              },
              {
                title: "Terms Simplification",
                description: "Convert legal jargon into plain language everyone can understand.",
              },
              {
                title: "Risk Assessment",
                description: "Identify potential legal risks and obligations in your documents.",
              },
            ].map((useCase, index) => (
              <Card key={index} className="group p-6 hover:shadow-xl transition-all duration-500 bg-white/40 dark:bg-white/10 backdrop-blur-xl border border-white/20 hover:border-primary/20">
                <h3 className="text-lg font-bold text-foreground mb-3 group-hover:text-primary transition-colors duration-300">
                  {useCase.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {useCase.description}
                </p>
              </Card>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="relative">
          <div className="absolute -inset-4 bg-gradient-to-r from-primary/5 to-accent/5 rounded-3xl blur-2xl"></div>
          <div className="relative text-center space-y-16">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 mb-4">
                <HelpCircle className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">Support</span>
              </div>
              <h2 className="text-4xl font-bold">
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Frequently Asked Questions
                </span>
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Find answers to common questions about our AI-powered legal document analysis
              </p>
            </div>

            <div className="max-w-3xl mx-auto">
              <Accordion type="single" collapsible className="w-full space-y-4">
                {[
                  {
                    question: "How secure is my document data?",
                    answer: "We prioritize your data security with industry-leading measures:",
                    details: [
                      "End-to-end encryption for all documents",
                      "No document storage - immediate deletion after processing",
                      "Real-time processing in isolated environments",
                      "SOC 2 Type II certified infrastructure",
                      "Regular security audits and penetration testing"
                    ]
                  },
                  {
                    question: "What types of documents can I analyze?",
                    answer: "Our AI system can analyze a wide range of legal documents:",
                    details: [
                      "Contracts and agreements",
                      "Terms of service and privacy policies",
                      "Employment contracts and NDAs",
                      "Legal reports and documentation",
                      "Compliance documents and regulations"
                    ]
                  },
                  {
                    question: "How accurate is the AI analysis?",
                    answer: "Our AI maintains exceptional accuracy through:",
                    details: [
                      "99% accuracy rate in document analysis",
                      "Continuous training on latest legal documents",
                      "Regular updates with new legal terminology",
                      "Cross-validation with multiple AI models",
                      "Human expert verification for edge cases"
                    ]
                  },
                  {
                    question: "How long does the analysis take?",
                    answer: "Document analysis is optimized for speed:",
                    details: [
                      "Most documents processed in under 2 minutes",
                      "Real-time progress tracking",
                      "Parallel processing for large documents",
                      "Instant delivery of results",
                      "Batch processing for multiple documents"
                    ]
                  },
                  {
                    question: "What makes your AI different from others?",
                    answer: "Our AI stands out through:",
                    details: [
                      "Specialized legal document training",
                      "Context-aware analysis",
                      "Multi-language support",
                      "Custom terminology handling",
                      "Integration with Google's advanced AI models"
                    ]
                  }
                ].map((faq, index) => (
                  <AccordionItem
                    key={index}
                    value={`item-${index}`}
                    className="bg-white/40 dark:bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-6 data-[state=open]:bg-gradient-to-r data-[state=open]:from-primary/[0.07] data-[state=open]:to-accent/[0.07] transition-colors duration-200"
                  >
                    <AccordionTrigger className="hover:no-underline py-6 text-left">
                      <div className="flex items-start gap-4">
                        <div className="flex-1 text-lg font-semibold">{faq.question}</div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-6">
                      <div className="space-y-4">
                        <p className="text-muted-foreground/90">{faq.answer}</p>
                        <ul className="space-y-2">
                          {faq.details.map((detail, i) => (
                            <li key={i} className="flex items-start gap-2 text-muted-foreground/90">
                              <Check className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                              <span>{detail}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center space-y-8 py-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-balance leading-tight">
            Ready to <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Simplify</span> Your
            <br /> Legal Documents?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join thousands of professionals who trust our AI to understand their legal documents.
          </p>
          <Button
            size="lg"
            onClick={handleUploadClick}
            className="relative group bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white text-lg px-12 py-7 h-auto rounded-2xl shadow-lg transition-all duration-300 border-0 mt-8"
          >
            Try It Now - It's Free
          </Button>
        </div>
      </div>
    </section>
  )
}
