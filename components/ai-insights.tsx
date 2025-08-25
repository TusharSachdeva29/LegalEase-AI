"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, Loader2 } from "lucide-react";
import type { DocumentAnalysis } from "@/lib/gemini";

interface AiInsightsProps {
  selectedClause: number | null;
  documentText?: string;
}

export function AiInsights({ selectedClause, documentText }: AiInsightsProps) {
  const [analysis, setAnalysis] = useState<DocumentAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (documentText && !analysis) {
      analyzeDocumentWithGemini();
    }
  }, [documentText, analysis]);

  const analyzeDocumentWithGemini = async () => {
    if (!documentText) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ documentText }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze document");
      }

      const data = await response.json();
      setAnalysis(data.analysis);

      // Store analysis in sessionStorage for other pages
      sessionStorage.setItem("documentAnalysis", JSON.stringify(data.analysis));
    } catch (error) {
      console.error("Error analyzing document:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "text-destructive";
      case "medium":
        return "text-yellow-600";
      case "low":
        return "text-secondary";
      default:
        return "text-muted-foreground";
    }
  };

  // Show loading state while analyzing
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-secondary" />
              <p className="text-muted-foreground">
                Analyzing document with AI...
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">AI Summary</h2>
          <Badge variant="secondary">Analysis Complete</Badge>
        </div>
        <h3 className="font-medium text-foreground mb-2">
          {analysis?.title || "Document Analysis"}
        </h3>
        <p className="text-muted-foreground mb-4 leading-relaxed">
          {analysis?.overview || "Analysis in progress..."}
        </p>

        <div className="space-y-2">
          <h4 className="font-medium text-foreground text-sm">Key Points:</h4>
          <ul className="space-y-1">
            {analysis?.keyPoints?.map((point: string, index: number) => (
              <li key={index} className="flex items-start space-x-2 text-sm">
                <CheckCircle className="h-4 w-4 text-secondary mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </Card>

      {/* Risks & Obligations Card */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">
            Risks & Obligations
          </h2>
          <Badge variant="destructive">
            {analysis?.risks?.filter((r) => r.severity === "high").length || 0}{" "}
            High Risk
          </Badge>
        </div>

        <div className="space-y-4">
          {analysis?.risks?.map((risk) => (
            <div
              key={risk.id}
              className={`p-4 rounded-lg border ${
                selectedClause === risk.clauseId
                  ? "border-secondary bg-secondary/5"
                  : "border-border bg-muted/30"
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-foreground text-sm">
                  {risk.title}
                </h4>
                <div className="flex items-center space-x-1">
                  <AlertTriangle
                    className={`h-4 w-4 ${getSeverityColor(risk.severity)}`}
                  />
                  <Badge
                    variant={
                      risk.severity === "high" ? "destructive" : "secondary"
                    }
                    className="text-xs"
                  >
                    {risk.severity}
                  </Badge>
                </div>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {risk.description}
              </p>
              <div className="mt-2">
                <Badge variant="outline" className="text-xs">
                  Clause {risk.clauseId}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
