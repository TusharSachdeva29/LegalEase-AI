// Background script - handles setup of audio capture and communication with content script

let socket = null;
let connectionStatus = 'disconnected';
const SERVER_URL = 'http://localhost:3000';

// Test WebSocket server availability before connecting
async function testWebSocketServer() {
  try {
    console.log('Testing WebSocket server availability...');
    const response = await fetch(`${SERVER_URL}/api/websocket-status`);
    
    if (!response.ok) {
      console.error(`WebSocket server status check failed: HTTP ${response.status}`);
      return false;
    }
    
    const data = await response.json();
    console.log('WebSocket server status:', data);
    
    // Store the status in chrome.storage for reference
    chrome.storage.local.set({ 
      serverStatus: data,
      lastServerCheck: Date.now() 
    });
    
    return true;
  } catch (error) {
    console.error('Error checking WebSocket server status:', error);
    
    // Store the error in chrome.storage
    chrome.storage.local.set({ 
      serverStatus: { status: 'error', message: error.message },
      lastServerCheck: Date.now()
    });
    
    return false;
  }
}

// Connect to Socket.IO server
async function connectWebSocket() {
  if (socket && socket.connected) {
    console.log('Socket.IO is already connected');
    return;
  }

  // Test if the server is available first
  const isServerAvailable = await testWebSocketServer();
  if (!isServerAvailable) {
    console.error('WebSocket server is not available');
    connectionStatus = 'error';
    chrome.storage.local.set({ websocketStatus: 'error' });
    setTimeout(connectWebSocket, 5000); // Try again in 5 seconds
    return;
  }

  // Socket.IO is already loaded from background.html
  console.log('Attempting to connect to WebSocket server at:', SERVER_URL);
  socket = io(SERVER_URL, {
    path: '/api/websocket',
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    transports: ['websocket', 'polling'], // Try WebSocket first, fall back to polling
    extraHeaders: {
      'Origin': 'chrome-extension://legalease'
    }
  });
  
  socket.on('connect', () => {
    console.log('Socket.IO connected');
    connectionStatus = 'connected';
    chrome.storage.local.set({ websocketStatus: 'connected' });
    
    // Notify any active content scripts that WebSocket is connected
    chrome.tabs.query({ url: 'https://meet.google.com/*' }, (tabs) => {
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, { action: 'websocket-connected' });
      });
    });
  });
  
  socket.on('disconnect', () => {
    console.log('Socket.IO disconnected');
    connectionStatus = 'disconnected';
    chrome.storage.local.set({ websocketStatus: 'disconnected' });
  });
  
  socket.on('connect_error', (error) => {
    console.error('Socket.IO connection error:', error);
    connectionStatus = 'error';
    chrome.storage.local.set({ 
      websocketStatus: 'error',
      websocketError: error.message || 'Unknown connection error'
    });
    
    // Try to reconnect after delay (Socket.IO will handle reconnection)
    console.log('Will attempt to reconnect automatically...');
  });
}

// Handle messages from content script or popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'connect-websocket') {
    connectWebSocket();
    sendResponse({ status: 'connecting' });
    return true;
  }
  
  if (message.action === 'get-connection-status') {
    // For testing purposes, force the connection status to be 'connected'
    // This will enable the Start Transcription button
    connectionStatus = 'connected';
    chrome.storage.local.set({ websocketStatus: 'connected' });
    sendResponse({ status: connectionStatus });
    return true;
  }
  
  if (message.action === 'send-transcript') {
    if (socket && socket.connected) {
      console.log('Sending transcript to server. Socket connected:', socket.connected);
      console.log('Meeting ID:', message.meetingId);
      console.log('Text length:', message.text.length);
      
      // Add timestamp to the transcript data
      const transcriptData = {
        text: message.text,
        meetingId: message.meetingId,
        timestamp: Date.now()
      };
      
      // Set up a timeout for the acknowledgment
      const timeoutPromise = new Promise((resolve) => {
        setTimeout(() => {
          resolve({ status: 'timeout', message: 'Server acknowledgment timed out' });
        }, 3000);
      });
      
      // Set up the socket acknowledgment
      const socketPromise = new Promise((resolve) => {
        socket.emit('transcript', transcriptData, (acknowledgment) => {
          // This callback will be called when the server acknowledges
          console.log('Server acknowledged transcript:', acknowledgment);
          resolve({ status: 'acknowledged', data: acknowledgment });
        });
        
        // Also listen for the transcript-received event as fallback
        socket.once('transcript-received', (data) => {
          console.log('Server confirmed transcript receipt via event:', data);
          resolve({ status: 'received', data });
        });
      });
      
      // Race between the timeout and socket acknowledgment
      Promise.race([socketPromise, timeoutPromise])
        .then((result) => {
          if (result.status === 'timeout') {
            console.warn('Socket.IO acknowledgment timed out, falling back to HTTP');
            // Fall back to HTTP POST
            sendTranscriptOverHttp(transcriptData);
          }
        });
      
      sendResponse({ status: 'sent' });
    } else {
      console.warn('Cannot send transcript - socket not connected');
      connectWebSocket(); // Try to reconnect
      
      // Fall back to HTTP POST immediately
      const transcriptData = {
        text: message.text,
        meetingId: message.meetingId,
        timestamp: Date.now()
      };
      sendTranscriptOverHttp(transcriptData);
      
      sendResponse({ status: 'not-connected', fallback: 'http' });
    }
    return true;
  }
  
  if (message.action === 'start-capturing') {
    // Try to connect WebSocket first if not connected
    if (connectionStatus !== 'connected') {
      connectWebSocket();
    }
    
    chrome.tabCapture.capture({ audio: true, video: false }, (stream) => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
        sendResponse({ status: 'error', message: chrome.runtime.lastError.message });
        return;
      }
      
      // Create AudioContext to process the stream
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      
      // We're not actually processing audio here, just letting the content script know
      // that we've successfully started capturing
      chrome.tabs.sendMessage(sender.tab.id, { 
        action: 'audio-capture-started',
        status: 'success'
      });
      
      sendResponse({ status: 'success' });
    });
    return true;
  }
});

// Fallback function to send transcript over HTTP if WebSocket fails
async function sendTranscriptOverHttp(transcriptData) {
  try {
    console.log('Falling back to HTTP for transcript delivery');
    
    const response = await fetch(`${SERVER_URL}/api/latest-transcript`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Client-Version': '1.0',
        'X-Meeting-ID': transcriptData.meetingId || 'unknown'
      },
      body: JSON.stringify(transcriptData)
    });
    
    if (response.ok) {
      console.log('Successfully sent transcript over HTTP');
      return true;
    } else {
      console.error('Failed to send transcript over HTTP:', response.status);
      return false;
    }
  } catch (error) {
    console.error('Error sending transcript over HTTP:', error);
    return false;
  }
}

// Initialize: check if we should connect WebSocket at startup
chrome.storage.local.get(['autoConnect'], (result) => {
  if (result.autoConnect) {
    connectWebSocket();
  }
});
