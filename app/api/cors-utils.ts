/**
 * Centralized CORS configuration for the API
 * This ensures consistent CORS settings across all API routes
 */

// Headers for CORS preflight requests (OPTIONS)
export const corsPreflightHeaders = {
  'Access-Control-Allow-Origin': 'https://meet.google.com',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Meeting-ID, X-Client-Version',
  'Access-Control-Max-Age': '86400' // 24 hours
};

// Headers for regular API responses
export const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://meet.google.com',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Meeting-ID, X-Client-Version'
};

/**
 * Function to handle OPTIONS requests for CORS preflight
 * Import and use this in all API routes that need CORS support
 */
export function handleCorsOptions() {
  return new Response(null, {
    status: 204,
    headers: corsPreflightHeaders
  });
}

/**
 * Creates headers for error responses
 * Ensures CORS headers are included in error responses
 */
export function getErrorResponseHeaders() {
  return corsHeaders;
}
