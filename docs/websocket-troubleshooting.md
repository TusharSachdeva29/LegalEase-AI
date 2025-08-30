# WebSocket Troubleshooting

## Common Issues

### 404 Error for WebSocket Polling Requests

If you're seeing 404 errors for WebSocket polling requests, here are some possible solutions:

1. **Path Mismatch**: Make sure the client and server Socket.IO configurations use the same path.
   - Server path: `/api/websocket`
   - Client path: `/api/websocket`

2. **CORS Issues**: If you see CORS errors, check that the server allows connections from your Chrome extension.

3. **Server Not Running**: Ensure the Next.js development server is running.

4. **Port Conflicts**: Make sure port 3000 is available and not blocked by firewall.

## How to Debug

1. Check the browser console for errors
2. Look at the Network tab in Chrome DevTools for failed Socket.IO requests
3. Verify that the Socket.IO server is properly configured in `pages/api/websocket.ts`
4. Check that the client's connection parameters match the server's configuration

## Testing WebSocket Connection

You can test the WebSocket connection using the following endpoint:

```
GET http://localhost:3000/api/websocket-status
```

This should return a 200 OK status with information about the WebSocket server.

## Chrome Extension Specific

If the Chrome extension is not connecting:

1. Make sure `http://localhost:3000` is allowed in the extension's host permissions
2. Check that background.html is properly loading the Socket.IO client
3. Verify that the extension is trying to connect with the correct URL and path
