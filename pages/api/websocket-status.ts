import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Simple status endpoint for WebSocket connection testing
  res.status(200).json({ 
    status: 'ok',
    message: 'WebSocket server is available',
    socketPath: '/api/websocket'
  });
}
