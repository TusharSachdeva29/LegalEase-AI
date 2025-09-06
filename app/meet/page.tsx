"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  VideoIcon,
  Users,
  Link as LinkIcon,
  Copy,
  Share2,
  Check,
  Calendar,
  Loader2,
} from "lucide-react";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import firebaseApp from "@/lib/firebase";
import { extractMeetCode, generateJoinUrl } from "@/lib/meet-utils";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import TranscriptAnalyzerCombined from "@/components/transcript-analyzer-combined";

export default function MeetPage() {
  const [user, setUser] = useState<User | null>(null);
  const [meetingId, setMeetingId] = useState<string>("");
  const [meetingLink, setMeetingLink] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  const router = useRouter();

  useEffect(() => {
    const auth = getAuth(firebaseApp);
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    // Check if we have Google access token
    const checkGoogleAuth = async () => {
      try {
        const response = await fetch("/api/meet/auth/check", {
          method: "GET",
          credentials: "include",
        });
        const data = await response.json();
        setIsAuthenticated(data.authenticated);
      } catch (error) {
        console.error("Error checking authentication:", error);
        setIsAuthenticated(false);
      }
    };

    checkGoogleAuth();

    return () => unsubscribe();
  }, []);

  // If no meeting ID and we have a link, extract the code
  useEffect(() => {
    if (!meetingId && meetingLink) {
      const code = extractMeetCode(meetingLink);
      if (code) {
        setMeetingId(code);
      }
    }
  }, [meetingLink, meetingId]);

  const copyToClipboard = () => {
    const urlToCopy = meetingLink || generateJoinUrl(meetingId);
    navigator.clipboard.writeText(urlToCopy);
    setCopied(true);
    toast({
      title: "Copied!",
      description: "Meeting link copied to clipboard",
      duration: 2000,
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const authenticateWithGoogle = async () => {
    try {
      const response = await fetch("/api/meet/auth", { method: "GET" });
      const data = await response.json();
      if (data.authUrl) {
        window.location.href = data.authUrl;
      }
    } catch (error) {
      console.error("Error authenticating with Google:", error);
      toast({
        title: "Authentication Error",
        description: "Failed to authenticate with Google",
        variant: "destructive",
      });
    }
  };

  const startNewMeeting = async () => {
    if (!isAuthenticated) {
      authenticateWithGoogle();
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/meet/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          summary: "LegalEase Consultation",
          description: "Legal document review and consultation meeting",
        }),
      });

      const data = await response.json();

      if (response.ok && data.meetingLink) {
        setMeetingLink(data.meetingLink);
        toast({
          title: "Meeting Created",
          description: "Your Google Meet has been created",
        });
        // Automatically open the meeting in a new tab
        window.open(data.meetingLink, "_blank");
      } else if (data.requiresAuth) {
        // Need to re-authenticate
        authenticateWithGoogle();
      } else {
        throw new Error(data.error || "Failed to create meeting");
      }
    } catch (error) {
      console.error("Error creating meeting:", error);
      toast({
        title: "Error",
        description: "Failed to create Google Meet meeting",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const joinMeeting = () => {
    if (!meetingId) {
      toast({
        title: "Missing Meeting ID",
        description: "Please enter a valid meeting ID",
        variant: "destructive",
      });
      return;
    }

    const meetUrl = meetingLink || `https://meet.google.com/${meetingId}`;
    window.open(meetUrl, "_blank");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-10">
          <div className="ml-35 max-w-7xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-center mb-2">
              LegalEase Virtual Meetings
            </h1>
            <p className="text-muted-foreground text-center mb-10">
              Secure video meetings for legal consultations and document reviews
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border border-green-200 shadow-sm">
                <CardHeader className="bg-green-50">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-4">
                    <VideoIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <CardTitle className="text-xl">Start New Meeting</CardTitle>
                  <CardDescription>
                    Create a new secure meeting and invite participants
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={startNewMeeting}
                          className="w-full bg-gradient-to-r from-green-500 to-green-700 hover:opacity-90 text-white"
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Creating...
                            </>
                          ) : (
                            <>
                              <Calendar className="mr-2 h-4 w-4" />
                              Start Google Meet
                            </>
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Create a new Google Meet session</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  {!isAuthenticated && (
                    <p className="text-xs mt-2 text-muted-foreground">
                      You'll need to authorize with Google first
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card className="border border-green-200 shadow-sm">
                <CardHeader className="bg-green-50">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-4">
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                  <CardTitle className="text-xl">Join Meeting</CardTitle>
                  <CardDescription>
                    Enter a meeting code to join an existing session
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="flex space-x-2">
                    <Input
                      value={meetingId}
                      onChange={(e) => setMeetingId(e.target.value)}
                      placeholder="Enter meeting ID"
                      className="border-green-200 focus:border-green-500"
                    />
                    <Button
                      onClick={joinMeeting}
                      className="whitespace-nowrap bg-green-600 hover:bg-green-700 text-white"
                    >
                      Join
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="mt-8 border border-green-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl">Share Meeting Link</CardTitle>
                <CardDescription>
                  Send this link to invite others to your meeting
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 border border-green-200 rounded-md px-3 py-2 bg-green-50 text-sm overflow-hidden overflow-ellipsis whitespace-nowrap">
                    {meetingLink ||
                      (meetingId
                        ? `https://meet.google.com/${meetingId}`
                        : "Create or join a meeting first")}
                  </div>
                  <Button
                    onClick={copyToClipboard}
                    variant="outline"
                    size="icon"
                    className="border-green-200"
                    disabled={!meetingLink && !meetingId}
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          className="border-green-200"
                          disabled={!meetingLink && !meetingId}
                          onClick={() => {
                            if (navigator.share && (meetingLink || meetingId)) {
                              navigator.share({
                                title: "Join my LegalEase meeting",
                                text: "Click to join my legal consultation meeting",
                                url:
                                  meetingLink ||
                                  `https://meet.google.com/${meetingId}`,
                              });
                            }
                          }}
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Share meeting link</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </CardContent>
              <CardFooter className="text-xs text-muted-foreground">
                Your meeting is secured with end-to-end encryption
              </CardFooter>
            </Card>

            {/* Combined Transcript & Analysis */}
            <div className="mt-8">
              <h2 className="text-2xl font-bold mb-4">
                Meet Transcription & Analysis
              </h2>
              <p className="text-muted-foreground mb-6">
                Install the LegalEase Meet Assistant Chrome extension to
                automatically capture and analyze your Google Meet conversations.
              </p>
              <div className="flex flex-col md:flex-row gap-6 max-w-7xl mx-auto">
                <div className="flex-1">
                  <TranscriptAnalyzerCombined />
                </div>
                <div className="md:w-96 w-full mt-6 md:mt-0 p-4 bg-muted rounded-md self-start h-auto">
                  <h3 className="font-semibold mb-2">
                    How to use the Meet Assistant
                  </h3>
                  <ol className="list-decimal pl-5 space-y-2 text-sm text-muted-foreground">
                    <li>
                      Install the LegalEase Chrome extension from the provided ZIP
                      file or Chrome Web Store
                    </li>
                    <li>Start or join a Google Meet call</li>
                    <li>
                      Click the LegalEase icon in your browser to activate the
                      extension
                    </li>
                    <li>Allow microphone access when prompted</li>
                    <li>Start recording to see the transcript in real-time</li>
                    <li>
                      Use the "Analyze with Gemini" button to get AI-powered legal
                      insights
                    </li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
