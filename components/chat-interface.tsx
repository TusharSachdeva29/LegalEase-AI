"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Bot, User, FileText, MessageCircle } from "lucide-react"

interface Message {
  id: string
  type: "user" | "ai"
  content: string
  timestamp: Date
  context?: "document" | "general"
}

interface ChatInterfaceProps {
  documentContext?: boolean
  documentName?: string
}

export function ChatInterface({ documentContext = false, documentName }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "ai",
      content: documentContext
        ? `Hello! I'm here to help you understand your document${documentName ? ` "${documentName}"` : ""}. Ask me anything about the clauses, risks, or legal implications.`
        : "Hello! I'm your legal AI assistant. I can help with general legal questions, contract advice, and document analysis. How can I assist you today?",
      timestamp: new Date(),
      context: documentContext ? "document" : "general",
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [chatMode, setChatMode] = useState<"general" | "document">(documentContext ? "document" : "general")
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]")
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputValue,
      timestamp: new Date(),
      context: chatMode,
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsLoading(true)

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: generateAIResponse(inputValue, chatMode, documentContext),
        timestamp: new Date(),
        context: chatMode,
      }
      setMessages((prev) => [...prev, aiResponse])
      setIsLoading(false)
    }, 1500)
  }

  const generateAIResponse = (question: string, mode: string, hasDocument: boolean): string => {
    const lowerQuestion = question.toLowerCase()

    if (mode === "document" && hasDocument) {
      if (lowerQuestion.includes("risk") || lowerQuestion.includes("danger")) {
        return "Based on your document analysis, I've identified several key risks: 1) The termination clause allows the other party to end the agreement with only 30 days notice, 2) The liability limitation may not protect you in cases of gross negligence, and 3) The intellectual property clause could transfer more rights than intended. Would you like me to explain any of these in more detail?"
      }
      if (lowerQuestion.includes("clause") || lowerQuestion.includes("section")) {
        return "I can help explain any specific clause in your document. The contract contains 12 main sections including payment terms, termination conditions, and liability limitations. Which clause would you like me to break down in simple terms?"
      }
      if (lowerQuestion.includes("payment") || lowerQuestion.includes("money")) {
        return "The payment terms in your document specify: Payment is due within 30 days of invoice, late fees of 1.5% per month apply, and there's a right to suspend services for non-payment. The total contract value appears to be $50,000 over 12 months."
      }
      return "I've analyzed your document and can help explain any specific clauses, identify risks, or clarify legal language. What particular aspect would you like me to focus on?"
    }

    // General legal advice responses
    if (lowerQuestion.includes("contract") || lowerQuestion.includes("agreement")) {
      return "When reviewing any contract, focus on these key areas: 1) Payment terms and schedules, 2) Termination and cancellation clauses, 3) Liability and indemnification provisions, 4) Intellectual property rights, and 5) Dispute resolution mechanisms. Always ensure you understand your obligations and rights before signing."
    }
    if (lowerQuestion.includes("liability") || lowerQuestion.includes("responsible")) {
      return "Liability clauses determine who is responsible for damages or losses. Look for: limitation of liability caps, exclusions for certain types of damages (like consequential damages), and indemnification requirements. These clauses can significantly impact your financial exposure."
    }
    if (lowerQuestion.includes("termination") || lowerQuestion.includes("cancel")) {
      return "Termination clauses specify how and when a contract can be ended. Key elements include: notice periods required, grounds for termination (with or without cause), what happens to payments and deliverables upon termination, and any post-termination obligations."
    }
    if (lowerQuestion.includes("intellectual property") || lowerQuestion.includes("ip")) {
      return "Intellectual property clauses determine ownership of created work, ideas, and innovations. Important considerations: who owns work created during the contract, licensing rights, confidentiality obligations, and protection of existing IP. Be careful not to inadvertently transfer valuable IP rights."
    }

    return "I'm here to help with legal questions! I can assist with contract analysis, explain legal terms, identify potential risks, and provide general legal guidance. Feel free to ask about specific clauses, legal concepts, or upload a document for detailed analysis."
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto h-[600px] flex flex-col">
      {/* Chat Mode Toggle */}
      {!documentContext && (
        <div className="p-4 border-b border-border">
          <div className="flex gap-2">
            <Button
              variant={chatMode === "general" ? "default" : "outline"}
              size="sm"
              onClick={() => setChatMode("general")}
              className="flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              General Legal Advice
            </Button>
            <Button
              variant={chatMode === "document" ? "default" : "outline"}
              size="sm"
              onClick={() => setChatMode("document")}
              className="flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Document Analysis
            </Button>
          </div>
        </div>
      )}

      {/* Chat Messages */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex gap-3 ${message.type === "user" ? "justify-end" : "justify-start"}`}>
              {message.type === "ai" && (
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-primary-foreground" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.type === "user"
                    ? "bg-primary text-primary-foreground ml-auto"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <p className="text-sm leading-relaxed">{message.content}</p>
                <span className="text-xs opacity-70 mt-1 block">
                  {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
              {message.type === "user" && (
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-muted-foreground" />
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-primary-foreground" />
              </div>
              <div className="bg-muted text-muted-foreground rounded-lg p-3">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Chat Input */}
      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              chatMode === "document"
                ? "Ask about clauses, risks, or legal implications..."
                : "Ask any legal question..."
            }
            className="flex-1"
            disabled={isLoading}
          />
          <Button onClick={handleSendMessage} disabled={!inputValue.trim() || isLoading} size="icon">
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          This AI assistant provides general information only and is not a substitute for professional legal advice.
        </p>
      </div>
    </Card>
  )
}
