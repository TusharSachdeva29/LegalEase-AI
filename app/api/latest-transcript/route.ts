import { NextRequest, NextResponse } from 'next/server';

// In-memory storage for simplicity
let latestTranscript = {
  text: '',
  meetingId: '',
  timestamp: 0
};

export async function GET() {
  return NextResponse.json(latestTranscript, {
    headers: {
      'Access-Control-Allow-Origin': 'https://meet.google.com',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Meeting-ID, X-Client-Version'
    }
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (body.text) {
      latestTranscript = {
        text: body.text,
        meetingId: body.meetingId || 'unknown',
        timestamp: Date.now()
      };
      console.log('Stored latest transcript:', latestTranscript.text.substring(0, 50) + '...');
    }
    
    return NextResponse.json({ success: true }, {
      headers: {
        'Access-Control-Allow-Origin': 'https://meet.google.com',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Meeting-ID, X-Client-Version'
      }
    });
  } catch (error) {
    console.error('Error storing transcript:', error);
    return NextResponse.json({ 
      error: 'Failed to store transcript',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { 
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': 'https://meet.google.com',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Meeting-ID, X-Client-Version'
      }
    });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': 'https://meet.google.com',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Meeting-ID, X-Client-Version',
      'Access-Control-Max-Age': '86400'
    }
  });
}
