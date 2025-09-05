// Google Calendar API scopes needed for Meet
const SCOPES = ["https://www.googleapis.com/auth/calendar"];

// OAuth2 credentials from Google Cloud Console
const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URL =
  process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URL ||
  "http://localhost:3000/api/auth/callback/google";

// Helper to check if code is running on server
const isServer = typeof window === "undefined";

/**
 * Create an OAuth2 client with the provided credentials
 * This function should only be called on the server
 */
export const createOAuth2Client = async () => {
  if (!isServer) {
    throw new Error("This function can only be used on the server");
  }

  // Temporarily disabled due to missing googleapis package
  throw new Error(
    "Google APIs functionality is temporarily disabled - googleapis package not installed"
  );

  // const { google } = await import("googleapis");
  // return new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);
};

/**
 * Generate Google OAuth URL for authorization
 * This function should only be called on the server
 */
export const getAuthUrl = async () => {
  if (!isServer) {
    throw new Error("This function can only be used on the server");
  }

  // Temporarily disabled due to missing googleapis package
  throw new Error(
    "Google APIs functionality is temporarily disabled - googleapis package not installed"
  );

  // const oauth2Client = await createOAuth2Client();
  // return oauth2Client.generateAuthUrl({
  //   access_type: "offline",
  //   scope: SCOPES,
  //   prompt: "consent",
  // });
};

/**
 * Exchange authorization code for tokens
 * This function should only be called on the server
 */
export const getTokens = async (code: string) => {
  if (!isServer) {
    throw new Error("This function can only be used on the server");
  }

  // Temporarily disabled due to missing googleapis package
  throw new Error(
    "Google APIs functionality is temporarily disabled - googleapis package not installed"
  );

  // const oauth2Client = await createOAuth2Client();
  // const { tokens } = await oauth2Client.getToken(code);
  // return tokens;
};

/**
 * Create a Google Meet meeting using Google Calendar API
 * This function should only be called on the server
 */
export const createMeeting = async (
  accessToken: string,
  meetingDetails: {
    summary?: string;
    description?: string;
    startTime?: Date;
    endTime?: Date;
  }
) => {
  if (!isServer) {
    throw new Error("This function can only be used on the server");
  }

  // Temporarily disabled due to missing googleapis package
  // Return a mock response for now
  return {
    data: {
      summary: meetingDetails.summary || "Mock Meeting",
      description: meetingDetails.description || "Mock meeting description",
      start: { dateTime: new Date().toISOString() },
      end: { dateTime: new Date(Date.now() + 3600000).toISOString() },
      attendees: [],
      hangoutLink: "https://meet.google.com/mock-meeting-link",
    },
  };
};

// Client-side safe utilities have been moved to meet-utils.ts
