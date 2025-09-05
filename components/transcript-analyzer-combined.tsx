"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Copy,
  Brain,
  Loader2,
  Save,
  FileText,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { io, Socket } from "socket.io-client";
import { Badge } from "@/components/ui/badge";

interface TranscriptData {
  meetingId: string;
  text: string;
  timestamp: number;
}

export default function TranscriptAnalyzerCombined() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [transcript, setTranscript] = useState<string>("");
  const [analysis, setAnalysis] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [meetingId, setMeetingId] = useState<string>("");
  const [lastUpdate, setLastUpdate] = useState<string>("");
  const [lastAnalyzed, setLastAnalyzed] = useState<Date | null>(null);
  const [activeView, setActiveView] = useState<"transcript" | "analysis">(
    "transcript"
  );
  const [transcriptLength, setTranscriptLength] = useState<number>(0);
  const [isIdle, setIsIdle] = useState<boolean>(false);
  const [idleTimer, setIdleTimer] = useState<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  // Function to fetch the latest transcript
  const fetchLatestTranscript = async () => {
    try {
      const response = await fetch("/api/latest-transcript");
      if (response.ok) {
        const data = await response.json();
        if (data.text && data.text !== transcript) {
          const previousLength = transcriptLength;
          setTranscript(data.text);
          setTranscriptLength(data.text.split(/\s+/).length);
          setMeetingId(data.meetingId);
          setLastUpdate(new Date().toLocaleTimeString());

          // Reset idle timer when new transcript comes in
          resetIdleTimer();

          // If this is significant new content, automatically analyze
          const newWords = data.text.split(/\s+/).length - previousLength;
          if (newWords > 20 && !isAnalyzing) {
            setTimeout(() => analyzeTranscript(), 1000); // Auto-analyze after 1 second
          }
        }
      }
    } catch (error) {
      console.error("Error fetching latest transcript:", error);
    }
  };

  // Reset idle timer
  const resetIdleTimer = () => {
    if (idleTimer) {
      clearTimeout(idleTimer);
    }
    setIsIdle(false);

    // Set new timer for 30 seconds of inactivity
    const newTimer = setTimeout(() => {
      setIsIdle(true);
      // Auto-save when meeting appears to be over
      if (transcript && transcript.length > 100) {
        saveTranscriptToHistory();
      }
    }, 30000); // 30 seconds

    setIdleTimer(newTimer);
  };

  // Poll for latest transcript
  useEffect(() => {
    fetchLatestTranscript();
    const intervalId = setInterval(fetchLatestTranscript, 2000);
    return () => {
      clearInterval(intervalId);
      if (idleTimer) clearTimeout(idleTimer);
    };
  }, [transcript, transcriptLength]);

  // Initialize socket connection
  useEffect(() => {
    const initSocket = async () => {
      await fetch("/api/websocket");
      const socketIo = io({
        path: "/api/websocket",
      });

      socketIo.on("connect", () => {
        console.log("Socket connected with ID:", socketIo.id);
        setIsConnected(true);
      });

      socketIo.on("disconnect", () => {
        console.log("Socket disconnected");
        setIsConnected(false);
      });

      socketIo.on("transcript-update", (data: TranscriptData) => {
        console.log("Transcript update received", data);
        setTranscript(data.text);
        setMeetingId(data.meetingId);
        setLastUpdate(new Date().toLocaleTimeString());
        resetIdleTimer();
      });

      setSocket(socketIo);

      return () => {
        socketIo.disconnect();
      };
    };

    initSocket();
  }, []);

  // Function to analyze transcript with Gemini
  const analyzeTranscript = async () => {
    if (!transcript) {
      toast({
        title: "No transcript available",
        description: "Wait for transcript data or paste your own",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      const response = await fetch("/api/analyze-transcript", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transcript: getLast200Words(),
          meetingId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      setAnalysis(data.analysis);
      setLastAnalyzed(new Date());

      // Auto-switch to analysis view when complete
      setActiveView("analysis");

      toast({
        title: "Analysis complete",
        description: "Legal insights are ready to view",
      });
    } catch (error) {
      console.error("Failed to analyze transcript:", error);
      toast({
        title: "Analysis failed",
        description: "Could not analyze the transcript",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Save transcript to document history
  const saveTranscriptToHistory = async () => {
    if (!transcript || transcript.length < 50) {
      toast({
        title: "Transcript too short",
        description: "Need more content to save to history",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      // Get current user (you might need to import authentication)
      const auth = await import("firebase/auth");
      const firebaseApp = await import("@/lib/firebase");
      const user = auth.getAuth(firebaseApp.default).currentUser;

      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to save transcripts",
          variant: "destructive",
        });
        setIsSaving(false);
        return;
      }

      // Create a document title based on meeting ID and timestamp
      const timestamp = new Date().toISOString().split("T")[0];
      const title = `Meeting Transcript - ${
        meetingId || "Unknown"
      } - ${timestamp}`;

      // Calculate estimated duration
      const estimatedDuration = `${Math.round(transcriptLength / 150)} minutes`;

      // Prepare the transcript content
      const transcriptContent = `Meeting Transcript
Title: ${title}
Meeting ID: ${meetingId || "Unknown"}
Date: ${new Date().toLocaleString()}
Duration: ${estimatedDuration} (estimated)
Word Count: ${transcriptLength} words

TRANSCRIPT:
${transcript}`;

      // Save using the analyze endpoint with user ID
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          documentText: transcriptContent,
          saveToHistory: true,
          title: title,
          type: "transcript",
          userId: user.uid,
          transcriptDuration: estimatedDuration,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const result = await response.json();

      toast({
        title: "Transcript saved",
        description: "Meeting transcript has been saved to your chat history",
      });

      // Clear idle state since we've saved
      setIsIdle(false);

      console.log("Transcript saved with chat ID:", result.chatId);
    } catch (error) {
      console.error("Failed to save transcript:", error);
      toast({
        title: "Save failed",
        description: "Could not save transcript to history",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Get the last 200 words from the transcript
  const getLast200Words = (): string => {
    if (!transcript) return "";

    const words = transcript.split(/\s+/);
    if (words.length > 200) {
      return words.slice(-200).join(" ");
    }
    return transcript;
  };

  // Get recent transcript for display (last 200 words)
  const getRecentTranscript = (): string => {
    if (!transcript) return "";

    const words = transcript.split(/\s+/);
    if (words.length > 200) {
      return words.slice(-200).join(" ");
    }
    return transcript;
  };

  // Copy text to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "Text has been copied to your clipboard",
    });
  };

  // Toggle between views
  const toggleView = () => {
    setActiveView(activeView === "transcript" ? "analysis" : "transcript");
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <span>Live Transcript & Analysis</span>
              <div className="flex items-center">
                <div
                  className={`w-3 h-3 rounded-full mr-2 ${
                    isConnected ? "bg-green-500" : "bg-gray-400"
                  }`}
                />
                <span className="text-sm font-normal">
                  {isConnected ? "Connected" : "Disconnected"}
                </span>
              </div>
            </CardTitle>
            <CardDescription>
              {meetingId
                ? `Meeting: ${meetingId}`
                : "Waiting for transcript..."}
              {lastUpdate && ` • Last update: ${lastUpdate}`}
              {isIdle && (
                <Badge variant="secondary" className="ml-2">
                  Meeting appears idle - Auto-save available
                </Badge>
              )}
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleView}
              className="flex items-center gap-2"
            >
              {activeView === "transcript" ? (
                <>
                  <Brain className="h-4 w-4" />
                  Analysis
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4" />
                  Transcript
                </>
              )}
            </Button>

            {(isIdle || transcript.length > 100) && (
              <Button
                size="sm"
                onClick={saveTranscriptToHistory}
                disabled={isSaving}
                className="flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save to History
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {activeView === "transcript" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-4">
                <p className="text-sm text-muted-foreground">
                  {transcript
                    ? `${transcriptLength} words total`
                    : "No transcript available"}
                </p>
                {transcript && (
                  <Badge variant="outline">
                    ~{Math.round(transcriptLength / 150)} min duration
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(transcript)}
                  disabled={!transcript}
                >
                  <Copy className="h-4 w-4 mr-1" />
                  Copy
                </Button>

                <Button
                  size="sm"
                  onClick={analyzeTranscript}
                  disabled={!transcript || isAnalyzing}
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Brain className="mr-2 h-4 w-4" />
                      Analyze
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="h-[400px] overflow-y-auto border rounded-md p-4 bg-muted/30">
              {transcript ? (
                <div className="space-y-2">
                  <p className="text-sm font-mono whitespace-pre-wrap">
                    {getRecentTranscript()}
                  </p>
                  {transcriptLength > 200 && (
                    <div className="text-xs text-muted-foreground text-center py-2 border-t">
                      Showing last 200 words • {transcriptLength - 200} more
                      words in full transcript
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <div className="text-center">
                    <FileText className="h-12 w-12 mx-auto mb-2 opacity-20" />
                    <p>Waiting for transcript from Google Meet...</p>
                    <p className="text-xs mt-1">
                      Install the Chrome extension and start recording
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeView === "analysis" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-4">
                <p className="text-sm text-muted-foreground">
                  Legal Analysis
                  {lastAnalyzed &&
                    ` • Generated: ${lastAnalyzed.toLocaleTimeString()}`}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {analysis && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(analysis)}
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    Copy
                  </Button>
                )}

                <Button
                  size="sm"
                  onClick={analyzeTranscript}
                  disabled={!transcript || isAnalyzing}
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Re-analyzing...
                    </>
                  ) : (
                    <>
                      <Brain className="mr-2 h-4 w-4" />
                      Re-analyze
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="h-[400px] overflow-y-auto border rounded-md p-4 bg-muted/30">
              {isAnalyzing ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">
                    Generating legal analysis...
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Analyzing last 200 words for context
                  </p>
                </div>
              ) : analysis ? (
                <div className="prose prose-sm max-w-none">
                  {analysis.split("\n").map((paragraph, i) => (
                    <p key={i} className="mb-3">
                      {paragraph}
                    </p>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <Brain className="h-12 w-12 text-muted-foreground/20 mb-2" />
                  <p className="text-muted-foreground">
                    Click "Analyze" to generate legal insights
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    AI-powered analysis of your meeting transcript
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="text-xs text-muted-foreground border-t pt-4 flex justify-between">
        <span>
          Analysis uses the last 200 words for contextual legal insights
        </span>
        <span>
          {isIdle ? "Meeting idle • Ready to save" : "Meeting active"}
        </span>
      </CardFooter>
    </Card>
  );
}
