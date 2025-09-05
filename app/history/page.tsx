"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import firebaseApp from "@/lib/firebase";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MessageCircle,
  FileText,
  Mic,
  Search,
  Calendar,
  Clock,
  ChevronRight,
  MoreVertical,
  ArrowRight,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

interface ChatHistory {
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

export default function HistoryPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
  const [selectedChat, setSelectedChat] = useState<ChatHistory | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<
    "all" | "document" | "transcript" | "advice"
  >("all");
  const router = useRouter();

  useEffect(() => {
    const auth = getAuth(firebaseApp);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        loadChatHistory(user.uid);
      } else {
        router.push("/signin");
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const loadChatHistory = async (uid: string) => {
    try {
      const response = await fetch(`/api/chat-history?userId=${uid}`);
      if (response.ok) {
        const data = await response.json();
        setChatHistory(data.chats || []);
      } else {
        // Fallback to localStorage for now
        const localHistory = localStorage.getItem(`chatHistory_${uid}`);
        if (localHistory) {
          setChatHistory(JSON.parse(localHistory));
        }
      }
    } catch (error) {
      console.error("Failed to load chat history:", error);
      // Fallback to localStorage
      const localHistory = localStorage.getItem(`chatHistory_${user?.uid}`);
      if (localHistory) {
        setChatHistory(JSON.parse(localHistory));
      }
    }
  };

  const continueChat = async (chat: ChatHistory) => {
    // Store the selected chat context in sessionStorage for the chat page
    sessionStorage.setItem("continueChat", JSON.stringify(chat));
    router.push("/chat");
  };

  const deleteChat = async (chatId: string) => {
    if (!user) return;

    try {
      const response = await fetch(`/api/chat-history/${chatId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setChatHistory((prev) => prev.filter((chat) => chat.id !== chatId));
        if (selectedChat?.id === chatId) {
          setSelectedChat(null);
        }
      }
    } catch (error) {
      console.error("Failed to delete chat:", error);
    }
  };

  const filteredChats = chatHistory.filter((chat) => {
    const matchesSearch =
      chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === "all" || chat.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "document":
        return <FileText className="h-4 w-4" />;
      case "transcript":
        return <Mic className="h-4 w-4" />;
      case "advice":
        return <MessageCircle className="h-4 w-4" />;
      default:
        return <MessageCircle className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "document":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "transcript":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "advice":
        return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading your chat history...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
      <Navbar />
      <main className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
                  Chat History
                </h1>
                <p className="text-muted-foreground mt-2">
                  Access all your previous conversations and continue where you
                  left off
                </p>
              </div>
              <Badge variant="secondary" className="text-sm">
                {filteredChats.length} chat
                {filteredChats.length !== 1 ? "s" : ""}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Sidebar - Chat List */}
            <div className="lg:col-span-1 space-y-4">
              {/* Search and Filter */}
              <Card>
                <CardContent className="p-4 space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search chats..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <Tabs
                    value={filterType}
                    onValueChange={(value) => setFilterType(value as any)}
                  >
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="all" className="text-xs">
                        All
                      </TabsTrigger>
                      <TabsTrigger value="document" className="text-xs">
                        Docs
                      </TabsTrigger>
                      <TabsTrigger value="transcript" className="text-xs">
                        Calls
                      </TabsTrigger>
                      <TabsTrigger value="advice" className="text-xs">
                        Advice
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </CardContent>
              </Card>

              {/* Chat List */}
              <div className="space-y-3 max-h-[calc(100vh-400px)] overflow-y-auto">
                {filteredChats.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        {searchQuery || filterType !== "all"
                          ? "No chats found"
                          : "No chat history yet"}
                      </p>
                      {!searchQuery && filterType === "all" && (
                        <Link href="/chat">
                          <Button className="mt-4" size="sm">
                            Start Your First Chat
                          </Button>
                        </Link>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  filteredChats.map((chat) => (
                    <Card
                      key={chat.id}
                      className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                        selectedChat?.id === chat.id
                          ? "ring-2 ring-primary border-primary"
                          : ""
                      }`}
                      onClick={() => setSelectedChat(chat)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <div
                              className={`p-1.5 rounded-md border ${getTypeColor(
                                chat.type
                              )}`}
                            >
                              {getTypeIcon(chat.type)}
                            </div>
                            <Badge
                              variant="outline"
                              className={`text-xs ${getTypeColor(chat.type)}`}
                            >
                              {chat.type}
                            </Badge>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                              >
                                <MoreVertical className="h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => continueChat(chat)}
                              >
                                Continue Chat
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => deleteChat(chat.id)}
                                className="text-destructive"
                              >
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        <h3 className="font-semibold text-sm mb-1 line-clamp-1">
                          {chat.title}
                        </h3>

                        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                          {chat.lastMessage}
                        </p>

                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>
                              {new Date(chat.timestamp).toLocaleDateString()}
                            </span>
                          </div>
                          <span>{chat.messageCount} messages</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>

            {/* Right Content - Chat Details */}
            <div className="lg:col-span-2">
              {selectedChat ? (
                <Card className="h-fit">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`p-2 rounded-lg border ${getTypeColor(
                            selectedChat.type
                          )}`}
                        >
                          {getTypeIcon(selectedChat.type)}
                        </div>
                        <div>
                          <CardTitle className="text-xl">
                            {selectedChat.title}
                          </CardTitle>
                          <CardDescription className="flex items-center space-x-2 mt-1">
                            <Badge
                              variant="outline"
                              className={getTypeColor(selectedChat.type)}
                            >
                              {selectedChat.type}
                            </Badge>
                            <span>•</span>
                            <span>
                              {new Date(
                                selectedChat.timestamp
                              ).toLocaleString()}
                            </span>
                          </CardDescription>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    {/* Chat Preview */}
                    <div>
                      <h4 className="font-semibold mb-3">Preview</h4>
                      <div className="bg-muted/50 rounded-lg p-4">
                        <p className="text-sm text-muted-foreground">
                          {selectedChat.preview}
                        </p>
                      </div>
                    </div>

                    {/* Metadata */}
                    {selectedChat.metadata && (
                      <div>
                        <h4 className="font-semibold mb-3">Details</h4>
                        <div className="space-y-2">
                          {selectedChat.metadata.documentName && (
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">
                                Document:
                              </span>
                              <span>{selectedChat.metadata.documentName}</span>
                            </div>
                          )}
                          {selectedChat.metadata.transcriptDuration && (
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">
                                Duration:
                              </span>
                              <span>
                                {selectedChat.metadata.transcriptDuration}
                              </span>
                            </div>
                          )}
                          {selectedChat.metadata.analysisType && (
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">
                                Analysis Type:
                              </span>
                              <span>{selectedChat.metadata.analysisType}</span>
                            </div>
                          )}
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              Messages:
                            </span>
                            <span>{selectedChat.messageCount}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              Last Updated:
                            </span>
                            <span>
                              {new Date(
                                selectedChat.timestamp
                              ).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Last Message */}
                    <div>
                      <h4 className="font-semibold mb-3">Last Message</h4>
                      <div className="bg-primary/5 border border-primary/10 rounded-lg p-4">
                        <p className="text-sm">{selectedChat.lastMessage}</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-3 pt-4">
                      <Button
                        onClick={() => continueChat(selectedChat)}
                        className="flex-1"
                      >
                        Continue Analyzing
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => deleteChat(selectedChat.id)}
                      >
                        Delete Chat
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="h-fit">
                  <CardContent className="p-12 text-center">
                    <MessageCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      Select a Chat
                    </h3>
                    <p className="text-muted-foreground">
                      Choose a chat from the list to view details and continue
                      the conversation
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
