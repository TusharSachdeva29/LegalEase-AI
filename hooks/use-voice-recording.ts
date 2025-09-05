"use client";

import { useState, useRef, useCallback } from "react";

interface UseVoiceRecordingProps {
  languageCode?: string;
  onTranscription?: (text: string) => void;
  onError?: (error: string) => void;
}

export function useVoiceRecording({
  languageCode = "en-IN",
  onTranscription,
  onError,
}: UseVoiceRecordingProps = {}) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    try {
      // Request microphone access with optimized settings for speech recognition
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          // Don't constrain sample rate - let the browser/codec decide
          // WEBM OPUS typically records at 48kHz which is what Google expects
        },
      });

      // Create MediaRecorder
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });

        // Stop all audio tracks
        stream.getTracks().forEach((track) => track.stop());

        // Process the audio
        await processAudio(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
      onError?.(
        `Failed to start recording: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }, [onError]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsProcessing(true);
    }
  }, [isRecording]);

  const processAudio = async (audioBlob: Blob) => {
    try {
      const formData = new FormData();
      formData.append("audio", audioBlob, "audio.webm");
      formData.append("languageCode", languageCode);

      const response = await fetch("/api/speech-to-text", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.text && data.text.trim()) {
        onTranscription?.(data.text.trim());
      } else {
        onError?.("No speech detected. Please try speaking more clearly.");
      }
    } catch (error) {
      console.error("Error processing audio:", error);
      onError?.(
        `Failed to process audio: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isRecording,
    isProcessing,
    startRecording,
    stopRecording,
  };
}
