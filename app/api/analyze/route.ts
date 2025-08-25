import { NextRequest, NextResponse } from "next/server";
import { analyzeDocument } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  try {
    console.log("Analyze API called");
    const { documentText } = await request.json();

    if (!documentText) {
      console.log("No document text provided");
      return NextResponse.json(
        { error: "Document text is required" },
        { status: 400 }
      );
    }

    console.log("Document text length:", documentText.length);
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
