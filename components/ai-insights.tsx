"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertTriangle,
  CheckCircle,
  Send,
  Bot,
  User,
  Loader2,
} from "lucide-react";
import type { DocumentAnalysis } from "@/lib/gemini";

interface AiInsightsProps {
  selectedClause: number | null;
  documentText?: string;
}

interface ChatMessage {
  id: number;
  type: "ai" | "user";
  message: string;
}

export function AiInsights({ selectedClause, documentText }: AiInsightsProps) {
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      id: 1,
      type: "ai",
      message:
        "Hello! I've analyzed your document. What would you like to know about this contract?",
    },
  ]);
  const [analysis, setAnalysis] = useState<DocumentAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);

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

  const handleSendMessage = async () => {
    if (!chatInput.trim() || isChatLoading) return;

    const newUserMessage: ChatMessage = {
      id: chatHistory.length + 1,
      type: "user",
      message: chatInput,
    };

    setChatHistory((prev) => [...prev, newUserMessage]);
    setChatInput("");
    setIsChatLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: chatInput,
          context: "document",
          documentContext: documentText,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get AI response");
      }

      const data = await response.json();

      const newAiMessage: ChatMessage = {
        id: chatHistory.length + 2,
        type: "ai",
        message: data.response,
      };

      setChatHistory((prev) => [...prev, newAiMessage]);
    } catch (error) {
      console.error("Error getting AI response:", error);
      const errorMessage: ChatMessage = {
        id: chatHistory.length + 2,
        type: "ai",
        message: "I'm sorry, I encountered an error. Please try again.",
      };
      setChatHistory((prev) => [...prev, errorMessage]);
    } finally {
      setIsChatLoading(false);
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

      {/* Interactive Chat Widget */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">
            Ask AI Assistant
          </h2>
          <Badge variant="outline">
            <Bot className="h-3 w-3 mr-1" />
            Online
          </Badge>
        </div>

        {/* Chat History */}
        <ScrollArea className="h-64 mb-4 p-4 border border-border rounded-lg">
          <div className="space-y-4">
            {chatHistory.map((message) => (
              <div
                key={message.id}
                className={`flex items-start space-x-3 ${
                  message.type === "user"
                    ? "flex-row-reverse space-x-reverse"
                    : ""
                }`}
              >
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    message.type === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  {message.type === "user" ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <Bot className="h-4 w-4" />
                  )}
                </div>
                <div
                  className={`flex-1 p-3 rounded-lg ${
                    message.type === "user"
                      ? "bg-primary text-primary-foreground ml-12"
                      : "bg-muted text-foreground mr-12"
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.message}</p>
                </div>
              </div>
            ))}
            {isChatLoading && (
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-secondary text-secondary-foreground">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="flex-1 p-3 rounded-lg bg-muted text-foreground mr-12">
                  <div className="flex items-center space-x-1">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Chat Input */}
        <div className="flex space-x-2">
          <Input
            placeholder="Ask about specific clauses, risks, or legal terms..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            className="flex-1"
            disabled={isChatLoading}
          />
          <Button
            onClick={handleSendMessage}
            className="bg-secondary hover:bg-secondary/90"
            disabled={isChatLoading || !chatInput.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
}
