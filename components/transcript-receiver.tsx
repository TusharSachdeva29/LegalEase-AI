        "use client";

import { useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface TranscriptData {
  meetingId: string;
  text: string;
  timestamp: number;
}

export default function TranscriptReceiver() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [meetingId, setMeetingId] = useState<string>("");
  const [lastUpdate, setLastUpdate] = useState<string>("");

  // Function to fetch the latest transcript
  const fetchLatestTranscript = async () => {
    try {
      console.log('Fetching latest transcript...');
      const response = await fetch('/api/latest-transcript');
      if (response.ok) {
        const data = await response.json();
        if (data.text && data.text !== transcript) {
          console.log('New transcript fetched:', data.text.substring(0, 50) + '...');
          setTranscript(data.text);
          setMeetingId(data.meetingId);
          setLastUpdate(new Date().toLocaleTimeString());
        }
      } else {
        console.error('Failed to fetch transcript:', response.status);
      }
    } catch (error) {
      console.error('Error fetching latest transcript:', error);
    }
  };

  // Poll for latest transcript
  useEffect(() => {
    // Initial fetch
    fetchLatestTranscript();
    
    // Set up polling interval
    const intervalId = setInterval(fetchLatestTranscript, 2000); // Poll every 2 seconds
    
    return () => clearInterval(intervalId); // Clean up
  }, [transcript]); // Re-establish if transcript changes
  
  useEffect(() => {
    // Initialize socket connection (keeping this as a backup)
    const initSocket = async () => {
      await fetch('/api/websocket');
      const socketIo = io({
        path: '/api/websocket',
      });

      socketIo.on('connect', () => {
        console.log('Socket connected with ID:', socketIo.id);
        setIsConnected(true);
      });

      socketIo.on('disconnect', () => {
        console.log('Socket disconnected');
        setIsConnected(false);
      });

      socketIo.on('error', (error: any) => {
        console.error('Socket error:', error);
      });
      
      socketIo.on('connect_error', (error: any) => {
        console.error('Socket connection error:', error);
      });

      socketIo.on('transcript-update', (data: TranscriptData) => {
        console.log('Transcript update received', data);
        setTranscript(data.text);
        setMeetingId(data.meetingId);
        setLastUpdate(new Date().toLocaleTimeString());
      });

      setSocket(socketIo);

      return () => {
        socketIo.disconnect();
      };
    };

    initSocket();
  }, []);

  // Get the most recent 200 words from the transcript
  const getRecentTranscript = (): string => {
    if (!transcript) return "";
    
    const words = transcript.split(/\s+/);
    if (words.length > 200) {
      return words.slice(-200).join(' ');
    }
    return transcript;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Live Transcript</span>
          <div className="flex items-center">
            <div 
              className={`w-3 h-3 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`} 
            />
            <span className="text-sm font-normal">{isConnected ? 'Connected' : 'Disconnected'}</span>
          </div>
        </CardTitle>
        <CardDescription>
          {meetingId ? `Receiving from meeting: ${meetingId}` : 'Waiting for transcript...'}
          {lastUpdate && ` (Last update: ${lastUpdate})`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] overflow-y-auto border rounded-md p-4 bg-muted/30">
          {transcript ? (
            <p>{getRecentTranscript()}</p>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Waiting for transcript from Google Meet...
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
