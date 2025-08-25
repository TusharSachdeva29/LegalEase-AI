"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Send,
  Bot,
  User,
  FileText,
  MessageCircle,
  Loader2,
} from "lucide-react";

interface Message {
  id: string;
  type: "user" | "ai";
  content: string;
  timestamp: Date;
  context?: "document" | "general";
}

interface ChatInterfaceProps {
  documentContext?: boolean;
  documentName?: string;
}

export function ChatInterface({
  documentContext = false,
  documentName,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "ai",
      content: documentContext
        ? `Hello! I'm here to help you understand your document${
            documentName ? ` "${documentName}"` : ""
          }. Ask me anything about the clauses, risks, or legal implications.`
        : "Hello! I'm your legal AI assistant. I can help with general legal questions, contract advice, and document analysis. How can I assist you today?",
      timestamp: new Date(),
      context: documentContext ? "document" : "general",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chatMode, setChatMode] = useState<"general" | "document">(
    documentContext ? "document" : "general"
  );
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputValue,
      timestamp: new Date(),
      context: chatMode,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: inputValue,
          context: chatMode,
          documentContext: documentContext ? documentName : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get AI response");
      }

      const data = await response.json();

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: data.response,
        timestamp: new Date(),
        context: chatMode,
      };

      setMessages((prev) => [...prev, aiResponse]);
    } catch (error) {
      console.error("Error getting AI response:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: "I'm sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
        context: chatMode,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateAIResponse = (
    question: string,
    mode: string,
    hasDocument: boolean
  ): string => {
    // This function is now deprecated - API calls handle responses
    return "Processing your request...";
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

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
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.type === "user" ? "justify-end" : "justify-start"
              }`}
            >
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
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
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
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Thinking...</span>
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
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            size="icon"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          This AI assistant provides general information only and is not a
          substitute for professional legal advice.
        </p>
      </div>
    </Card>
  );
}
