import { NextRequest, NextResponse } from "next/server";

// In-memory storage for development (replace with actual database in production)
let chatHistoryStorage: Record<string, any[]> = {};

interface ChatMessage {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: string;
}

interface ChatHistory {
  id: string;
  userId: string;
  title: string;
  type: "document" | "transcript" | "advice";
  preview: string;
  timestamp: string;
  lastUpdated: string;
  messageCount: number;
  lastMessage: string;
  messages: ChatMessage[];
  metadata?: {
    documentName?: string;
    transcriptDuration?: string;
    analysisType?: string;
    documentId?: string;
    transcriptId?: string;
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Get chat history for user (fallback to localStorage structure)
    const userChats = chatHistoryStorage[userId] || [];

    // Also check localStorage data if available (for backward compatibility)
    // This would be handled by the client in a real app

    return NextResponse.json({
      chats: userChats,
      total: userChats.length,
    });
  } catch (error) {
    console.error("Error fetching chat history:", error);
    return NextResponse.json(
      { error: "Failed to fetch chat history" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, title, type, preview, messages, metadata } = body;

    if (!userId || !title || !type || !messages) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const chatId = `chat_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    const timestamp = new Date().toISOString();

    const lastMessage =
      messages.length > 0
        ? messages[messages.length - 1].content
        : "No messages";

    const newChat: ChatHistory = {
      id: chatId,
      userId,
      title,
      type,
      preview: preview || lastMessage.substring(0, 150) + "...",
      timestamp,
      lastUpdated: timestamp,
      messageCount: messages.length,
      lastMessage,
      messages,
      metadata,
    };

    // Initialize user chat history if it doesn't exist
    if (!chatHistoryStorage[userId]) {
      chatHistoryStorage[userId] = [];
    }

    // Add new chat to the beginning of the array (most recent first)
    chatHistoryStorage[userId].unshift(newChat);

    // Keep only the last 50 chats per user (optional limit)
    if (chatHistoryStorage[userId].length > 50) {
      chatHistoryStorage[userId] = chatHistoryStorage[userId].slice(0, 50);
    }

    return NextResponse.json({
      success: true,
      chatId,
      chat: newChat,
    });
  } catch (error) {
    console.error("Error saving chat history:", error);
    return NextResponse.json(
      { error: "Failed to save chat history" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { chatId, userId, messages, lastMessage } = body;

    if (!chatId || !userId) {
      return NextResponse.json(
        { error: "Chat ID and User ID are required" },
        { status: 400 }
      );
    }

    const userChats = chatHistoryStorage[userId] || [];
    const chatIndex = userChats.findIndex((chat) => chat.id === chatId);

    if (chatIndex === -1) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    // Update the chat
    userChats[chatIndex] = {
      ...userChats[chatIndex],
      messages: messages || userChats[chatIndex].messages,
      lastMessage: lastMessage || userChats[chatIndex].lastMessage,
      messageCount: messages
        ? messages.length
        : userChats[chatIndex].messageCount,
      lastUpdated: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      chat: userChats[chatIndex],
    });
  } catch (error) {
    console.error("Error updating chat history:", error);
    return NextResponse.json(
      { error: "Failed to update chat history" },
      { status: 500 }
    );
  }
}
