"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useVoiceRecording } from "@/hooks/use-voice-recording";
import { useTextToSpeech } from "@/hooks/use-text-to-speech";
import { useToast } from "@/hooks/use-toast";
import { Mic, MicOff, Volume2, VolumeX, Loader2 } from "lucide-react";

export default function VoiceTestPage() {
  const [transcribedText, setTranscribedText] = useState("");
  const [testText] = useState(
    "Hello! This is a test of the text-to-speech functionality. I'm your legal AI assistant, and I can help you with various legal questions and document analysis."
  );
  const { toast } = useToast();

  const { isRecording, isProcessing, startRecording, stopRecording } =
    useVoiceRecording({
      onTranscription: (text) => {
        setTranscribedText(text);
        toast({
          title: "Speech Recognition Success",
          description: "Your voice has been converted to text!",
        });
      },
      onError: (error) => {
        toast({
          title: "Speech Recognition Error",
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
    onError: (error) => {
      toast({
        title: "Text-to-Speech Error",
        description: error,
        variant: "destructive",
      });
    },
    onStart: () => {
      toast({
        title: "Text-to-Speech Started",
        description: "Playing audio...",
      });
    },
    onEnd: () => {
      toast({
        title: "Text-to-Speech Completed",
        description: "Audio playback finished.",
      });
    },
  });

  const handleVoiceInput = () => {
    if (isRecording) {
      stopRecording();
    } else {
      setTranscribedText(""); // Clear previous text
      startRecording();
    }
  };

  const handleTextToSpeech = () => {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      speak(testText);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">Voice Chat Features Test</h1>
        <p className="text-muted-foreground">
          Test the speech-to-text and text-to-speech functionality
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Speech-to-Text Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mic className="w-5 h-5" />
              Speech-to-Text Test
            </CardTitle>
            <CardDescription>
              Click the microphone button and speak to test voice input
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center">
              <Button
                variant={isRecording ? "destructive" : "default"}
                size="lg"
                onClick={handleVoiceInput}
                disabled={isProcessing}
                className="w-32 h-32 rounded-full"
              >
                {isProcessing ? (
                  <Loader2 className="w-8 h-8 animate-spin" />
                ) : isRecording ? (
                  <MicOff className="w-8 h-8" />
                ) : (
                  <Mic className="w-8 h-8" />
                )}
              </Button>
            </div>

            <div className="text-center space-y-2">
              {isRecording && (
                <p className="text-sm text-red-500 font-medium">
                  🔴 Recording... Click to stop
                </p>
              )}
              {isProcessing && (
                <p className="text-sm text-blue-500 font-medium">
                  Processing audio...
                </p>
              )}
              {!isRecording && !isProcessing && (
                <p className="text-sm text-muted-foreground">
                  Click to start recording
                </p>
              )}
            </div>

            {transcribedText && (
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-1">Transcribed Text:</p>
                <p className="text-sm">{transcribedText}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Text-to-Speech Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Volume2 className="w-5 h-5" />
              Text-to-Speech Test
            </CardTitle>
            <CardDescription>
              Click the speaker button to hear the test message
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-1">Test Message:</p>
              <p className="text-sm">{testText}</p>
            </div>

            <div className="flex justify-center">
              <Button
                variant={isSpeaking ? "destructive" : "default"}
                size="lg"
                onClick={handleTextToSpeech}
                disabled={isSpeechLoading}
                className="w-32 h-32 rounded-full"
              >
                {isSpeechLoading ? (
                  <Loader2 className="w-8 h-8 animate-spin" />
                ) : isSpeaking ? (
                  <VolumeX className="w-8 h-8" />
                ) : (
                  <Volume2 className="w-8 h-8" />
                )}
              </Button>
            </div>

            <div className="text-center space-y-2">
              {isSpeechLoading && (
                <p className="text-sm text-blue-500 font-medium">
                  Loading audio...
                </p>
              )}
              {isSpeaking && (
                <p className="text-sm text-green-500 font-medium">
                  🔊 Playing audio... Click to stop
                </p>
              )}
              {!isSpeaking && !isSpeechLoading && (
                <p className="text-sm text-muted-foreground">
                  Click to hear the message
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 text-center">
        <Card>
          <CardHeader>
            <CardTitle>Voice Features Status</CardTitle>
            <CardDescription>
              Current status of voice functionality
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <h4 className="font-medium">Speech-to-Text</h4>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      isRecording
                        ? "bg-red-500"
                        : isProcessing
                        ? "bg-yellow-500"
                        : "bg-green-500"
                    }`}
                  />
                  <span className="text-sm">
                    {isRecording
                      ? "Recording"
                      : isProcessing
                      ? "Processing"
                      : "Ready"}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Text-to-Speech</h4>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      isSpeaking
                        ? "bg-blue-500"
                        : isSpeechLoading
                        ? "bg-yellow-500"
                        : "bg-green-500"
                    }`}
                  />
                  <span className="text-sm">
                    {isSpeaking
                      ? "Speaking"
                      : isSpeechLoading
                      ? "Loading"
                      : "Ready"}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
