import { Server } from 'socket.io';
import { NextApiRequest } from 'next';
import { NextApiResponseServerIO } from '@/types/next';

export default async function handler(req: NextApiRequest, res: NextApiResponseServerIO) {
  if (res.socket.server.io) {
    console.log('Socket is already running');
    res.end();
    return;
  }

  console.log('Setting up socket.io server...');
  const io = new Server(res.socket.server, {
    path: '/api/websocket',
    addTrailingSlash: false,
    cors: {
      origin: ["http://localhost:3000", "chrome-extension://*"],
      methods: ["GET", "POST"],
      credentials: true
    },
  });
  
  res.socket.server.io = io;

  io.on('connection', socket => {
    console.log(`Client connected: ${socket.id}`);
    
    socket.on('transcript', (data: { text: string, meetingId: string, timestamp: number }) => {
      console.log(`Received transcript from meeting ${data.meetingId}:`, data.text.substring(0, 50) + '...');
      
      // Broadcast the transcript to all clients (including the web app)
      io.emit('transcript-update', {
        meetingId: data.meetingId,
        text: data.text,
        timestamp: data.timestamp,
      });
    });
    
    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  console.log('Socket.io server started successfully');
  res.end();
}
