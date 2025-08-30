// Browser-safe utility functions for Meet functionality

/**
 * Extract the meeting code from a Google Meet URL
 * This function is safe to use in both server and client contexts
 */
export const extractMeetCode = (meetLink: string): string => {
  if (!meetLink) return '';
  
  // Extract the meeting code from the URL
  const regex = /meet.google.com\/([a-z-]+)/i;
  const match = meetLink.match(regex);
  
  return match ? match[1] : '';
};

/**
 * Generate a direct join URL for Google Meet
 * This function is safe to use in both server and client contexts
 */
export const generateJoinUrl = (meetCode: string): string => {
  if (!meetCode) return '';
  return `https://meet.google.com/${meetCode}`;
};
