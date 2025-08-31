import { NextResponse } from 'next/server';

// Headers to enable CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://meet.google.com',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Meeting-ID, X-Client-Version',
};

// Handler for OPTIONS requests (CORS preflight)
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}

// Simple status endpoint for the Chrome extension to check WebSocket server availability
export async function GET() {
  console.log('WebSocket status check received');
  
  return NextResponse.json({
    status: 'ok',
    message: 'WebSocket server is available',
    timestamp: Date.now(),
    socketIoPath: '/api/websocket',
    server: 'http://localhost:3000',
    wsSupported: true
  }, { 
    headers: corsHeaders 
  });
}
