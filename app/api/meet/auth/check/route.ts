import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    // Check if access token cookie exists
    const accessToken = req.cookies.get('google_access_token')?.value;
    
    return NextResponse.json({
      authenticated: !!accessToken,
    }, { status: 200 });
  } catch (error) {
    console.error('Error checking authentication status:', error);
    return NextResponse.json(
      { error: 'Failed to check authentication status', authenticated: false },
      { status: 500 }
    );
  }
}
