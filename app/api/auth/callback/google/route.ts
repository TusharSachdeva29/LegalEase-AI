import { NextRequest, NextResponse } from 'next/server';
import { getTokens } from '@/lib/meet-api';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    
    if (!code) {
      return NextResponse.json(
        { error: 'Authorization code is required' },
        { status: 400 }
      );
    }
    
    const tokens = await getTokens(code);
    
    // In a real application, you'd store these tokens securely,
    // either in a database associated with the user or in an encrypted cookie
    // Here we're setting a secure, httpOnly cookie for the access token
    const response = NextResponse.redirect(new URL('/meet', req.url));
    
    // Set cookies with tokens
    response.cookies.set({
      name: 'google_access_token',
      value: tokens.access_token || '',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: tokens.expiry_date ? Math.floor((tokens.expiry_date - Date.now()) / 1000) : 3600,
      path: '/',
    });
    
    if (tokens.refresh_token) {
      response.cookies.set({
        name: 'google_refresh_token',
        value: tokens.refresh_token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: '/',
      });
    }
    
    return response;
  } catch (error) {
    console.error('Error in OAuth callback:', error);
    return NextResponse.json(
      { error: 'Failed to process Google authorization' },
      { status: 500 }
    );
  }
}
