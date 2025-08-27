import { NextRequest, NextResponse } from "next/server";
import { chatWithAI } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  try {
    console.log("Chat API called");
    const { message, context, documentContext, documentName } =
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
    console.log("Has document context:", !!documentContext);
    console.log("Document name:", documentName);

    // If we have document context, it should be the full document text, not just the name
    const fullDocumentContext =
      documentContext &&
      typeof documentContext === "string" &&
      documentContext.length > 50
        ? documentContext
        : undefined;

    const response = await chatWithAI(
      message,
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
