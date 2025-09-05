import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const {
      text,
      voice = "en-US-Standard-D",
      speed = 1.0,
    } = await request.json();

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const GOOGLE_TEXT_TO_SPEECH_KEY = process.env.GOOGLE_TEXT_TO_SPEECH_KEY;

    if (!GOOGLE_TEXT_TO_SPEECH_KEY) {
      console.error("Google Text-to-Speech API key not found");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Prepare the request for Google Text-to-Speech API
    const requestBody = {
      input: { text },
      voice: {
        languageCode: "en-US",
        name: voice,
        ssmlGender: "NEUTRAL",
      },
      audioConfig: {
        audioEncoding: "MP3",
        speakingRate: speed,
        pitch: 0.0,
        volumeGainDb: 0.0,
      },
    };

    console.log("Calling Google Text-to-Speech API...");

    const response = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${GOOGLE_TEXT_TO_SPEECH_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Google Text-to-Speech API error:", errorData);
      return NextResponse.json(
        {
          error: "Failed to synthesize speech",
          details: errorData,
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Return the base64 encoded audio content
    return NextResponse.json({
      audioContent: data.audioContent,
      contentType: "audio/mpeg",
    });
  } catch (error) {
    console.error("Error in text-to-speech API:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
