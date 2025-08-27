"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { DocumentViewer } from "@/components/document-viewer";
import { AiInsights } from "@/components/ai-insights";
import { ChatInterface } from "@/components/chat-interface";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Share2, Save } from "lucide-react";
import Link from "next/link";
import { ExportSection } from "@/components/export-section";
import type { DocumentAnalysis } from "@/lib/gemini";

export default function AnalysisPage() {
  const [selectedClause, setSelectedClause] = useState<number | null>(null);
  const [documentText, setDocumentText] = useState<string>("");
  const [documentName, setDocumentName] = useState<string>("Legal Document");
  const [analysis, setAnalysis] = useState<DocumentAnalysis | null>(null);

  useEffect(() => {
    // Get document data from sessionStorage
    const storedText = sessionStorage.getItem("documentText");
    const storedName = sessionStorage.getItem("documentName");

    if (storedText) {
      setDocumentText(storedText);
    }
    if (storedName) {
      setDocumentName(storedName);
    }

    // If no document is found, redirect to upload
    if (!storedText) {
      window.location.href = "/upload";
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-4 pl-4">
        <Link
        href="/dashboard"
        className="inline-flex items-center text-muted-foreground hover:text-primary transition-all duration-300 hover:scale-105 bg-white/5 px-4 py-2 rounded-full backdrop-blur-sm border border-primary/10"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Dashboard
      </Link>
      </div>
      <main className="px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <div>
              <Link
                href="/dashboard"
                className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors mb-2"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-foreground">
                Document Analysis
              </h1>
              <p className="text-muted-foreground mt-1">{documentName}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 mt-4 sm:mt-0">
              <Button variant="outline" size="sm">
                <Save className="h-4 w-4 mr-2" />
                Save to Account
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button className="bg-secondary hover:bg-secondary/90" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </div>

          {/* Main Content - Split Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Panel - Document Viewer */}
            <div className="order-2 lg:order-1">
              <DocumentViewer
                selectedClause={selectedClause}
                onClauseSelect={setSelectedClause}
                analysis={analysis}
              />
            </div>

            {/* Right Panel - AI Insights */}
            <div className="order-1 lg:order-2">
              <AiInsights
                selectedClause={selectedClause}
                documentText={documentText}
              />
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Ask Questions About This Document
            </h2>
            <ChatInterface documentContext={true} documentName={documentName} />
          </div>

          {/* Bottom Action Bar */}
          <div className="mt-8">
            <ExportSection documentTitle={`${documentName} Analysis`} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
