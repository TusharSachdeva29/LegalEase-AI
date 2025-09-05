import { NextRequest, NextResponse } from "next/server";

// Import the same storage (in production, this would be a database)
// For now, we'll access the same in-memory storage
let chatHistoryStorage: Record<string, any[]> = {};

export async function DELETE(
  request: NextRequest,
  { params }: { params: { chatId: string } }
) {
  try {
    const chatId = params.chatId;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!chatId) {
      return NextResponse.json(
        { error: "Chat ID is required" },
        { status: 400 }
      );
    }

    // Find the chat across all users if userId is not provided
    let foundUserId = userId;
    if (!foundUserId) {
      for (const uid in chatHistoryStorage) {
        const userChats = chatHistoryStorage[uid] || [];
        if (userChats.find((chat) => chat.id === chatId)) {
          foundUserId = uid;
          break;
        }
      }
    }

    if (!foundUserId || !chatHistoryStorage[foundUserId]) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    const userChats = chatHistoryStorage[foundUserId];
    const chatIndex = userChats.findIndex((chat) => chat.id === chatId);

    if (chatIndex === -1) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    // Remove the chat
    const deletedChat = userChats.splice(chatIndex, 1)[0];

    return NextResponse.json({
      success: true,
      deletedChat,
      message: "Chat deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting chat:", error);
    return NextResponse.json(
      { error: "Failed to delete chat" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { chatId: string } }
) {
  try {
    const chatId = params.chatId;

    if (!chatId) {
      return NextResponse.json(
        { error: "Chat ID is required" },
        { status: 400 }
      );
    }

    // Find the chat across all users
    for (const userId in chatHistoryStorage) {
      const userChats = chatHistoryStorage[userId] || [];
      const chat = userChats.find((chat) => chat.id === chatId);
      if (chat) {
        return NextResponse.json({ chat });
      }
    }

    return NextResponse.json({ error: "Chat not found" }, { status: 404 });
  } catch (error) {
    console.error("Error fetching chat:", error);
    return NextResponse.json(
      { error: "Failed to fetch chat" },
      { status: 500 }
    );
  }
}
