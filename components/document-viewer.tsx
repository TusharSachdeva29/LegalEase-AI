"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ZoomIn, ZoomOut, RotateCw, AlertTriangle, Info } from "lucide-react";
import type { DocumentAnalysis } from "@/lib/gemini";

interface DocumentViewerProps {
  selectedClause: number | null;
  onClauseSelect: (clauseId: number | null) => void;
  analysis?: DocumentAnalysis | null;
}

export function DocumentViewer({
  selectedClause,
  onClauseSelect,
  analysis,
}: DocumentViewerProps) {
  const [zoom, setZoom] = useState(100);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 25, 50));

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case "high":
        return "bg-destructive/10 border-destructive/20";
      case "medium":
        return "bg-yellow-50 border-yellow-200";
      case "low":
        return "bg-secondary/10 border-secondary/20";
      default:
        return "bg-muted border-border";
    }
  };

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case "high":
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case "medium":
        return <Info className="h-4 w-4 text-yellow-600" />;
      case "low":
        return <Info className="h-4 w-4 text-secondary" />;
      default:
        return null;
    }
  };

  // Use analysis clauses if available, otherwise show empty state
  const clauses = analysis?.clauses || [];

  return (
    <Card className="h-fit">
      {/* Document Viewer Header */}
      <div className="p-4 border-b border-border">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-foreground">
            Original Document
          </h2>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={handleZoomOut}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground min-w-[3rem] text-center">
              {zoom}%
            </span>
            <Button variant="outline" size="sm" onClick={handleZoomIn}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm">
              <RotateCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Document Content */}
      <div className="p-6 max-h-[600px] overflow-y-auto">
        <div style={{ fontSize: `${zoom}%` }} className="space-y-4">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-foreground mb-2">
              {analysis?.title || "LEGAL DOCUMENT"}
            </h1>
            <p className="text-muted-foreground">AI-Analyzed Document</p>
          </div>

          {clauses.length > 0 ? (
            clauses.map((clause) => (
              <div
                key={clause.id}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedClause === clause.id
                    ? "border-secondary bg-secondary/5"
                    : getRiskColor(clause.riskLevel)
                } hover:shadow-md`}
                onClick={() =>
                  onClauseSelect(
                    selectedClause === clause.id ? null : clause.id
                  )
                }
              >
                <div className="flex items-start justify-between mb-2">
                  <Badge variant="outline" className="text-xs">
                    {clause.title}
                  </Badge>
                  <div className="flex items-center space-x-1">
                    {getRiskIcon(clause.riskLevel)}
                    <Badge
                      variant={
                        clause.riskLevel === "high"
                          ? "destructive"
                          : "secondary"
                      }
                      className="text-xs"
                    >
                      {clause.riskLevel} risk
                    </Badge>
                  </div>
                </div>
                <p className="text-foreground leading-relaxed mb-2">
                  {clause.originalText}
                </p>
                {selectedClause === clause.id && (
                  <div className="mt-3 p-3 bg-secondary/10 rounded border-l-4 border-secondary">
                    <h4 className="font-medium text-sm mb-1">Plain English:</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      {clause.simplifiedExplanation}
                    </p>
                    <h4 className="font-medium text-sm mb-1">
                      What this means:
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {clause.whatThisMeans}
                    </p>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                Upload a document to see AI-powered clause analysis
              </p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
