import { NextRequest, NextResponse } from 'next/server';
import { getAuthUrl } from '@/lib/meet-api';

export async function GET(req: NextRequest) {
  try {
    const authUrl = await getAuthUrl();
    return NextResponse.json({ authUrl }, { status: 200 });
  } catch (error) {
    console.error('Error generating auth URL:', error);
    return NextResponse.json(
      { error: 'Failed to generate Google authorization URL' },
      { status: 500 }
    );
  }
}
