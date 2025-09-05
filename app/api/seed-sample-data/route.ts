import { NextRequest, NextResponse } from "next/server";

// Sample data for testing
const sampleChats = [
  {
    id: "chat_1698234567_abc123",
    userId: "sample_user_id",
    title: "Contract Analysis - Service Agreement",
    type: "document",
    preview:
      "I need help analyzing this service agreement. There are several clauses I'm concerned about...",
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    lastUpdated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    messageCount: 8,
    lastMessage:
      "Thank you for the analysis. The liability clause seems problematic. Can you suggest alternative language?",
    messages: [
      {
        id: "msg1",
        content:
          "I need help analyzing this service agreement. There are several clauses I'm concerned about, particularly around liability and termination.",
        role: "user",
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "msg2",
        content:
          "I'd be happy to help you analyze this service agreement. Let me review the key clauses and identify potential concerns...",
        role: "assistant",
        timestamp: new Date(
          Date.now() - 2 * 24 * 60 * 60 * 1000 + 30000
        ).toISOString(),
      },
    ],
    metadata: {
      documentName: "Service_Agreement_2024.pdf",
      analysisType: "contract_analysis",
    },
  },
  {
    id: "chat_1698234890_def456",
    userId: "sample_user_id",
    title: "Meeting Transcript - Client Consultation",
    type: "transcript",
    preview:
      "Here's the meeting transcript from our client consultation session...",
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    lastUpdated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    messageCount: 5,
    lastMessage:
      "Based on the transcript, I recommend documenting the client's concerns about indemnification in a follow-up email.",
    messages: [
      {
        id: "msg3",
        content:
          "Here's the meeting transcript from our client consultation session. Can you analyze the key legal issues discussed?",
        role: "user",
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "msg4",
        content:
          "I've analyzed the transcript and identified several key legal issues that were discussed during your client consultation...",
        role: "assistant",
        timestamp: new Date(
          Date.now() - 1 * 24 * 60 * 60 * 1000 + 45000
        ).toISOString(),
      },
    ],
    metadata: {
      transcriptDuration: "23 minutes",
      analysisType: "legal_analysis",
    },
  },
  {
    id: "chat_1698235200_ghi789",
    userId: "sample_user_id",
    title: "Legal Advice - Employment Law Question",
    type: "advice",
    preview:
      "I have a question about employment law and non-compete agreements...",
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
    lastUpdated: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    messageCount: 12,
    lastMessage:
      "The enforceability depends on several factors including geographic scope, time duration, and legitimate business interests.",
    messages: [
      {
        id: "msg5",
        content:
          "I have a question about employment law and non-compete agreements. My employer wants me to sign one but I'm concerned about its scope.",
        role: "user",
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "msg6",
        content:
          "Non-compete agreements are complex and their enforceability varies significantly by jurisdiction. Let me help you understand the key factors...",
        role: "assistant",
        timestamp: new Date(
          Date.now() - 3 * 60 * 60 * 1000 + 60000
        ).toISOString(),
      },
    ],
    metadata: {
      analysisType: "employment_law",
    },
  },
];

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Create sample chats for this user by calling the chat-history API directly
    const userChats = sampleChats.map((chat) => ({
      ...chat,
      userId: userId,
    }));

    const baseUrl = `${request.nextUrl.protocol}//${request.nextUrl.host}`;

    // Save each sample chat
    const savePromises = userChats.map(async (chat) => {
      try {
        const response = await fetch(`${baseUrl}/api/chat-history`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(chat),
        });
        return response.ok;
      } catch (error) {
        console.error("Error saving sample chat:", error);
        return false;
      }
    });

    const results = await Promise.all(savePromises);
    const successCount = results.filter((r) => r).length;

    return NextResponse.json({
      success: true,
      message: `${successCount} sample chats seeded successfully`,
      count: successCount,
    });
  } catch (error) {
    console.error("Error seeding sample data:", error);
    return NextResponse.json(
      { error: "Failed to seed sample data" },
      { status: 500 }
    );
  }
}
