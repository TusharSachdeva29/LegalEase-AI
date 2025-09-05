"use client";

import { useState, useRef, useCallback } from "react";

interface UseTextToSpeechProps {
  voice?: string;
  languageCode?: string;
  speed?: number;
  onError?: (error: string) => void;
  onStart?: () => void;
  onEnd?: () => void;
}

export function useTextToSpeech({
  voice = "en-IN-Standard-A",
  languageCode = "en-IN",
  speed = 1.0,
  onError,
  onStart,
  onEnd,
}: UseTextToSpeechProps = {}) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const speak = useCallback(
    async (text: string) => {
      if (!text.trim()) {
        onError?.("No text to speak");
        return;
      }

      try {
        setIsLoading(true);

        // Stop any currently playing audio
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }

        const response = await fetch("/api/text-to-speech", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text, voice, languageCode, speed }),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (!data.audioContent) {
          throw new Error("No audio content received");
        }

        // Convert base64 to blob
        const audioData = atob(data.audioContent);
        const arrayBuffer = new ArrayBuffer(audioData.length);
        const uint8Array = new Uint8Array(arrayBuffer);

        for (let i = 0; i < audioData.length; i++) {
          uint8Array[i] = audioData.charCodeAt(i);
        }

        const audioBlob = new Blob([arrayBuffer], { type: "audio/mpeg" });
        const audioUrl = URL.createObjectURL(audioBlob);

        // Create and configure audio element
        const audio = new Audio(audioUrl);
        audioRef.current = audio;

        let hasStartedPlaying = false;
        let hasEnded = false;

        audio.oncanplaythrough = () => {
          // Audio is ready to play without interruption
          setIsLoading(false);
        };

        audio.onplay = () => {
          // Audio has actually started playing
          hasStartedPlaying = true;
          setIsSpeaking(true);
          onStart?.();
        };

        audio.onended = () => {
          if (!hasEnded) {
            hasEnded = true;
            setIsSpeaking(false);
            URL.revokeObjectURL(audioUrl);
            onEnd?.();
          }
        };

        audio.onerror = (error) => {
          // Only show error if audio hasn't started playing successfully
          if (!hasStartedPlaying) {
            console.error("Audio playback error:", error);
            setIsLoading(false);
            setIsSpeaking(false);
            URL.revokeObjectURL(audioUrl);
            onError?.("Failed to play audio");
          }
        };

        audio.onabort = () => {
          // Handle abort only if it wasn't intentional
          if (!hasEnded && !hasStartedPlaying) {
            setIsLoading(false);
            setIsSpeaking(false);
            URL.revokeObjectURL(audioUrl);
          }
        };

        // Start playing with better error handling
        try {
          await audio.play();
        } catch (playError) {
          // Only report error if it's a real playback issue
          if (!hasStartedPlaying) {
            console.error("Play promise rejected:", playError);
            setIsLoading(false);
            setIsSpeaking(false);
            URL.revokeObjectURL(audioUrl);

            // Check if it's an autoplay policy error
            if (
              playError instanceof Error &&
              playError.name === "NotAllowedError"
            ) {
              onError?.(
                "Audio playback blocked by browser. Please enable autoplay for this site."
              );
            } else {
              onError?.("Failed to start audio playback");
            }
          }
        }
      } catch (error) {
        console.error("Error in text-to-speech:", error);
        setIsLoading(false);
        setIsSpeaking(false);
        onError?.(
          `Failed to speak text: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    },
    [voice, speed, onError, onStart, onEnd]
  );

  const stopSpeaking = useCallback(() => {
    if (audioRef.current) {
      try {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;

        // Clean up the audio URL if it exists
        const audioSrc = audioRef.current.src;
        if (audioSrc && audioSrc.startsWith("blob:")) {
          URL.revokeObjectURL(audioSrc);
        }

        setIsSpeaking(false);
        audioRef.current = null;
      } catch (error) {
        // Silently handle any cleanup errors
        console.warn("Error during audio cleanup:", error);
        setIsSpeaking(false);
        audioRef.current = null;
      }
    }
  }, []);

  return {
    speak,
    stopSpeaking,
    isSpeaking,
    isLoading,
  };
}
