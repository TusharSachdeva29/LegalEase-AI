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

// Simple status endpoint to check if the API is running
export async function GET() {
  console.log('Status check received');
  
  return NextResponse.json({
    status: 'ok',
    message: 'API is running',
    timestamp: Date.now(),
    version: '1.0.0',
    features: {
      transcription: true,
      websocket: true,
      chat: true,
    }
  }, { 
    headers: corsHeaders 
  });
}
