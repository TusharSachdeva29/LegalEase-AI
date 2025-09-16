import { NextApiRequest, NextApiResponse } from 'next';
import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';

interface SocketServer extends HTTPServer {
  io?: SocketIOServer;
}

const SocketHandler = (req: NextApiRequest, res: NextApiResponse & {
  socket: {
    server: SocketServer;
  };
}) => {
  if (res.socket.server.io) {
    console.log('Socket.IO server already running');
  } else {
    console.log('Socket.IO server initializing...');
    
    const io = new SocketIOServer(res.socket.server, {
      path: '/api/websocket',
      addTrailingSlash: false,
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });
    
    res.socket.server.io = io;
    
    io.on('connection', (socket) => {
      console.log('Socket.IO client connected:', socket.id);
      
      socket.on('disconnect', () => {
        console.log('Socket.IO client disconnected:', socket.id);
      });
      
      // Handle transcript events
      socket.on('transcript', (data) => {
        console.log('Received transcript:', data);
        // Broadcast to all clients
        io.emit('transcript', data);
      });
      
      // Handle analysis events
      socket.on('analysis', (data) => {
        console.log('Received analysis:', data);
        // Broadcast to all clients
        io.emit('analysis', data);
      });
      
      // Handle status events
      socket.on('status', (data) => {
        console.log('Received status:', data);
        // Broadcast to all clients
        io.emit('status', data);
      });
    });
    
    console.log('Socket.IO server initialized');
  }
  
  res.end();
};

export default SocketHandler;