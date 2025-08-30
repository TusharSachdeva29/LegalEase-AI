"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { VideoIcon, Users, Link as LinkIcon, Copy, Share2, Check } from "lucide-react";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import firebaseApp from "@/lib/firebase";

export default function MeetPage() {
  const [user, setUser] = useState<User | null>(null);
  const [meetingId, setMeetingId] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    const auth = getAuth(firebaseApp);
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Generate a random meeting ID if none exists
  useEffect(() => {
    if (!meetingId) {
      const randomId = Math.random().toString(36).substring(2, 12);
      setMeetingId(randomId);
    }
  }, [meetingId]);

  const copyToClipboard = () => {
    const meetUrl = `${window.location.origin}/meet/${meetingId}`;
    navigator.clipboard.writeText(meetUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const startNewMeeting = () => {
    const newId = Math.random().toString(36).substring(2, 12);
    setMeetingId(newId);
  };

  const joinMeeting = () => {
    // In a real implementation, this would navigate to the meeting room
    // For now, we'll just redirect to the current meeting ID
    window.location.href = `/meet/${meetingId}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-10">
        <div className="max-w-4xl mx-auto">
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
                <Button
                  onClick={startNewMeeting}
                  className="w-full bg-gradient-to-r from-green-500 to-green-700 hover:opacity-90 text-white"
                >
                  Start New Meeting
                </Button>
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
                  <Button onClick={joinMeeting} className="whitespace-nowrap bg-green-600 hover:bg-green-700 text-white">
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
                  {`${window.location.origin}/meet/${meetingId}`}
                </div>
                <Button onClick={copyToClipboard} variant="outline" size="icon" className="border-green-200">
                  {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                </Button>
                <Button variant="outline" size="icon" className="border-green-200">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
            <CardFooter className="text-xs text-muted-foreground">
              Your meeting is secured with end-to-end encryption
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
