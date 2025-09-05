import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

/*
 * This endpoint receives audio data and sends it to Google Cloud Speech-to-Text API
 * It requires Google Cloud credentials to be set up
 */
export async function OPTIONS(request: NextRequest) {
  // Handle CORS preflight requests
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*", // More permissive for local development
      "Access-Control-Allow-Methods": "POST, OPTIONS, GET",
      "Access-Control-Allow-Headers":
        "Content-Type, X-Meeting-ID, X-Client-Version, Authorization, Accept",
      "Access-Control-Max-Age": "86400",
    },
  });
}

export async function POST(request: NextRequest) {
  // Set CORS headers for the main request
  const headers = {
    "Access-Control-Allow-Origin": "*", // More permissive for local development
    "Access-Control-Allow-Methods": "POST, OPTIONS, GET",
    "Access-Control-Allow-Headers":
      "Content-Type, X-Meeting-ID, X-Client-Version, Authorization, Accept",
  };

  try {
    // Get the audio data from the request
    const formData = await request.formData();
    const audioFile = formData.get("audio");

    if (!audioFile) {
      return NextResponse.json(
        {
          error: "No audio file provided",
        },
        { status: 400 }
      );
    }

    // Read Google Cloud credentials from environment variables
    // In production, these should be securely stored
    const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

    console.log("API Key check:", {
      isDefined: !!GOOGLE_API_KEY,
      length: GOOGLE_API_KEY ? GOOGLE_API_KEY.length : 0,
      prefix: GOOGLE_API_KEY
        ? GOOGLE_API_KEY.substring(0, 5) + "..."
        : "undefined",
    });

    if (!GOOGLE_API_KEY) {
      console.error("Google API key not found in environment variables");
      return NextResponse.json(
        {
          error: "Server configuration error",
          detail: "Missing Google API key",
        },
        {
          status: 500,
          headers,
        }
      );
    }

    // Convert the audio file to buffer
    const audioBuffer = await (audioFile as File).arrayBuffer();
    const audioBase64 = Buffer.from(audioBuffer).toString("base64");

    // Get file details and log them
    const fileType = (audioFile as File).type;
    const fileSize = audioBuffer.byteLength;
    console.log("Audio file details:", {
      type: fileType,
      size: fileSize + " bytes",
      sizeInKB: (fileSize / 1024).toFixed(2) + " KB",
    });

    // Detect the appropriate encoding based on file type
    let encoding = "LINEAR16";
    if (fileType.includes("webm")) {
      encoding = "WEBM_OPUS";
    } else if (fileType.includes("ogg")) {
      encoding = "OGG_OPUS";
    } else if (fileType.includes("mp3")) {
      encoding = "MP3";
    } else if (fileType.includes("flac")) {
      encoding = "FLAC";
    }

    console.log("Using encoding:", encoding);

    // Prepare the request to Google Cloud Speech API
    const apiRequest = {
      config: {
        encoding: encoding,
        audioChannelCount: 2, // Set to match WEBM OPUS header (stereo)
        languageCode: "en-US",
        enableAutomaticPunctuation: true,
        model: "video", // Better for video content like Google Meet
        useEnhanced: true, // Use enhanced model for better accuracy
        enableWordTimeOffsets: true, // Get word timing information
        enableWordConfidence: true, // Get confidence scores for each word
        maxAlternatives: 1, // Only need the top transcript
        profanityFilter: false, // Keep all words
        speechContexts: [
          {
            // Add some context for legal terminology
            phrases: [
              "legal",
              "contract",
              "agreement",
              "clause",
              "plaintiff",
              "defendant",
              "lawyer",
              "attorney",
              "court",
              "judge",
              "law",
              "provision",
              "meeting",
              "conference",
              "call",
              "discussion",
              "conversation",
            ],
            boost: 10, // Boost recognition of these phrases
          },
        ],
      },
      audio: {
        content: audioBase64,
      },
    };

    // Ensure the audioChannelCount matches the WEBM OPUS header
    // The error indicates WEBM OPUS header has 2 channels, so ensure we use 2
    apiRequest.config.audioChannelCount = 2;

    // Debug: Log the actual config being sent to Google
    console.log(
      "API Request Config:",
      JSON.stringify(apiRequest.config, null, 2)
    );

    console.log(
      "Sending request to Google Speech API with encoding:",
      encoding
    );

    const response = await fetch(
      "https://speech.googleapis.com/v1/speech:recognize?key=" + GOOGLE_API_KEY,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(apiRequest),
      }
    );

    // Check for HTTP errors first
    if (!response.ok) {
      let errorDetails;
      try {
        errorDetails = await response.json();
        console.error(
          "Google Speech API error response:",
          JSON.stringify(errorDetails, null, 2)
        );
      } catch (parseError) {
        // If the error response isn't valid JSON
        try {
          const errorText = await response.text();
          console.error("Google Speech API error (non-JSON):", errorText);
          errorDetails = { rawError: errorText };
        } catch (e) {
          console.error("Failed to read error response:", e);
          errorDetails = {
            error: "Unknown error",
            httpStatus: response.status,
          };
        }
      }

      return NextResponse.json(
        {
          error: "Failed to transcribe audio",
          details: errorDetails || { error: "Unknown error" },
          httpStatus: response.status,
          request: {
            encoding: encoding || "unknown",
            audioSize: fileSize || 0,
            audioType: fileType || "unknown",
          },
        },
        {
          status: response.status,
          headers,
        }
      );
    }

    const data = await response.json();
    console.log(
      "Google Speech API full response:",
      JSON.stringify(data, null, 2)
    );
    console.log(
      "Google Speech API response structure:",
      JSON.stringify(
        {
          hasResults: !!data.results,
          resultsCount: data.results?.length || 0,
          hasAlternatives: data.results?.[0]?.alternatives?.length > 0 || false,
        },
        null,
        2
      )
    );

    // Check for specific Google API error structures
    if (data.error) {
      console.error("Google API error details:", data.error);
      return NextResponse.json(
        {
          error: "Google Speech API error",
          message: data.error.message || "Unknown API error",
          code: data.error.code || 0,
          details: data.error.details || [],
        },
        {
          status: 400,
          headers,
        }
      );
    }

    // Extract the transcription from the response
    let transcription = "";
    let emptyAlternativesFound = false;

    if (
      data.results &&
      Array.isArray(data.results) &&
      data.results.length > 0
    ) {
      try {
        // First check if we have empty alternatives (which indicates Google received audio but detected no speech)
        emptyAlternativesFound = data.results.some(
          (result: any) =>
            result.alternatives &&
            Array.isArray(result.alternatives) &&
            result.alternatives.length > 0 &&
            (!result.alternatives[0].transcript ||
              result.alternatives[0].transcript === "")
        );

        if (emptyAlternativesFound) {
          console.log(
            "Empty alternatives found in the response - audio was processed but no speech detected"
          );
        }

        const transcriptParts = data.results
          .map((result: any) => {
            if (
              result &&
              result.alternatives &&
              Array.isArray(result.alternatives) &&
              result.alternatives.length > 0 &&
              result.alternatives[0].transcript
            ) {
              return result.alternatives[0].transcript;
            }
            return "";
          })
          .filter(
            (text: string) =>
              text && typeof text === "string" && text.trim() !== ""
          );

        transcription = transcriptParts.join(" ");
      } catch (parseError) {
        console.error("Error parsing transcription results:", parseError);
        transcription = "";
      }
    }

    // Add very visible console logging for live monitoring
    if (transcription && transcription.trim() !== "") {
      console.log("\n\n🎤 TRANSCRIPTION RECEIVED 🎤");
      console.log("============================");
      console.log(transcription);
      console.log("============================\n\n");
    } else {
      console.log("\n\n❌ EMPTY TRANSCRIPTION RECEIVED ❌\n\n");
      console.log("Raw API response:", JSON.stringify(data, null, 2));

      // Extract diagnostic info to help debugging
      const diagnosticInfo = {
        totalBilledTime: data.totalBilledTime || "unknown",
        requestId: data.requestId || "unknown",
        resultsCount: data.results?.length || 0,
        hasEmptyAlternatives: emptyAlternativesFound,
        encoding: encoding,
        fileType: fileType,
        fileSizeBytes: fileSize,
        apiKeyFirstChars: GOOGLE_API_KEY
          ? GOOGLE_API_KEY.substring(0, 5) + "..."
          : "missing",
      };

      console.log("Diagnostic info:", diagnosticInfo);
    }

    // Store the transcript in our latest-transcript endpoint for backup retrieval
    try {
      const baseUrl =
        process.env.NODE_ENV === "production"
          ? "https://yourdomain.com"
          : `http://localhost:${process.env.PORT || 3001}`;

      await fetch(`${baseUrl}/api/latest-transcript`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: transcription,
          source: "api-transcribe",
          timestamp: Date.now(),
        }),
      });
    } catch (storeError) {
      console.error("Failed to store transcript:", storeError);
      // Continue anyway - this is just a backup
    }

    // Return the transcribed text with CORS headers
    let duration = "unknown";
    let confidence = 0;

    // Safely determine duration if words data is available
    try {
      if (
        data &&
        data.results &&
        data.results[0] &&
        data.results[0].alternatives &&
        data.results[0].alternatives[0]
      ) {
        // Try to extract word count or time information
        if (
          Array.isArray(data.results[0].alternatives[0].words) &&
          data.results[0].alternatives[0].words.length > 0
        ) {
          duration = `${data.results[0].alternatives[0].words.length} words`;
        } else if (data.totalBilledTime) {
          duration = data.totalBilledTime;
        }

        // Try to get confidence score
        if (typeof data.results[0].alternatives[0].confidence === "number") {
          confidence = data.results[0].alternatives[0].confidence;
        }
      }
    } catch (dataError) {
      console.error("Error extracting additional data:", dataError);
    }

    // Include audio processing information in the response
    const processingInfo = {
      noSpeechDetected: emptyAlternativesFound,
      receivedAudio: true,
      fileType: fileType,
      fileSize: fileSize,
      encoding: encoding,
      requestId: data.requestId || "unknown",
      totalBilledTime: data.totalBilledTime || "unknown",
    };

    return NextResponse.json(
      {
        text: transcription || "",
        timestamp: Date.now(),
        encoding: encoding || "unknown",
        duration: duration,
        confidence: confidence,
        processingInfo: processingInfo,
        isEmpty: transcription.trim() === "",
        // Adding some alternative response to help debug empty transcriptions
        message: transcription
          ? "Speech transcribed successfully"
          : emptyAlternativesFound
          ? "No speech detected in audio"
          : "Failed to transcribe speech",
      },
      { headers }
    );
  } catch (error: unknown) {
    console.error("Error processing transcription request:", error);

    // Try to get more details about the error
    let errorMessage = "Unknown error";
    let errorDetails: Record<string, any> = {};

    console.log("🚨 Transcription API error:", error);

    if (error instanceof Error) {
      errorMessage = error.message;
      errorDetails = {
        name: error.name,
        stack: error.stack,
      };
    } else if (typeof error === "object" && error !== null) {
      try {
        errorDetails = { ...error };
      } catch (e) {
        errorDetails = { stringified: String(error) };
      }
    } else {
      errorDetails = { value: String(error) };
    }

    // Log additional debugging information
    console.log("Transcription API error context:", {
      time: new Date().toISOString(),
      endpoint: "/api/transcribe",
      method: "POST",
      errorTime: Date.now(),
    });

    // Log additional information for debugging
    console.error("Error details:", JSON.stringify(errorDetails, null, 2));

    return NextResponse.json(
      {
        error: "Internal server error",
        message: errorMessage,
        details: errorDetails,
      },
      {
        status: 500,
        headers: headers || {
          "Access-Control-Allow-Origin": "https://meet.google.com",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers":
            "Content-Type, X-Meeting-ID, X-Client-Version",
        },
      }
    );
  }
}
