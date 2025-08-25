import { NextRequest, NextResponse } from "next/server";
import { testGeminiConnection } from "@/lib/test-gemini";

export async function GET() {
  try {
    const result = await testGeminiConnection();
    return NextResponse.json({ success: true, response: result });
  } catch (error) {
    console.error("Test failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : "No stack trace",
      },
      { status: 500 }
    );
  }
}
