import { NextRequest, NextResponse } from "next/server";
import { analyzeDocument } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  try {
    console.log("Analyze API called");
    const {
      documentText,
      saveToHistory,
      title,
      type,
      userId,
      transcriptDuration,
    } = await request.json();

    if (!documentText) {
      console.log("No document text provided");
      return NextResponse.json(
        { error: "Document text is required" },
        { status: 400 }
      );
    }

    console.log("Document text length:", documentText.length);

    // If this is a save request, save to chat history
    if (saveToHistory && userId) {
      console.log("Saving to chat history:", { title, type, userId });

      try {
        // Create initial message with the transcript/document content
        const initialMessage = {
          id: "initial",
          content: `Here's the ${
            type === "transcript" ? "meeting transcript" : "document"
          } content:\n\n${documentText}`,
          role: "user",
          timestamp: new Date().toISOString(),
        };

        // Analyze the content first
        const analysis = await analyzeDocument(documentText);

        // Create AI response with analysis
        const analysisMessage = {
          id: "analysis",
          content: analysis,
          role: "assistant",
          timestamp: new Date().toISOString(),
        };

        const chatData = {
          userId,
          title:
            title ||
            `${
              type === "transcript" ? "Meeting Transcript" : "Document"
            } - ${new Date().toLocaleDateString()}`,
          type: type || "document",
          preview: documentText.substring(0, 150) + "...",
          messages: [initialMessage, analysisMessage],
          metadata: {
            documentName: title,
            transcriptDuration: transcriptDuration,
            analysisType: "legal_analysis",
          },
        };

        const saveResponse = await fetch(
          `${request.nextUrl.origin}/api/chat-history`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(chatData),
          }
        );

        if (saveResponse.ok) {
          const saveResult = await saveResponse.json();
          console.log("Chat saved to history with ID:", saveResult.chatId);

          return NextResponse.json({
            success: true,
            message: `${
              type === "transcript" ? "Transcript" : "Document"
            } saved to history`,
            chatId: saveResult.chatId,
            analysis: analysis,
          });
        } else {
          console.error("Failed to save to chat history");
          return NextResponse.json({
            success: false,
            message: "Failed to save to history",
            analysis: analysis,
          });
        }
      } catch (saveError) {
        console.error("Error saving to chat history:", saveError);
        // Still return the analysis even if saving fails
        const analysis = await analyzeDocument(documentText);
        return NextResponse.json({
          success: false,
          message: "Analysis completed but failed to save to history",
          analysis: analysis,
        });
      }
    }

    // Regular analysis
    const analysis = await analyzeDocument(documentText);
    console.log("Analysis completed successfully");

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error("Error in document analysis API:", error);
    return NextResponse.json(
      {
        error: "Failed to analyze document",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
