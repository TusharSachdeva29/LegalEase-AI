"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useVoiceRecording } from "@/hooks/use-voice-recording";
import { useTextToSpeech } from "@/hooks/use-text-to-speech";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageCheckboxSelector } from "@/components/language-checkbox-selector";
import { getSpeechLanguageCode, getVoiceLanguageCode } from "@/lib/languages";
import {
  getAuth,
  onAuthStateChanged,
  User as FirebaseUser,
} from "firebase/auth";
import firebaseApp from "@/lib/firebase";
import {
  Send,
  Bot,
  User,
  FileText,
  MessageCircle,
  Loader2,
  History,
  Save,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Trash2,
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

interface ContinueChatData {
  id: string;
  title: string;
  type: "document" | "transcript" | "advice";
  preview: string;
  timestamp: string;
  messageCount: number;
  lastMessage: string;
  metadata?: {
    documentName?: string;
    transcriptDuration?: string;
    analysisType?: string;
  };
}

export function ChatInterface({
  documentContext = false,
  documentName,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chatMode, setChatMode] = useState<"general" | "document">(
    documentContext ? "document" : "general"
  );
  const [documentText, setDocumentText] = useState<string>("");
  const [hasDocumentText, setHasDocumentText] = useState<boolean>(false);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [isContinuingChat, setIsContinuingChat] = useState(false);
  const [chatTitle, setChatTitle] = useState<string>("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [chatHistory, setChatHistory] = useState<Array<{
    id: string;
    title: string;
    messages: Message[];
    timestamp: Date;
    type: "document" | "general";
  }>>([]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { selectedLanguage } = useLanguage();

  // Get language-specific codes for APIs
  const speechLanguageCode = getSpeechLanguageCode(selectedLanguage.code);
  const voiceLanguageCode = getVoiceLanguageCode(selectedLanguage.code);

  // Voice functionality hooks
  const { isRecording, isProcessing, startRecording, stopRecording } =
    useVoiceRecording({
      languageCode: speechLanguageCode,
      onTranscription: (text) => {
        setInputValue(text);
        toast({
          title: "Voice input received",
          description: "Speech converted to text successfully",
        });
      },
      onError: (error) => {
        toast({
          title: "Voice input error",
          description: error,
          variant: "destructive",
        });
      },
    });

  const {
    speak,
    stopSpeaking,
    isSpeaking,
    isLoading: isSpeechLoading,
  } = useTextToSpeech({
    voice: voiceLanguageCode,
    languageCode: speechLanguageCode,
    onError: (error) => {
      toast({
        title: "Speech output error",
        description: error,
        variant: "destructive",
      });
    },
  });

  // Authentication
  useEffect(() => {
    const auth = getAuth(firebaseApp);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Local storage functions for chat history
  const saveChatToLocalStorage = (chatData: {
    id: string;
    title: string;
    messages: Message[];
    timestamp: Date;
    type: "document" | "general";
  }) => {
    try {
      const existingChats = localStorage.getItem("chatHistory");
      let chats = existingChats ? JSON.parse(existingChats) : [];
      
      // Remove existing chat with same ID if it exists
      chats = chats.filter((chat: any) => chat.id !== chatData.id);
      
      // Add new chat data (serialize dates)
      const serializedChat = {
        ...chatData,
        timestamp: chatData.timestamp.toISOString(),
        messages: chatData.messages.map(msg => ({
          ...msg,
          timestamp: msg.timestamp.toISOString()
        }))
      };
      
      chats.unshift(serializedChat); // Add to beginning
      
      // Keep only last 50 chats
      chats = chats.slice(0, 50);
      
      localStorage.setItem("chatHistory", JSON.stringify(chats));
      loadChatHistoryFromStorage(); // Refresh the state
    } catch (error) {
      console.error("Error saving chat to localStorage:", error);
    }
  };

  const loadChatHistoryFromStorage = () => {
    try {
      const existingChats = localStorage.getItem("chatHistory");
      if (existingChats) {
        const chats = JSON.parse(existingChats);
        // Deserialize dates
        const deserializedChats = chats.map((chat: any) => ({
          ...chat,
          timestamp: new Date(chat.timestamp),
          messages: chat.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        }));
        setChatHistory(deserializedChats);
      }
    } catch (error) {
      console.error("Error loading chat history from localStorage:", error);
    }
  };

  const loadChatFromStorage = (chatId: string) => {
    const storedChats = localStorage.getItem("chatHistory");
    if (storedChats) {
      const chats = JSON.parse(storedChats);
      const chat = chats.find((c: any) => c.id === chatId);
      if (chat) {
        const deserializedMessages = chat.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        setMessages(deserializedMessages);
        setChatTitle(chat.title);
        setCurrentChatId(chat.id);
        setChatMode(chat.type);
        setIsContinuingChat(true);
      }
    }
  };

  const startNewChat = () => {
    setMessages([]);
    setCurrentChatId(null);
    setChatTitle("");
    setIsContinuingChat(false);
    setChatMode(documentContext ? "document" : "general");
    setInputValue("");
    
    // Add initial welcome message
    setTimeout(() => {
      const initialMessage: Message = {
        id: "1",
        type: "ai",
        content: documentContext
          ? hasDocumentText
            ? `Hello! I'm here to help you understand your document${
                documentName ? ` "${documentName}"` : ""
              }. I have access to the full document content and can answer specific questions about clauses, risks, or legal implications.`
            : `Hello! I'm your legal AI assistant. It looks like you don't have a document uploaded yet. Upload a document first to get specific analysis, or ask me general legal questions.`
          : "Hello! I'm your legal AI assistant. I can help with general legal questions, contract advice, and document analysis. How can I assist you today?",
        timestamp: new Date(),
        context: documentContext ? "document" : "general",
      };
      setMessages([initialMessage]);
    }, 100);
  };

  const deleteChatFromStorage = (chatId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent chat selection when deleting
    try {
      const existingChats = localStorage.getItem("chatHistory");
      if (existingChats) {
        let chats = JSON.parse(existingChats);
        chats = chats.filter((chat: any) => chat.id !== chatId);
        localStorage.setItem("chatHistory", JSON.stringify(chats));
        loadChatHistoryFromStorage(); // Refresh the state
        
        // If we deleted the currently active chat, start a new one
        if (currentChatId === chatId) {
          startNewChat();
        }
        
        toast({
          title: "Chat deleted",
          description: "Chat has been removed from history",
        });
      }
    } catch (error) {
      console.error("Error deleting chat:", error);
      toast({
        title: "Error",
        description: "Failed to delete chat",
        variant: "destructive",
      });
    }
  };

  // Load chat history on component mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      loadChatHistoryFromStorage();
    }
  }, []);

  // Check for continuing chat from history
  useEffect(() => {
    if (typeof window !== "undefined") {
      const continueData = sessionStorage.getItem("continueChat");
      if (continueData) {
        try {
          const chatData: ContinueChatData = JSON.parse(continueData);
          setIsContinuingChat(true);
          setChatTitle(chatData.title);
          setCurrentChatId(chatData.id);

          // Set chat mode based on chat type
          if (chatData.type === "document") {
            setChatMode("document");
          } else {
            setChatMode("general");
          }

          // Load full chat history
          loadChatHistory(chatData.id);

          // Clear the session storage
          sessionStorage.removeItem("continueChat");
        } catch (error) {
          console.error("Error parsing continue chat data:", error);
        }
      }
    }
  }, []);

  const loadChatHistory = async (chatId: string) => {
    try {
      const response = await fetch(`/api/chat-history/${chatId}`);
      if (response.ok) {
        const data = await response.json();
        const chat = data.chat;

        // Convert stored messages to component format
        const convertedMessages: Message[] = chat.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
          type: msg.role === "user" ? "user" : "ai",
        }));

        setMessages(convertedMessages);

        // Load document context if available
        if (chat.metadata?.documentName && chat.type === "document") {
          // Try to load document text if available
          const storedText = sessionStorage.getItem("documentText");
          if (storedText) {
            setDocumentText(storedText);
            setHasDocumentText(true);
          }
        }
      }
    } catch (error) {
      console.error("Error loading chat history:", error);
    }
  };

  // Load document text from sessionStorage on component mount
  useEffect(() => {
    if (typeof window !== "undefined" && !isContinuingChat) {
      const storedText = sessionStorage.getItem("documentText");
      if (storedText) {
        setDocumentText(storedText);
        setHasDocumentText(true);
        console.log(
          "Document text loaded for chat:",
          storedText.length,
          "characters"
        );
      } else {
        console.log("No document text found in sessionStorage");
      }
    }
  }, [isContinuingChat]);

  // Initialize messages after component mounts and document text is checked
  useEffect(() => {
    if (messages.length === 0 && !isContinuingChat) {
      const initialMessage: Message = {
        id: "1",
        type: "ai",
        content: documentContext
          ? hasDocumentText
            ? `Hello! I'm here to help you understand your document${
                documentName ? ` "${documentName}"` : ""
              }. I have access to the full document content and can answer specific questions about clauses, risks, or legal implications.`
            : `Hello! I'm your legal AI assistant. It looks like you don't have a document uploaded yet. Upload a document first to get specific analysis, or ask me general legal questions.`
          : "Hello! I'm your legal AI assistant. I can help with general legal questions, contract advice, and document analysis. How can I assist you today?",
        timestamp: new Date(),
        context: documentContext ? "document" : "general",
      };
      setMessages([initialMessage]);
    }
  }, [
    documentContext,
    documentName,
    hasDocumentText,
    messages.length,
    isContinuingChat,
  ]);

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
    // Mark as having unsaved changes when messages are added
    if (messages.length > 1) {
      setHasUnsavedChanges(true);
    }
  }, [messages]);

  const saveChatHistory = async () => {
    if (!user || messages.length <= 1) return;

    try {
      const chatData = {
        userId: user.uid,
        title: chatTitle || generateChatTitle(),
        type: chatMode === "document" ? "document" : "advice",
        preview:
          messages.length > 1
            ? messages[1].content.substring(0, 150) + "..."
            : "",
        messages: messages.map((msg) => ({
          id: msg.id,
          content: msg.content,
          role: msg.type === "user" ? "user" : "assistant",
          timestamp: msg.timestamp.toISOString(),
        })),
        metadata: {
          documentName:
            documentName || (hasDocumentText ? "Uploaded Document" : undefined),
          analysisType: chatMode,
        },
      };

      const endpoint = currentChatId
        ? `/api/chat-history`
        : `/api/chat-history`;

      const method = currentChatId ? "PUT" : "POST";
      const body = currentChatId
        ? {
            chatId: currentChatId,
            userId: user.uid,
            messages: chatData.messages,
            lastMessage: messages[messages.length - 1].content,
          }
        : chatData;

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const result = await response.json();
        if (!currentChatId && result.chatId) {
          setCurrentChatId(result.chatId);
        }
        setHasUnsavedChanges(false);
        console.log("Chat saved successfully");
      }
    } catch (error) {
      console.error("Error saving chat:", error);
    }
  };

  const generateChatTitle = () => {
    if (messages.length > 1) {
      const firstUserMessage = messages.find((m) => m.type === "user");
      if (firstUserMessage) {
        return (
          firstUserMessage.content.substring(0, 50) +
          (firstUserMessage.content.length > 50 ? "..." : "")
        );
      }
    }
    return `${
      chatMode === "document" ? "Document" : "Legal"
    } Chat - ${new Date().toLocaleDateString()}`;
  };

  // Auto-save every 30 seconds if there are unsaved changes
  useEffect(() => {
    if (hasUnsavedChanges && user) {
      const autoSaveInterval = setInterval(() => {
        saveChatHistory();
      }, 30000); // 30 seconds

      return () => clearInterval(autoSaveInterval);
    }
  }, [hasUnsavedChanges, user, messages]);

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
          language: selectedLanguage.code,
          documentContext:
            chatMode === "document" && hasDocumentText
              ? documentText
              : undefined,
          documentName: documentName,
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

      // Save chat to local storage after each exchange
      const updatedMessages = [...messages, userMessage, aiResponse];
      const chatId = currentChatId || Date.now().toString();
      const chatTitle = generateChatTitle();
      
      saveChatToLocalStorage({
        id: chatId,
        title: chatTitle,
        messages: updatedMessages,
        timestamp: new Date(),
        type: chatMode
      });
      
      if (!currentChatId) {
        setCurrentChatId(chatId);
      }

      // Auto-save after each exchange
      if (user) {
        setTimeout(() => saveChatHistory(), 1000);
      }
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

  const handleVoiceInput = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleSpeakMessage = (text: string) => {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      speak(text);
    }
  };

  return (
    <div className="flex w-full max-w-6xl mx-auto h-[600px] gap-4">

            {/* Main Chat Interface */}
    <Card className="flex-1 h-full flex flex-col p-0">
      {/* Chat Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            {isSpeaking && (
              <Badge
                variant="secondary"
                className="flex items-center space-x-1"
              >
                <Volume2 className="w-3 h-3" />
                <span>Speaking</span>
              </Badge>
            )}
            {isContinuingChat && (
              <Badge
                variant="secondary"
                className="flex items-center space-x-1"
              >
                <History className="w-3 h-3" />
                <span>Continuing Chat</span>
              </Badge>
            )}
            {chatTitle && (
              <h3 className="font-semibold text-sm text-muted-foreground">
                {chatTitle}
              </h3>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <LanguageCheckboxSelector compact />
            {hasUnsavedChanges && (
              <Badge variant="outline" className="text-xs">
                Unsaved changes
              </Badge>
            )}
            {user && messages.length > 1 && (
              <Button
                variant="outline"
                size="sm"
                onClick={saveChatHistory}
                className="flex items-center space-x-1"
              >
                <Save className="w-3 h-3" />
                <span>Save</span>
              </Button>
            )}
          </div>
        </div>

        {/* Chat Mode Toggle */}
        {!documentContext && (
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
              disabled={!hasDocumentText}
            >
              <FileText className="w-4 h-4" />
              Document Analysis
              {!hasDocumentText && (
                <span className="text-xs opacity-60">(No document)</span>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Chat Messages */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 px-3 py-2">
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
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm leading-relaxed flex-1">
                    {message.content}
                  </p>
                  {message.type === "ai" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSpeakMessage(message.content)}
                      disabled={isSpeechLoading}
                      className="h-6 w-6 p-0 hover:bg-background/20"
                      title={isSpeaking ? "Stop speaking" : "Read aloud"}
                    >
                      {isSpeaking ? (
                        <VolumeX className="h-3 w-3" />
                      ) : (
                        <Volume2 className="h-3 w-3" />
                      )}
                    </Button>
                  )}
                </div>
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
      <div className="px-4 py-4 border-t border-border">
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              chatMode === "document"
                ? hasDocumentText
                  ? "Ask about clauses, risks, or legal implications in your document..."
                  : "Please upload a document first to ask specific questions..."
                : "Ask any legal question..."
            }
            className="flex-1"
            disabled={isLoading}
          />
          <Button
            variant="outline"
            size="icon"
            onClick={handleVoiceInput}
            disabled={isLoading || isProcessing}
            className={`${
              isRecording
                ? "bg-red-500 hover:bg-red-600 text-white border-red-500"
                : ""
            }`}
            title={isRecording ? "Stop recording" : "Start voice input"}
          >
            {isProcessing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isRecording ? (
              <MicOff className="w-4 h-4" />
            ) : (
              <Mic className="w-4 h-4" />
            )}
          </Button>
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            size="icon"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-muted-foreground">
            This AI assistant provides general information only and is not a
            substitute for professional legal advice.
          </p>
          {(isRecording || isProcessing) && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {isRecording && (
                <>
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span>Recording...</span>
                </>
              )}
              {isProcessing && (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Processing...</span>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
    
      {/* Chat History Sidebar */}
      <div className="w-80 border border-border rounded-lg p-4 overflow-y-auto bg-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg">Chat History</h3>
          <Badge variant="outline" className="text-xs">
            {chatHistory.length} chats
          </Badge>
        </div>
        
        <Button
          onClick={startNewChat}
          variant="outline"
          className="w-full mb-4 flex items-center gap-2"
        >
          <MessageCircle className="w-4 h-4" />
          New Chat
        </Button>
        
        {chatHistory.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No chat history yet. Start a conversation!
          </p>
        ) : (
          <div className="space-y-2">
            {chatHistory.map((chat) => (
              <div
                key={chat.id}
                className={`group p-3 rounded-lg cursor-pointer border transition-colors hover:bg-muted/50 ${
                  currentChatId === chat.id
                    ? "bg-primary/10 border-primary/30"
                    : "border-border"
                }`}
                onClick={() => loadChatFromStorage(chat.id)}
              >
                <div className="flex items-start justify-between mb-1">
                  <h4 className="font-medium text-sm truncate flex-1">
                    {chat.title}
                  </h4>
                  <div className="flex items-center gap-1 ml-2">
                    <Badge variant="outline" className="text-xs">
                      {chat.type}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive"
                      onClick={(e) => deleteChatFromStorage(chat.id, e)}
                      title="Delete chat"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground truncate mb-2">
                  {chat.messages.length > 0 
                    ? chat.messages[chat.messages.length - 1].content.substring(0, 100) + "..."
                    : "No messages"
                  }
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {chat.timestamp.toLocaleDateString()} {chat.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {chat.messages.length} msgs
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
