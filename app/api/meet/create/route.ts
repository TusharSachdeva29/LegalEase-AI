import { NextRequest, NextResponse } from 'next/server';
import { createMeeting } from '@/lib/meet-api';

export async function POST(req: NextRequest) {
  try {
    // Get access token from cookie
    const accessToken = req.cookies.get('google_access_token')?.value;
    
    if (!accessToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Parse meeting details from request body
    const body = await req.json();
    const { summary, description, startTime, endTime } = body;
    
    // Create meeting
    const meetingData = await createMeeting(accessToken, {
      summary,
      description,
      startTime: startTime ? new Date(startTime) : undefined,
      endTime: endTime ? new Date(endTime) : undefined,
    });
    
    return NextResponse.json(meetingData, { status: 200 });
  } catch (error) {
    console.error('Error creating meeting:', error);
    
    // Check if it's an auth error (token expired)
    if (error.message?.includes('auth') || error.message?.includes('token') || error.status === 401) {
      return NextResponse.json(
        { error: 'Authentication failed', requiresAuth: true },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create Google Meet meeting' },
      { status: 500 }
    );
  }
}
