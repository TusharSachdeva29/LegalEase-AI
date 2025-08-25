"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AlertTriangle, CheckCircle, Send, Bot, User } from "lucide-react"

interface AiInsightsProps {
  selectedClause: number | null
}

const mockSummary = {
  title: "Service Agreement Analysis",
  overview:
    "This is a standard service agreement with moderate risk factors. The contract includes termination clauses that favor the service provider and liability limitations that may impact the client.",
  keyPoints: [
    "30-day termination notice required from either party",
    "Client responsible for indemnification of service provider",
    "Fees become immediately due upon termination",
    "Governed by state law with standard dispute resolution",
  ],
}

const mockRisks = [
  {
    id: 1,
    title: "Immediate Payment Upon Termination",
    description:
      "All unpaid fees become due immediately when contract is terminated, which could create cash flow issues.",
    severity: "high",
    clauseId: 3,
  },
  {
    id: 2,
    title: "Broad Indemnification Clause",
    description: "Client must protect company from all claims, which is very broad and could be costly.",
    severity: "high",
    clauseId: 4,
  },
  {
    id: 3,
    title: "Service Scope Reference",
    description: "Services are defined in separate exhibit which may not be clearly specified.",
    severity: "medium",
    clauseId: 2,
  },
]

const mockChatHistory = [
  {
    id: 1,
    type: "ai" as const,
    message: "Hello! I've analyzed your service agreement. What would you like to know about this contract?",
  },
  {
    id: 2,
    type: "user" as const,
    message: "What are the main risks I should be concerned about?",
  },
  {
    id: 3,
    type: "ai" as const,
    message:
      "The main risks are: 1) Immediate payment of all fees upon termination, 2) Broad indemnification requirements that could be costly, and 3) Service scope defined in a separate exhibit that may lack clarity. Would you like me to explain any of these in more detail?",
  },
]

export function AiInsights({ selectedClause }: AiInsightsProps) {
  const [chatInput, setChatInput] = useState("")
  const [chatHistory, setChatHistory] = useState(mockChatHistory)

  const handleSendMessage = () => {
    if (!chatInput.trim()) return

    const newUserMessage = {
      id: chatHistory.length + 1,
      type: "user" as const,
      message: chatInput,
    }

    const newAiMessage = {
      id: chatHistory.length + 2,
      type: "ai" as const,
      message: "I understand your question about the contract. Let me analyze that specific aspect for you...",
    }

    setChatHistory([...chatHistory, newUserMessage, newAiMessage])
    setChatInput("")
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "text-destructive"
      case "medium":
        return "text-yellow-600"
      case "low":
        return "text-secondary"
      default:
        return "text-muted-foreground"
    }
  }

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">AI Summary</h2>
          <Badge variant="secondary">Analysis Complete</Badge>
        </div>
        <h3 className="font-medium text-foreground mb-2">{mockSummary.title}</h3>
        <p className="text-muted-foreground mb-4 leading-relaxed">{mockSummary.overview}</p>

        <div className="space-y-2">
          <h4 className="font-medium text-foreground text-sm">Key Points:</h4>
          <ul className="space-y-1">
            {mockSummary.keyPoints.map((point, index) => (
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
          <h2 className="text-lg font-semibold text-foreground">Risks & Obligations</h2>
          <Badge variant="destructive">{mockRisks.filter((r) => r.severity === "high").length} High Risk</Badge>
        </div>

        <div className="space-y-4">
          {mockRisks.map((risk) => (
            <div
              key={risk.id}
              className={`p-4 rounded-lg border ${
                selectedClause === risk.clauseId ? "border-secondary bg-secondary/5" : "border-border bg-muted/30"
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-foreground text-sm">{risk.title}</h4>
                <div className="flex items-center space-x-1">
                  <AlertTriangle className={`h-4 w-4 ${getSeverityColor(risk.severity)}`} />
                  <Badge variant={risk.severity === "high" ? "destructive" : "secondary"} className="text-xs">
                    {risk.severity}
                  </Badge>
                </div>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">{risk.description}</p>
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
          <h2 className="text-lg font-semibold text-foreground">Ask AI Assistant</h2>
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
                  message.type === "user" ? "flex-row-reverse space-x-reverse" : ""
                }`}
              >
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    message.type === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  {message.type === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
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
          />
          <Button onClick={handleSendMessage} className="bg-secondary hover:bg-secondary/90">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </div>
  )
}
