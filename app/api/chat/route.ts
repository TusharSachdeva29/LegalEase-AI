import { NextRequest, NextResponse } from "next/server";
import { chatWithAI } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  try {
    console.log("Chat API called");
    const { message, context, documentContext } = await request.json();

    if (!message) {
      console.log("No message provided");
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    console.log("Message:", message);
    console.log("Context:", context);

    const response = await chatWithAI(
      message,
      context || "general",
      documentContext
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
