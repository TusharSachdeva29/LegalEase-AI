// Use dynamic import to avoid importing googleapis in the browser
import { type Auth, type calendar_v3 } from 'googleapis';

// Google Calendar API scopes needed for Meet
const SCOPES = ['https://www.googleapis.com/auth/calendar'];

// OAuth2 credentials from Google Cloud Console
const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URL = process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URL || 'http://localhost:3000/api/auth/callback/google';

// Helper to check if code is running on server
const isServer = typeof window === 'undefined';

/**
 * Create an OAuth2 client with the provided credentials
 * This function should only be called on the server
 */
export const createOAuth2Client = async () => {
  if (!isServer) {
    throw new Error('This function can only be used on the server');
  }
  
  const { google } = await import('googleapis');
  
  return new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URL
  );
};

/**
 * Generate Google OAuth URL for authorization
 * This function should only be called on the server
 */
export const getAuthUrl = async () => {
  if (!isServer) {
    throw new Error('This function can only be used on the server');
  }
  
  const oauth2Client = await createOAuth2Client();
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent'
  });
};

/**
 * Exchange authorization code for tokens
 * This function should only be called on the server
 */
export const getTokens = async (code: string) => {
  if (!isServer) {
    throw new Error('This function can only be used on the server');
  }
  
  const oauth2Client = await createOAuth2Client();
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
};

/**
 * Create a Google Meet meeting using Google Calendar API
 * This function should only be called on the server
 */
export const createMeeting = async (accessToken: string, meetingDetails: {
  summary?: string;
  description?: string;
  startTime?: Date;
  endTime?: Date;
}) => {
  if (!isServer) {
    throw new Error('This function can only be used on the server');
  }
  
  const { google } = await import('googleapis');
  
  const oauth2Client = await createOAuth2Client();
  oauth2Client.setCredentials({ access_token: accessToken });
  
  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
  
  // Default values if not provided
  const summary = meetingDetails.summary || 'LegalEase Meeting';
  const description = meetingDetails.description || 'Legal consultation meeting';
  const startTime = meetingDetails.startTime || new Date();
  const endTime = meetingDetails.endTime || new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hour later by default
  
  try {
    const event = await calendar.events.insert({
      calendarId: 'primary',
      conferenceDataVersion: 1,
      requestBody: {
        summary,
        description,
        start: {
          dateTime: startTime.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        end: {
          dateTime: endTime.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        conferenceData: {
          createRequest: {
            requestId: `legalease-${Date.now()}`,
            conferenceSolutionKey: {
              type: 'hangoutsMeet'
            }
          }
        }
      }
    });

    return {
      meetingLink: event.data.hangoutLink,
      meetingId: event.data.id,
      meetingDetails: event.data
    };
  } catch (error) {
    console.error('Error creating Google Meet meeting:', error);
    throw error;
  }
};

// Client-side safe utilities have been moved to meet-utils.ts
