import { NextRequest, NextResponse } from "next/server";
import { chatWithAI } from "@/lib/gemini";
import { LANGUAGE_PROMPTS } from "@/lib/languages";

export async function POST(request: NextRequest) {
  try {
    console.log("Chat API called");
    const { message, context, documentContext, documentName, language } =
      await request.json();

    if (!message) {
      console.log("No message provided");
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    console.log("Message:", message);
    console.log("Context:", context);
    console.log("Language:", language || "en");
    console.log("Has document context:", !!documentContext);
    console.log("Document name:", documentName);

    // If we have document context, it should be the full document text, not just the name
    const fullDocumentContext =
      documentContext &&
      typeof documentContext === "string" &&
      documentContext.length > 50
        ? documentContext
        : undefined;

    // Get language-specific prompt
    const languageKey = language ? language.split("-")[0] : "en";
    const languagePrompt =
      LANGUAGE_PROMPTS[languageKey] || LANGUAGE_PROMPTS["en"];

    // Combine user message with language instruction
    const enhancedMessage = `${message}\n\n${languagePrompt}`;

    const response = await chatWithAI(
      enhancedMessage,
      context || "general",
      fullDocumentContext
    );

    console.log("Chat completed successfully");
    return NextResponse.json(response);
  } catch (error) {
    console.error("Error in chat API:", error);
    return NextResponse.json(
      {
        error: "Failed to get AI response",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
