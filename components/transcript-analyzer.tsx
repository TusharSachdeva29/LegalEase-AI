"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Brain, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { io, Socket } from "socket.io-client";

interface TranscriptData {
  meetingId: string;
  text: string;
  timestamp: number;
}

export default function TranscriptAnalyzer() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [transcript, setTranscript] = useState<string>("");
  const [analysis, setAnalysis] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [meetingId, setMeetingId] = useState<string>("");
  const [lastAnalyzed, setLastAnalyzed] = useState<Date | null>(null);
  const { toast } = useToast();

  // Initialize socket connection to listen for transcripts
  useEffect(() => {
    const initSocket = async () => {
      await fetch('/api/websocket');
      const socketIo = io({
        path: '/api/websocket',
      });

      socketIo.on('transcript-update', (data: TranscriptData) => {
        setTranscript(data.text);
        setMeetingId(data.meetingId);
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
      const response = await fetch('/api/analyze-transcript', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
      
      toast({
        title: "Analysis complete",
        description: "Legal insights are ready to view",
      });
    } catch (error) {
      console.error('Failed to analyze transcript:', error);
      toast({
        title: "Analysis failed",
        description: "Could not analyze the transcript",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Get the last 200 words from the transcript
  const getLast200Words = (): string => {
    if (!transcript) return "";
    
    const words = transcript.split(/\s+/);
    if (words.length > 200) {
      return words.slice(-200).join(' ');
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

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Legal Analysis</CardTitle>
        <CardDescription>
          Analyze meeting transcripts to get legal insights powered by AI
          {lastAnalyzed && ` (Last analyzed: ${lastAnalyzed.toLocaleTimeString()})`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="transcript">
          <TabsList className="mb-4">
            <TabsTrigger value="transcript">Transcript</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
          </TabsList>
          
          <TabsContent value="transcript">
            <div className="relative">
              <Textarea 
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                className="min-h-[200px] font-mono text-sm"
                placeholder="Transcript will appear here automatically from the Chrome extension or paste your own transcript"
              />
              <Button
                size="icon"
                variant="ghost"
                className="absolute top-2 right-2"
                onClick={() => copyToClipboard(transcript)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="mt-4 flex justify-between items-center">
              <p className="text-xs text-muted-foreground">
                {transcript ? `${transcript.split(/\s+/).length} words total` : 'No transcript available'}
              </p>
              <Button 
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
                    Analyze with Gemini
                  </>
                )}
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="analysis">
            <div className="relative">
              <div className="min-h-[200px] rounded-md border p-4 overflow-y-auto">
                {isAnalyzing ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">Generating legal analysis...</p>
                  </div>
                ) : analysis ? (
                  <div className="prose prose-sm max-w-none">
                    {analysis.split('\n').map((paragraph, i) => (
                      <p key={i}>{paragraph}</p>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Brain className="h-12 w-12 text-muted-foreground/20 mb-2" />
                    <p className="text-muted-foreground">Click "Analyze with Gemini" to generate legal insights</p>
                  </div>
                )}
              </div>
              {analysis && (
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute top-2 right-2"
                  onClick={() => copyToClipboard(analysis)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground border-t pt-4">
        Analysis uses the last 200 words of conversation for more relevant and contextual legal insights
      </CardFooter>
    </Card>
  );
}
