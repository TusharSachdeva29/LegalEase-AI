import { NextApiRequest } from 'next';
import { NextApiResponseServerIO } from '@/types/next';

export default async function handler(req: NextApiRequest, res: NextApiResponseServerIO) {
  // Upgrade connection to WebSocket
  if (res.socket.server.io) {
    console.log('WebSocket server already set up');
    res.end();
    return;
  }
  
  // If WebSocket server isn't set up yet, the request will be handled by the original handler
  res.end();
}
