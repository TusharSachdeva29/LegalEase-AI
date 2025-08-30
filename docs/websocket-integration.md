# WebSocket Integration for Meet Transcription

This document explains how the WebSocket server is integrated with the Next.js application for real-time transcription and analysis of Google Meet conversations.

## Architecture

```
+-----------------+       +-----------------+       +----------------+
| Chrome Extension|       |   WebSocket     |       |    Next.js     |
|                 | <---> |    Server       | <---> |    Client      |
| (transcription) |       | (data transfer) |       | (UI/analysis)  |
+-----------------+       +-----------------+       +----------------+
                                                           |
                                                           v
                                                    +-----------------+
                                                    |   Gemini API    |
                                                    | (legal analysis)|
                                                    +-----------------+
```

## WebSocket Server Setup

The WebSocket server is implemented using Socket.IO and is set up in the Next.js API routes:

- `/pages/api/websocket.ts`: Main WebSocket server implementation
- `/pages/api/socket/index.ts`: WebSocket upgrade handler

## WebSocket Client

The client-side WebSocket connections are managed through the following components:

- `/lib/websocket.ts`: Utility functions for connecting to the WebSocket server
- `/components/transcript-receiver.tsx`: Component that receives and displays transcriptions
- `/components/transcript-analyzer.tsx`: Component that analyzes transcriptions with Gemini API

## Message Types

The WebSocket server handles the following message types:

1. **transcript**: Raw transcription data sent from the Chrome extension
2. **transcript-update**: Processed transcription data broadcast to all clients

## Data Flow

1. Chrome extension captures audio from Google Meet
2. Audio is transcribed using the Web Speech API
3. Transcription is sent to the WebSocket server
4. WebSocket server broadcasts the transcription to all connected clients
5. Next.js client receives the transcription and displays it
6. User can request AI analysis of the transcription
7. Analysis is performed using the Gemini API
8. Results are displayed to the user

## Implementation Details

### Server-Side

```typescript
// Initialize Socket.IO server
const io = new Server(res.socket.server, {
  path: '/api/websocket',
  addTrailingSlash: false,
});

// Handle connections
io.on('connection', socket => {
  console.log(`Client connected: ${socket.id}`);
  
  // Handle transcript messages
  socket.on('transcript', (data) => {
    // Broadcast to all clients
    io.emit('transcript-update', {
      meetingId: data.meetingId,
      text: data.text,
      timestamp: data.timestamp,
    });
  });
});
```

### Client-Side

```typescript
useEffect(() => {
  const initSocket = async () => {
    await fetch('/api/websocket');
    const socketIo = io({
      path: '/api/websocket',
    });

    socketIo.on('transcript-update', (data) => {
      setTranscript(data.text);
      setMeetingId(data.meetingId);
    });

    setSocket(socketIo);
  };

  initSocket();
}, []);
```

## Security Considerations

- WebSocket connections are only established from authenticated users
- Transcript data is not persisted server-side
- The WebSocket server only accepts connections from the same origin

## Limitations

- The WebSocket server is not scalable to multiple instances without additional infrastructure
- No reconnection handling is implemented for WebSocket clients
- No message queue is implemented for handling offline clients
