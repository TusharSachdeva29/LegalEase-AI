import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Get the audio data from the request
    const formData = await request.formData();
    const audioFile = formData.get("audio");

    if (!audioFile || !(audioFile instanceof File)) {
      return NextResponse.json(
        { error: "No audio file provided" },
        { status: 400 }
      );
    }

    const GOOGLE_SPEECH_TO_TEXT = process.env.GOOGLE_SPEECH_TO_TEXT;

    if (!GOOGLE_SPEECH_TO_TEXT) {
      console.error("Google Speech-to-Text API key not found");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Convert the audio file to buffer
    const audioBuffer = await audioFile.arrayBuffer();
    const audioBase64 = Buffer.from(audioBuffer).toString("base64");

    // Get file details
    const fileType = audioFile.type;
    const fileSize = audioBuffer.byteLength;

    // Detect encoding and sample rate based on file type
    let encoding = "WEBM_OPUS";
    let sampleRateHertz;

    if (fileType.includes("mp3")) {
      encoding = "MP3";
      // For MP3, let Google auto-detect sample rate
    } else if (fileType.includes("wav")) {
      encoding = "LINEAR16";
      sampleRateHertz = 16000; // WAV files can use 16kHz
    } else if (fileType.includes("flac")) {
      encoding = "FLAC";
      // For FLAC, let Google auto-detect sample rate
    } else if (fileType.includes("webm") || fileType.includes("opus")) {
      encoding = "WEBM_OPUS";
      // For WEBM OPUS, don't specify sample rate - let Google auto-detect from header
    }

    console.log(
      `Processing audio: type=${fileType}, encoding=${encoding}, size=${fileSize} bytes`
    );

    // Prepare the request to Google Cloud Speech API
    const config: any = {
      encoding: encoding,
      languageCode: "en-US",
      enableAutomaticPunctuation: true,
      model: "latest_long", // Better for conversational speech
      useEnhanced: true,
      maxAlternatives: 1,
      profanityFilter: false,
      speechContexts: [
        {
          phrases: [
            "legal",
            "contract",
            "agreement",
            "clause",
            "law",
            "attorney",
            "document",
            "analysis",
            "help",
            "explain",
            "what",
            "how",
            "why",
          ],
          boost: 10,
        },
      ],
    };

    // Only add sampleRateHertz if we have a specific value
    if (sampleRateHertz) {
      config.sampleRateHertz = sampleRateHertz;
    }

    const apiRequest = {
      config: config,
      audio: {
        content: audioBase64,
      },
    };

    console.log("Sending audio to Google Speech API for chat...");

    const response = await fetch(
      `https://speech.googleapis.com/v1/speech:recognize?key=${GOOGLE_SPEECH_TO_TEXT}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(apiRequest),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Google Speech API error:", errorData);
      return NextResponse.json(
        {
          error: "Failed to transcribe audio",
          details: errorData,
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Extract transcription
    let transcription = "";
    if (data.results && data.results.length > 0) {
      const result = data.results[0];
      if (result.alternatives && result.alternatives.length > 0) {
        transcription = result.alternatives[0].transcript || "";
      }
    }

    console.log("Chat transcription result:", transcription);

    return NextResponse.json({
      text: transcription,
      confidence: data.results?.[0]?.alternatives?.[0]?.confidence || 0,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error("Error in speech-to-text API:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
