"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ClauseBreakdown } from "@/components/clause-breakdown";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ArrowLeft,
  Download,
  Share2,
  Save,
  AlertTriangle,
  CheckCircle,
  Info,
} from "lucide-react";
import Link from "next/link";
import { ExportSection } from "@/components/export-section";
import type { DocumentAnalysis } from "@/lib/gemini";

export default function ClausesPage() {
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [analysis, setAnalysis] = useState<DocumentAnalysis | null>(null);
  const [documentName, setDocumentName] = useState<string>("Legal Document");

  useEffect(() => {
    // Get document data from sessionStorage
    const storedName = sessionStorage.getItem("documentName");
    if (storedName) {
      setDocumentName(storedName);
    }

    // Get analysis data from sessionStorage if available
    const storedAnalysis = sessionStorage.getItem("documentAnalysis");
    if (storedAnalysis) {
      try {
        setAnalysis(JSON.parse(storedAnalysis));
      } catch (error) {
        console.error("Error parsing stored analysis:", error);
      }
    }
  }, []);

  // Calculate stats from analysis
  const stats = {
    total: analysis?.clauses?.length || 0,
    high: analysis?.clauses?.filter((c) => c.riskLevel === "high").length || 0,
    medium:
      analysis?.clauses?.filter((c) => c.riskLevel === "medium").length || 0,
    low: analysis?.clauses?.filter((c) => c.riskLevel === "low").length || 0,
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="py-6 px-4 sm:px-6 lg:px-8">
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
                Clause Breakdown
              </h1>
              <p className="text-muted-foreground mt-1">
                Detailed analysis of {documentName}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 mt-4 sm:mt-0">
              <Button variant="outline" size="sm">
                <Save className="h-4 w-4 mr-2" />
                Save Analysis
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button className="bg-secondary hover:bg-secondary/90" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-foreground mb-1">
                {stats.total}
              </div>
              <div className="text-sm text-muted-foreground">Total Clauses</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="flex items-center justify-center mb-1">
                <AlertTriangle className="h-5 w-5 text-destructive mr-1" />
                <span className="text-2xl font-bold text-destructive">
                  {stats.high}
                </span>
              </div>
              <div className="text-sm text-muted-foreground">High Risk</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="flex items-center justify-center mb-1">
                <Info className="h-5 w-5 text-yellow-600 mr-1" />
                <span className="text-2xl font-bold text-yellow-600">
                  {stats.medium}
                </span>
              </div>
              <div className="text-sm text-muted-foreground">Medium Risk</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="flex items-center justify-center mb-1">
                <CheckCircle className="h-5 w-5 text-secondary mr-1" />
                <span className="text-2xl font-bold text-secondary">
                  {stats.low}
                </span>
              </div>
              <div className="text-sm text-muted-foreground">Low Risk</div>
            </Card>
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2 mb-6">
            <Button
              variant={selectedFilter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedFilter("all")}
              className={selectedFilter === "all" ? "bg-primary" : ""}
            >
              All Clauses
            </Button>
            <Button
              variant={selectedFilter === "high" ? "destructive" : "outline"}
              size="sm"
              onClick={() => setSelectedFilter("high")}
            >
              <AlertTriangle className="h-4 w-4 mr-1" />
              High Risk
            </Button>
            <Button
              variant={selectedFilter === "medium" ? "secondary" : "outline"}
              size="sm"
              onClick={() => setSelectedFilter("medium")}
              className={
                selectedFilter === "medium"
                  ? "bg-yellow-600 hover:bg-yellow-700 text-white"
                  : ""
              }
            >
              <Info className="h-4 w-4 mr-1" />
              Medium Risk
            </Button>
            <Button
              variant={selectedFilter === "low" ? "secondary" : "outline"}
              size="sm"
              onClick={() => setSelectedFilter("low")}
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Low Risk
            </Button>
          </div>

          {/* Clause Breakdown Grid */}
          <ClauseBreakdown
            selectedFilter={selectedFilter}
            analysis={analysis}
          />

          {/* Bottom Actions */}
          <div className="mt-8">
            <ExportSection
              documentTitle="Clause Breakdown Analysis"
              showSaveToAccount={true}
            />
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard">
              <Button
                variant="outline"
                className="w-full sm:w-auto bg-transparent"
              >
                Return to Dashboard
              </Button>
            </Link>
            <Link href="/upload">
              <Button
                variant="outline"
                className="w-full sm:w-auto bg-transparent"
              >
                Analyze New Document
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
